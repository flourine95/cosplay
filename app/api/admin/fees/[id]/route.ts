import { NextResponse } from "next/server"
import { Prisma } from "@/app/generated/prisma/client"
import { UserRole } from "@/app/generated/prisma/enums"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { adminFeeSchema } from "@/schemas/admin-fee"

interface RouteContext {
  params: Promise<{ id: string }>
}

const requireAdmin = async () => {
  const user = await getSession()
  return user?.role === UserRole.ADMIN ? user : null
}

const parseFeeId = async ({ params }: RouteContext): Promise<number> => {
  const { id } = await params
  const feeId = Number(id)
  if (!Number.isInteger(feeId) || feeId <= 0) {
    throw new Error("Invalid fee id")
  }
  return feeId
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const feeId = await parseFeeId(context)
    const body = await request.json()
    const parsed = adminFeeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
        { status: 400 }
      )
    }

    const { data } = parsed
    const fee = await prisma.systemFee.update({
      where: { id: feeId },
      data: {
        name: data.name,
        description: data.description || null,
        feeType: data.feeType,
        feeValue: new Prisma.Decimal(data.feeValue),
        isActive: data.isActive,
      },
    })

    return NextResponse.json({ data: fee })
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid fee id") {
      return NextResponse.json(
        { error: "Mã phí không hợp lệ" },
        { status: 400 }
      )
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Không tìm thấy phí" }, { status: 404 })
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json({ error: "Mã phí đã tồn tại" }, { status: 409 })
    }

    console.error("PATCH /api/admin/fees/[id] error:", error)
    return NextResponse.json(
      { error: "Không thể cập nhật phí" },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const feeId = await parseFeeId(context)
    await prisma.systemFee.delete({ where: { id: feeId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid fee id") {
      return NextResponse.json(
        { error: "Mã phí không hợp lệ" },
        { status: 400 }
      )
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Không tìm thấy phí" }, { status: 404 })
    }

    console.error("DELETE /api/admin/fees/[id] error:", error)
    return NextResponse.json({ error: "Không thể xóa phí" }, { status: 500 })
  }
}

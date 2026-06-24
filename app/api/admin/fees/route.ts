import { NextResponse } from "next/server"
import { Prisma } from "@/app/generated/prisma/client"
import { UserRole } from "@/app/generated/prisma/enums"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { adminFeeSchema } from "@/schemas/admin-fee"

const requireAdmin = async () => {
  const user = await getSession()
  return user?.role === UserRole.ADMIN ? user : null
}

export async function GET() {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const fees = await prisma.systemFee.findMany({
      orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
    })

    return NextResponse.json({ data: fees })
  } catch (error) {
    console.error("GET /api/admin/fees error:", error)
    return NextResponse.json(
      { error: "Không thể lấy danh sách phí" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const parsed = adminFeeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
        { status: 400 }
      )
    }

    const { data } = parsed
    const fee = await prisma.systemFee.create({
      data: {
        name: data.name,
        description: data.description || null,
        feeType: data.feeType,
        feeValue: new Prisma.Decimal(data.feeValue),
        isActive: data.isActive,
      },
    })

    return NextResponse.json({ data: fee }, { status: 201 })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json({ error: "Mã phí đã tồn tại" }, { status: 409 })
    }

    console.error("POST /api/admin/fees error:", error)
    return NextResponse.json({ error: "Không thể tạo phí" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { z } from "zod"
import {
  SellerStatus,
  UserRole,
  UserStatus,
} from "@/app/generated/prisma/enums"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface RouteContext {
  params: Promise<{ id: string }>
}

const sellerStatusSchema = z.object({
  sellerStatus: z.enum(SellerStatus, {
    error: "Trạng thái seller không hợp lệ",
  }),
})

const requireAdmin = async () => {
  const user = await getSession()
  return user?.role === UserRole.ADMIN ? user : null
}

const parseSellerId = async ({ params }: RouteContext): Promise<number> => {
  const { id } = await params
  const sellerId = Number(id)
  if (!Number.isInteger(sellerId) || sellerId <= 0) {
    throw new Error("Invalid seller id")
  }
  return sellerId
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

    const sellerId = await parseSellerId(context)
    const body = await request.json()
    const parsed = sellerStatusSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
        { status: 400 }
      )
    }

    const { sellerStatus } = parsed.data
    const seller = await prisma.user.findFirst({
      where: { id: sellerId, role: UserRole.SELLER },
      select: { id: true },
    })

    if (!seller) {
      return NextResponse.json(
        { error: "Không tìm thấy seller" },
        { status: 404 }
      )
    }

    const updated = await prisma.user.update({
      where: { id: sellerId },
      data: {
        sellerStatus,
        sellerApprovedAt:
          sellerStatus === SellerStatus.APPROVED ? new Date() : null,
        sellerApprovedBy:
          sellerStatus === SellerStatus.APPROVED ? admin.id : null,
        status:
          sellerStatus === SellerStatus.SUSPENDED
            ? UserStatus.SUSPENDED
            : UserStatus.ACTIVE,
      },
      select: {
        id: true,
        sellerStatus: true,
        status: true,
        sellerApprovedAt: true,
      },
    })

    if (sellerStatus === SellerStatus.SUSPENDED) {
      await prisma.session.deleteMany({ where: { userId: sellerId } })
    }

    return NextResponse.json({ data: updated })
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid seller id") {
      return NextResponse.json(
        { error: "Mã seller không hợp lệ" },
        { status: 400 }
      )
    }

    console.error("PATCH /api/admin/sellers/[id]/status error:", error)
    return NextResponse.json(
      { error: "Không thể cập nhật trạng thái seller" },
      { status: 500 }
    )
  }
}

import { NextResponse } from "next/server"
import { Prisma } from "@/app/generated/prisma/client"
import {
  EscrowStatus,
  OrderStatus,
  PaymentStatus,
  PayoutStatus,
  ReturnStatus,
  UserRole,
} from "@/app/generated/prisma/enums"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { adminCreatePayoutSchema } from "@/schemas/admin-payout"

const requireAdmin = async () => {
  const user = await getSession()
  return user?.role === UserRole.ADMIN ? user : null
}

const getPlatformCommissionRate = async () => {
  const fee = await prisma.systemFee.findFirst({
    where: {
      name: "platform_commission",
      feeType: "percentage",
      isActive: true,
    },
    select: { feeValue: true },
  })

  return fee ? Number(fee.feeValue) : 10
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

    const payouts = await prisma.sellerPayout.findMany({
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            shopName: true,
            bankName: true,
            bankAccount: true,
            bankAccountName: true,
          },
        },
        orders: {
          select: { id: true, orderNumber: true, total: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ data: payouts })
  } catch (error) {
    console.error("GET /api/admin/payouts error:", error)
    return NextResponse.json(
      { error: "Không thể lấy danh sách payout" },
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
    const parsed = adminCreatePayoutSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
        { status: 400 }
      )
    }

    const commissionRate = await getPlatformCommissionRate()
    const payout = await prisma.$transaction(async (tx) => {
      const orders = await tx.order.findMany({
        where: {
          sellerId: parsed.data.sellerId,
          status: OrderStatus.COMPLETED,
          paymentStatus: PaymentStatus.PAID,
          escrowStatus: EscrowStatus.HOLDING,
          payoutId: null,
          returnRequests: {
            none: {
              status: {
                in: [
                  ReturnStatus.PENDING,
                  ReturnStatus.APPROVED,
                  ReturnStatus.SHIPPING_BACK,
                  ReturnStatus.RECEIVED,
                ],
              },
            },
          },
        },
        select: { id: true, total: true },
      })

      if (orders.length === 0) {
        throw new Error("NO_ELIGIBLE_ORDERS")
      }

      const seller = await tx.user.findUnique({
        where: { id: parsed.data.sellerId },
        select: {
          id: true,
          bankName: true,
          bankAccount: true,
          bankAccountName: true,
        },
      })

      if (!seller) throw new Error("SELLER_NOT_FOUND")

      const amount = orders.reduce(
        (sum, order) => sum.add(order.total),
        new Prisma.Decimal(0)
      )
      const platformFee = amount.mul(commissionRate).div(100)
      const netAmount = amount.sub(platformFee)

      const created = await tx.sellerPayout.create({
        data: {
          sellerId: seller.id,
          amount,
          platformFee,
          netAmount,
          status: PayoutStatus.PROCESSING,
          bankName: seller.bankName,
          bankAccount: seller.bankAccount,
          bankAccountName: seller.bankAccountName,
          processedBy: admin.id,
        },
      })

      await tx.order.updateMany({
        where: { id: { in: orders.map((order) => order.id) } },
        data: { payoutId: created.id },
      })

      return created
    })

    return NextResponse.json({ data: payout }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === "NO_ELIGIBLE_ORDERS") {
      return NextResponse.json(
        { error: "Seller không có đơn completed đang giữ escrow" },
        { status: 400 }
      )
    }
    if (error instanceof Error && error.message === "SELLER_NOT_FOUND") {
      return NextResponse.json(
        { error: "Không tìm thấy seller" },
        { status: 404 }
      )
    }

    console.error("POST /api/admin/payouts error:", error)
    return NextResponse.json({ error: "Không thể tạo payout" }, { status: 500 })
  }
}

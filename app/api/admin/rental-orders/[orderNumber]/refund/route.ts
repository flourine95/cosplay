import { NextResponse } from "next/server"
import {
  NotificationType,
  PaymentMethod,
  PaymentStatus,
  PaymentType,
  RentalStatus,
  UserRole,
} from "@/app/generated/prisma/enums"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rentalOrderInclude, serializeRentalOrder } from "@/lib/rental-order"

type RouteContext = {
  params: Promise<{ orderNumber: string }>
}

const requireAdmin = async () => {
  const user = await getSession()
  return user?.role === UserRole.ADMIN ? user : null
}

export async function PATCH(_request: Request, { params }: RouteContext) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: "Khong co quyen truy cap" },
        { status: 403 }
      )
    }

    const { orderNumber } = await params
    const existing = await prisma.rentalOrder.findUnique({
      where: { orderNumber },
      include: rentalOrderInclude,
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Khong tim thay don thue" },
        { status: 404 }
      )
    }

    if (existing.status !== RentalStatus.DEPOSIT_REFUNDED) {
      return NextResponse.json(
        { error: "Don thue chua san sang de admin hoan coc" },
        { status: 400 }
      )
    }

    const refundAmount = existing.refundAmount.toNumber()
    const order = await prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          rentalOrderId: existing.id,
          amount: refundAmount,
          paymentMethod: PaymentMethod.BANK_TRANSFER,
          paymentType: PaymentType.RENTAL_DEPOSIT,
          status: PaymentStatus.REFUNDED,
          transactionId: `RENTAL-REFUND-MOCK-${existing.id}-${Date.now()}`,
          transactionData: {
            source: "admin_mock",
            note: "Admin refunded rental deposit to customer.",
            refundAmount,
            lateFee: existing.lateFee.toNumber(),
            damageFee: existing.damageFee.toNumber(),
          },
          paidAt: new Date(),
        },
      })

      return tx.rentalOrder.update({
        where: { id: existing.id },
        data: {
          status: RentalStatus.COMPLETED,
          completedAt: new Date(),
        },
        include: rentalOrderInclude,
      })
    })

    await prisma.notification.createMany({
      data: [
        {
          userId: existing.userId,
          type: NotificationType.RENTAL,
          title: "Admin da hoan coc",
          content: `Don ${existing.orderNumber} da hoan tat. Ban nhan lai ${refundAmount.toLocaleString("vi-VN")} VND tien coc.`,
          link: "/rental/management",
          data: {
            rentalOrderId: existing.id,
            orderNumber: existing.orderNumber,
          },
        },
        {
          userId: existing.rentalItem.sellerId,
          type: NotificationType.RENTAL,
          title: "Don thue da hoan tat",
          content: `Admin da hoan coc cho khach va ket thuc don ${existing.orderNumber}.`,
          link: "/seller/rentals",
          data: {
            rentalOrderId: existing.id,
            orderNumber: existing.orderNumber,
          },
        },
      ],
    })

    return NextResponse.json({ data: serializeRentalOrder(order) })
  } catch (error) {
    console.error(
      "PATCH /api/admin/rental-orders/[orderNumber]/refund error:",
      error
    )
    return NextResponse.json(
      { error: "Khong the hoan coc don thue" },
      { status: 500 }
    )
  }
}

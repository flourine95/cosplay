import { NextResponse } from "next/server"
import {
  CustomOrderStatus,
  NotificationType,
  PaymentMethod,
  PaymentStatus,
  PaymentType,
} from "@/app/generated/prisma/enums"
import { getSession } from "@/lib/auth"
import {
  customerCustomOrderInclude,
  serializeCustomerCustomOrder,
} from "@/lib/customer-custom-order"
import { prisma } from "@/lib/prisma"

type RouteContext = {
  params: Promise<{ id: string }>
}

const parseId = (value: string) => {
  const id = Number(value)
  if (!Number.isInteger(id) || id <= 0) throw new Error("INVALID_ID")
  return id
}

const loadCustomerOrder = async (orderId: number) =>
  prisma.customOrder.findUnique({
    where: { id: orderId },
    include: { quotes: true },
  })

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Chua dang nhap" }, { status: 401 })
    }

    const { id } = await params
    const orderId = parseId(id)
    const order = await prisma.customOrder.findUnique({
      where: { id: orderId },
      include: customerCustomOrderInclude,
    })

    if (!order || order.userId !== user.id) {
      return NextResponse.json(
        { error: "Khong tim thay don dat may" },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: serializeCustomerCustomOrder(order) })
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_ID") {
      return NextResponse.json(
        { error: "Ma don dat may khong hop le" },
        { status: 400 }
      )
    }
    console.error("GET /api/custom-orders/[id] error:", error)
    return NextResponse.json(
      { error: "Khong the lay don dat may" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Chua dang nhap" }, { status: 401 })
    }

    const { id } = await params
    const orderId = parseId(id)
    const body = await request.json()
    const action = String(body.action ?? "")

    if (
      !["acceptQuote", "payDeposit", "payFinal", "confirmReceived"].includes(
        action
      )
    ) {
      return NextResponse.json(
        { error: "Hanh dong don dat may khong hop le" },
        { status: 400 }
      )
    }

    const existing = await loadCustomerOrder(orderId)
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json(
        { error: "Khong tim thay don dat may" },
        { status: 404 }
      )
    }

    if (action === "acceptQuote") {
      const quoteId = Number(body.quoteId)
      if (!Number.isInteger(quoteId)) {
        return NextResponse.json(
          { error: "Du lieu nhan bao gia khong hop le" },
          { status: 400 }
        )
      }

      if (existing.status !== CustomOrderStatus.QUOTED) {
        return NextResponse.json(
          { error: "Chi co the nhan bao gia khi seller da bao gia" },
          { status: 400 }
        )
      }

      const quote = existing.quotes.find((item) => item.id === quoteId)
      if (!quote) {
        return NextResponse.json(
          { error: "Khong tim thay bao gia" },
          { status: 404 }
        )
      }

      const order = await prisma.$transaction(async (tx) => {
        await tx.customOrderQuote.updateMany({
          where: { customOrderId: orderId },
          data: { isAccepted: false, isRejected: true },
        })

        await tx.customOrderQuote.update({
          where: { id: quoteId },
          data: { isAccepted: true, isRejected: false },
        })

        await tx.customOrder.update({
          where: { id: orderId },
          data: {
            status: CustomOrderStatus.QUOTE_ACCEPTED,
            estimatedPrice: quote.quotedPrice,
            depositAmount: quote.depositAmount,
            finalAmount: quote.quotedPrice,
          },
        })

        await tx.notification.create({
          data: {
            userId: existing.sellerId,
            type: NotificationType.CUSTOM_ORDER,
            title: "Khach da nhan bao gia",
            content: `Khach da nhan bao gia cho don ${existing.orderNumber}.`,
            link: "/seller/tailoring",
            data: { customOrderId: orderId, quoteId },
          },
        })

        return tx.customOrder.findUniqueOrThrow({
          where: { id: orderId },
          include: customerCustomOrderInclude,
        })
      })

      return NextResponse.json({ data: serializeCustomerCustomOrder(order) })
    }

    if (action === "payDeposit" || action === "payFinal") {
      const isDeposit = action === "payDeposit"
      const totalDue =
        Number(existing.finalAmount ?? 0) + Number(existing.shippingFee ?? 0)
      const amount = isDeposit
        ? Number(existing.depositAmount ?? 0)
        : Math.max(
            totalDue -
              Math.max(
                Number(existing.totalPaid),
                Number(existing.depositAmount ?? 0)
              ),
            0
          )

      if (amount <= 0) {
        return NextResponse.json(
          { error: "Don nay khong con so tien can thanh toan" },
          { status: 400 }
        )
      }

      if (isDeposit && existing.status !== CustomOrderStatus.QUOTE_ACCEPTED) {
        return NextResponse.json(
          { error: "Chi co the dat coc sau khi nhan bao gia" },
          { status: 400 }
        )
      }

      if (!isDeposit && existing.status !== CustomOrderStatus.READY) {
        return NextResponse.json(
          { error: "Chi co the thanh toan phan con lai khi don san sang giao" },
          { status: 400 }
        )
      }

      const order = await prisma.$transaction(async (tx) => {
        await tx.payment.create({
          data: {
            customOrderId: orderId,
            amount,
            paymentMethod: PaymentMethod.BANK_TRANSFER,
            paymentType: isDeposit
              ? PaymentType.CUSTOM_DEPOSIT
              : PaymentType.CUSTOM_FINAL,
            status: PaymentStatus.PAID,
            transactionId: `TAIL-${orderId}-${Date.now()}`,
            transactionData: { source: "mock", action },
            paidAt: new Date(),
          },
        })

        await tx.customOrder.update({
          where: { id: orderId },
          data: {
            status: isDeposit
              ? CustomOrderStatus.DEPOSIT_PAID
              : existing.status,
            totalPaid: { increment: amount },
          },
        })

        await tx.notification.create({
          data: {
            userId: existing.sellerId,
            type: NotificationType.CUSTOM_ORDER,
            title: isDeposit
              ? "Khach da dat coc"
              : "Khach da thanh toan phan con lai",
            content: `Don ${existing.orderNumber} da ghi nhan thanh toan ${amount.toLocaleString("vi-VN")} VND.`,
            link: "/seller/tailoring",
            data: { customOrderId: orderId, amount, action },
          },
        })

        return tx.customOrder.findUniqueOrThrow({
          where: { id: orderId },
          include: customerCustomOrderInclude,
        })
      })

      return NextResponse.json({ data: serializeCustomerCustomOrder(order) })
    }

    const unpaidAmount = Math.max(
      Number(existing.finalAmount ?? 0) +
        Number(existing.shippingFee ?? 0) -
        Number(existing.totalPaid),
      0
    )

    if (existing.status !== CustomOrderStatus.READY || !existing.trackingCode) {
      return NextResponse.json(
        { error: "Don nay chua co thong tin giao hang de xac nhan" },
        { status: 400 }
      )
    }

    if (unpaidAmount > 0) {
      return NextResponse.json(
        { error: "Vui long thanh toan phan con lai truoc khi xac nhan" },
        { status: 400 }
      )
    }

    const order = await prisma.$transaction(async (tx) => {
      await tx.customOrder.update({
        where: { id: orderId },
        data: {
          status: CustomOrderStatus.COMPLETED,
          completedAt: new Date(),
        },
      })

      await tx.customOrderProgress.create({
        data: {
          customOrderId: orderId,
          title: "Khach da xac nhan nhan hang",
          description:
            "Don dat may da hoan tat. Tien duoc ghi nhan vao doanh thu seller.",
          images: [],
          videos: [],
          progressPercent: 100,
        },
      })

      await tx.notification.create({
        data: {
          userId: existing.sellerId,
          type: NotificationType.CUSTOM_ORDER,
          title: "Don dat may da hoan tat",
          content: `Khach da xac nhan nhan hang cho don ${existing.orderNumber}.`,
          link: "/seller/revenue",
          data: { customOrderId: orderId },
        },
      })

      return tx.customOrder.findUniqueOrThrow({
        where: { id: orderId },
        include: customerCustomOrderInclude,
      })
    })

    return NextResponse.json({ data: serializeCustomerCustomOrder(order) })
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_ID") {
      return NextResponse.json(
        { error: "Ma don dat may khong hop le" },
        { status: 400 }
      )
    }
    console.error("PATCH /api/custom-orders/[id] error:", error)
    return NextResponse.json(
      { error: "Khong the cap nhat don dat may" },
      { status: 500 }
    )
  }
}

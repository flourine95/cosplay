import { NextResponse } from "next/server"
import { OrderStatus } from "@/app/generated/prisma/enums"
import { requireSeller } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  allowedOrderTransitions,
  orderStatusLabels,
  sellerOrderInclude,
  serializeSellerOrder,
} from "@/lib/seller-order"
import { sellerOrderStatusSchema } from "@/schemas/seller-order"

const parseOrderId = (value: string): number => {
  const id = Number(value)
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid order id")
  }
  return id
}

const invalidIdResponse = () =>
  NextResponse.json({ error: "Mã đơn hàng không hợp lệ" }, { status: 400 })

const timestampForStatus = (status: OrderStatus) => {
  const now = new Date()
  switch (status) {
    case OrderStatus.CONFIRMED:
      return { confirmedAt: now }
    case OrderStatus.SHIPPING:
      return { shippedAt: now }
    case OrderStatus.DELIVERED:
      return { deliveredAt: now }
    case OrderStatus.COMPLETED:
      return { completedAt: now }
    case OrderStatus.CANCELLED:
      return { cancelledAt: now }
    default:
      return {}
  }
}

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/seller/orders/[id]/status">
) {
  try {
    const seller = await requireSeller()
    if (!seller) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const { id } = await ctx.params
    const orderId = parseOrderId(id)
    const body = await request.json()
    const parsed = sellerOrderStatusSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
        { status: 400 }
      )
    }

    const existing = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, sellerId: true, status: true },
    })

    if (!existing || existing.sellerId !== seller.id) {
      return NextResponse.json(
        { error: "Không tìm thấy đơn hàng" },
        { status: 404 }
      )
    }

    const nextStatus = parsed.data.status
    if (nextStatus === existing.status) {
      const order = await prisma.order.findUniqueOrThrow({
        where: { id: orderId },
        include: sellerOrderInclude,
      })
      return NextResponse.json({ data: serializeSellerOrder(order) })
    }

    if (!allowedOrderTransitions[existing.status].includes(nextStatus)) {
      return NextResponse.json(
        {
          error: `Không thể chuyển từ ${orderStatusLabels[existing.status]} sang ${orderStatusLabels[nextStatus]}`,
        },
        { status: 400 }
      )
    }

    const order = await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: nextStatus,
          ...timestampForStatus(nextStatus),
          statusHistory: {
            create: {
              status: nextStatus,
              note: parsed.data.note,
              createdBy: seller.id,
            },
          },
        },
      })

      return tx.order.findUniqueOrThrow({
        where: { id: orderId },
        include: sellerOrderInclude,
      })
    })

    return NextResponse.json({ data: serializeSellerOrder(order) })
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid order id") {
      return invalidIdResponse()
    }
    console.error("PATCH /api/seller/orders/[id]/status error:", error)
    return NextResponse.json(
      { error: "Không thể cập nhật trạng thái đơn hàng" },
      { status: 500 }
    )
  }
}

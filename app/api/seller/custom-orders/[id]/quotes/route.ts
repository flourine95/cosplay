import { NextResponse } from "next/server"
import {
  CustomOrderStatus,
  NotificationType,
} from "@/app/generated/prisma/enums"
import { requireSeller } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  sellerCustomOrderInclude,
  serializeSellerCustomOrder,
} from "@/lib/seller-custom-order"
import { sellerCustomQuoteSchema } from "@/schemas/seller-custom-order"

const parseCustomOrderId = (value: string): number => {
  const id = Number(value)
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid custom order id")
  }
  return id
}

const invalidIdResponse = () =>
  NextResponse.json({ error: "Mã đơn đặt may không hợp lệ" }, { status: 400 })

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/seller/custom-orders/[id]/quotes">
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
    const customOrderId = parseCustomOrderId(id)
    const body = await request.json()
    const parsed = sellerCustomQuoteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
        { status: 400 }
      )
    }

    const existing = await prisma.customOrder.findUnique({
      where: { id: customOrderId },
      select: {
        id: true,
        userId: true,
        sellerId: true,
        status: true,
        orderNumber: true,
      },
    })

    if (!existing || existing.sellerId !== seller.id) {
      return NextResponse.json(
        { error: "Không tìm thấy đơn đặt may" },
        { status: 404 }
      )
    }

    if (
      existing.status !== CustomOrderStatus.SUBMITTED &&
      existing.status !== CustomOrderStatus.QUOTED
    ) {
      return NextResponse.json(
        { error: "Chỉ có thể báo giá cho đơn đang chờ báo giá" },
        { status: 400 }
      )
    }

    const { data } = parsed
    const order = await prisma.$transaction(async (tx) => {
      await tx.customOrderQuote.create({
        data: {
          customOrderId,
          sellerId: seller.id,
          quotedPrice: data.quotedPrice,
          depositAmount: data.depositAmount,
          estimatedDays: data.estimatedDays,
          description: data.description,
        },
      })

      await tx.customOrder.update({
        where: { id: customOrderId },
        data: {
          status: CustomOrderStatus.QUOTED,
          estimatedPrice: data.quotedPrice,
          depositAmount: data.depositAmount,
          finalAmount: data.quotedPrice,
        },
      })

      await tx.notification.create({
        data: {
          userId: existing.userId,
          type: NotificationType.CUSTOM_ORDER,
          title: "Seller đã gửi báo giá",
          content: `Đơn đặt may ${existing.orderNumber} đã có báo giá mới.`,
          link: `/custom-order/${existing.id}`,
          data: { customOrderId: existing.id },
        },
      })

      return tx.customOrder.findUniqueOrThrow({
        where: { id: customOrderId },
        include: sellerCustomOrderInclude,
      })
    })

    return NextResponse.json({ data: serializeSellerCustomOrder(order) })
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid custom order id") {
      return invalidIdResponse()
    }
    console.error("POST /api/seller/custom-orders/[id]/quotes error:", error)
    return NextResponse.json(
      { error: "Không thể gửi báo giá" },
      { status: 500 }
    )
  }
}

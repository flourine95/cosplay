import { NextResponse } from "next/server"
import { requireSeller } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sellerOrderInclude, serializeSellerOrder } from "@/lib/seller-order"

const parseOrderId = (value: string): number => {
  const id = Number(value)
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid order id")
  }
  return id
}

const invalidIdResponse = () =>
  NextResponse.json({ error: "Mã đơn hàng không hợp lệ" }, { status: 400 })

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/seller/orders/[id]">
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

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: sellerOrderInclude,
    })

    if (!order || order.sellerId !== seller.id) {
      return NextResponse.json(
        { error: "Không tìm thấy đơn hàng" },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: serializeSellerOrder(order) })
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid order id") {
      return invalidIdResponse()
    }
    console.error("GET /api/seller/orders/[id] error:", error)
    return NextResponse.json(
      { error: "Không thể lấy đơn hàng" },
      { status: 500 }
    )
  }
}

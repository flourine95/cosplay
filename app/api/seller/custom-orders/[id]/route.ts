import { NextResponse } from "next/server"
import { requireSeller } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  sellerCustomOrderInclude,
  serializeSellerCustomOrder,
} from "@/lib/seller-custom-order"

const parseCustomOrderId = (value: string): number => {
  const id = Number(value)
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid custom order id")
  }
  return id
}

const invalidIdResponse = () =>
  NextResponse.json({ error: "Mã đơn đặt may không hợp lệ" }, { status: 400 })

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/seller/custom-orders/[id]">
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

    const order = await prisma.customOrder.findUnique({
      where: { id: customOrderId },
      include: sellerCustomOrderInclude,
    })

    if (!order || order.sellerId !== seller.id) {
      return NextResponse.json(
        { error: "Không tìm thấy đơn đặt may" },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: serializeSellerCustomOrder(order) })
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid custom order id") {
      return invalidIdResponse()
    }
    console.error("GET /api/seller/custom-orders/[id] error:", error)
    return NextResponse.json(
      { error: "Không thể lấy đơn đặt may" },
      { status: 500 }
    )
  }
}

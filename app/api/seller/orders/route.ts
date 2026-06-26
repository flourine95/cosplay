import { NextResponse } from "next/server"
import { OrderStatus } from "@/app/generated/prisma/enums"
import { requireSeller } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sellerOrderInclude, serializeSellerOrder } from "@/lib/seller-order"

export async function GET(request: Request) {
  try {
    const seller = await requireSeller()
    if (!seller) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const type = searchParams.get("type")

    const statusFilter =
      status && Object.values(OrderStatus).includes(status as OrderStatus)
        ? (status as OrderStatus)
        : undefined

    const orders = await prisma.order.findMany({
      where: {
        sellerId: seller.id,
        status: statusFilter,
        ...(type === "sale"
          ? { items: { every: { product: { type: "SALE" } } } }
          : {}),
        ...(type === "rental"
          ? {
              items: {
                some: { product: { type: { in: ["RENTAL", "BOTH"] } } },
              },
            }
          : {}),
      },
      include: sellerOrderInclude,
      orderBy: { createdAt: "desc" },
    })

    const data = orders.map(serializeSellerOrder)
    return NextResponse.json({
      data: {
        orders: data,
        stats: {
          total: data.length,
          sale: data.filter((order) => order.orderType === "SALE").length,
          rental: data.filter((order) => order.orderType === "RENTAL").length,
          byStatus: Object.fromEntries(
            Object.values(OrderStatus).map((orderStatus) => [
              orderStatus,
              data.filter((order) => order.status === orderStatus).length,
            ])
          ),
        },
      },
    })
  } catch (error) {
    console.error("GET /api/seller/orders error:", error)
    return NextResponse.json(
      { error: "Không thể lấy danh sách đơn hàng" },
      { status: 500 }
    )
  }
}

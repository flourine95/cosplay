import { NextResponse } from "next/server"
import { CustomOrderStatus } from "@/app/generated/prisma/enums"
import { requireSeller } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  sellerCustomOrderInclude,
  serializeSellerCustomOrder,
} from "@/lib/seller-custom-order"

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
    const needsQuote = searchParams.get("needsQuote") === "true"

    const statusFilter =
      status &&
      Object.values(CustomOrderStatus).includes(status as CustomOrderStatus)
        ? (status as CustomOrderStatus)
        : undefined

    const orders = await prisma.customOrder.findMany({
      where: {
        sellerId: seller.id,
        status: needsQuote ? CustomOrderStatus.SUBMITTED : statusFilter,
      },
      include: sellerCustomOrderInclude,
      orderBy: { updatedAt: "desc" },
    })

    const data = orders.map(serializeSellerCustomOrder)
    return NextResponse.json({
      data: {
        orders: data,
        stats: {
          total: data.length,
          needsQuote: data.filter(
            (order) => order.status === CustomOrderStatus.SUBMITTED
          ).length,
          inProgress: data.filter(
            (order) =>
              order.status === CustomOrderStatus.DEPOSIT_PAID ||
              order.status === CustomOrderStatus.IN_PROGRESS ||
              order.status === CustomOrderStatus.REVISION_REQUESTED
          ).length,
          ready: data.filter(
            (order) => order.status === CustomOrderStatus.READY
          ).length,
        },
      },
    })
  } catch (error) {
    console.error("GET /api/seller/custom-orders error:", error)
    return NextResponse.json(
      { error: "Không thể lấy danh sách đơn đặt may" },
      { status: 500 }
    )
  }
}

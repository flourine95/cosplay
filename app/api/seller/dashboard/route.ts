import { NextResponse } from "next/server"
import { OrderStatus, RentalStatus } from "@/app/generated/prisma/enums"
import { requireSeller } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const activeRentalStatuses = [
  RentalStatus.DEPOSIT_PAID,
  RentalStatus.READY_FOR_PICKUP,
  RentalStatus.RENTED,
  RentalStatus.OVERDUE,
]

export async function GET() {
  try {
    const seller = await requireSeller()
    if (!seller) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const [
      pendingOrders,
      activeRentals,
      monthlyRevenue,
      productCount,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count({
        where: { sellerId: seller.id, status: OrderStatus.PENDING },
      }),
      prisma.rentalOrder.count({
        where: {
          status: { in: activeRentalStatuses },
          rentalItem: { sellerId: seller.id },
        },
      }),
      prisma.order.aggregate({
        where: {
          sellerId: seller.id,
          createdAt: { gte: monthStart },
          status: {
            in: [
              OrderStatus.CONFIRMED,
              OrderStatus.PROCESSING,
              OrderStatus.SHIPPING,
              OrderStatus.DELIVERED,
              OrderStatus.COMPLETED,
            ],
          },
        },
        _sum: { total: true },
      }),
      prisma.product.count({ where: { sellerId: seller.id } }),
      prisma.order.findMany({
        where: { sellerId: seller.id },
        include: {
          user: { select: { name: true, phone: true } },
          items: {
            select: { productName: true },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ])

    return NextResponse.json({
      data: {
        kpis: {
          pendingOrders,
          activeRentals,
          monthlyRevenue: monthlyRevenue._sum.total?.toNumber() ?? 0,
          productCount,
        },
        recentOrders: recentOrders.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customer: order.user.name,
          phone: order.user.phone,
          item: order.items[0]?.productName ?? "Đơn hàng",
          total: order.total.toNumber(),
          status: order.status,
        })),
      },
    })
  } catch (error) {
    console.error("GET /api/seller/dashboard error:", error)
    return NextResponse.json(
      { error: "Không thể lấy dữ liệu dashboard" },
      { status: 500 }
    )
  }
}

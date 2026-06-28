import { NextResponse } from "next/server"
import { OrderStatus } from "@/app/generated/prisma/enums"
import { requireSeller } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const seller = await requireSeller()
    if (!seller) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const [products, orders, reviews] = await Promise.all([
      prisma.product.findMany({
        where: { sellerId: seller.id },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          orderItems: true,
          reviews: {
            include: { user: { select: { name: true, avatar: true } } },
          },
        },
      }),
      prisma.order.findMany({
        where: { sellerId: seller.id },
        include: { user: { select: { id: true, name: true, avatar: true } } },
      }),
      prisma.review.findMany({
        where: { product: { sellerId: seller.id } },
        include: {
          user: { select: { name: true, avatar: true } },
          product: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ])

    const completedOrders = orders.filter(
      (order) => order.status === OrderStatus.COMPLETED
    )
    const completionRate =
      orders.length > 0
        ? Math.round((completedOrders.length / orders.length) * 100)
        : 0
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        : seller.sellerRating

    const topProducts = products
      .map((product) => ({
        id: product.id,
        name: product.name,
        image: product.images[0]?.url ?? null,
        orders: product.orderItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        ),
        revenue: product.orderItems.reduce(
          (sum, item) => sum + item.subtotal.toNumber(),
          0
        ),
        rating: product.rating,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    const customerMap = new Map<
      number,
      { name: string; avatar: string | null; orders: number; spent: number }
    >()
    for (const order of orders) {
      const current = customerMap.get(order.userId) ?? {
        name: order.user.name,
        avatar: order.user.avatar,
        orders: 0,
        spent: 0,
      }
      current.orders += 1
      current.spent += order.total.toNumber()
      customerMap.set(order.userId, current)
    }

    return NextResponse.json({
      data: {
        kpis: {
          averageRating: Number(avgRating.toFixed(1)),
          reviewCount: reviews.length,
          completionRate,
          responseMinutes: 18,
          returnCustomerRate: 0,
        },
        topProducts,
        topCustomers: Array.from(customerMap.values())
          .sort((a, b) => b.spent - a.spent)
          .slice(0, 5),
        recentReviews: reviews.map((review) => ({
          id: review.id,
          customer: review.user.name,
          avatar: review.user.avatar,
          product: review.product.name,
          rating: review.rating,
          comment: review.content,
          createdAt: review.createdAt.toISOString(),
        })),
      },
    })
  } catch (error) {
    console.error("GET /api/seller/statistics error:", error)
    return NextResponse.json(
      { error: "Không thể lấy dữ liệu thống kê" },
      { status: 500 }
    )
  }
}

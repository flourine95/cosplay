import { NextResponse } from "next/server"
import {
  OrderStatus,
  PayoutStatus,
  RentalStatus,
} from "@/app/generated/prisma/enums"
import { requireSeller } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

const monthLabel = (key: string) => {
  const [year, month] = key.split("-")
  return `Tháng ${Number(month)}/${year}`
}

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

    const [orders, rentalOrders, customOrders, payouts] = await Promise.all([
      prisma.order.findMany({
        where: { sellerId: seller.id },
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          paymentStatus: true,
          createdAt: true,
          user: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.rentalOrder.findMany({
        where: { rentalItem: { sellerId: seller.id } },
        select: {
          id: true,
          orderNumber: true,
          rentalFee: true,
          depositAmount: true,
          status: true,
          createdAt: true,
          user: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.customOrder.findMany({
        where: { sellerId: seller.id },
        select: {
          id: true,
          orderNumber: true,
          depositAmount: true,
          finalAmount: true,
          totalPaid: true,
          status: true,
          createdAt: true,
          user: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.sellerPayout.findMany({
        where: { sellerId: seller.id },
        select: {
          amount: true,
          netAmount: true,
          platformFee: true,
          status: true,
        },
      }),
    ])

    const payableOrderStatuses: OrderStatus[] = [
      OrderStatus.CONFIRMED,
      OrderStatus.PROCESSING,
      OrderStatus.SHIPPING,
      OrderStatus.DELIVERED,
      OrderStatus.COMPLETED,
    ]

    const orderRevenue = orders
      .filter((order) => payableOrderStatuses.includes(order.status))
      .reduce((sum, order) => sum + order.total.toNumber(), 0)
    const rentalRevenue = rentalOrders
      .filter((order) => order.status !== RentalStatus.CANCELLED)
      .reduce((sum, order) => sum + order.rentalFee.toNumber(), 0)
    const customRevenue = customOrders.reduce(
      (sum, order) => sum + order.totalPaid.toNumber(),
      0
    )
    const heldDeposits = rentalOrders
      .filter((order) =>
        (
          [
            RentalStatus.CONFIRMED,
            RentalStatus.DEPOSIT_PAID,
            RentalStatus.READY_FOR_PICKUP,
            RentalStatus.RENTED,
            RentalStatus.OVERDUE,
          ] as RentalStatus[]
        ).includes(order.status)
      )
      .reduce((sum, order) => sum + order.depositAmount.toNumber(), 0)
    const pendingPayments = orders
      .filter((order) => order.paymentStatus === "PENDING")
      .reduce((sum, order) => sum + order.total.toNumber(), 0)
    const completedPayouts = payouts
      .filter((payout) => payout.status === PayoutStatus.COMPLETED)
      .reduce((sum, payout) => sum + payout.netAmount.toNumber(), 0)

    const monthly = new Map<string, { revenue: number; orders: number }>()
    for (const order of orders) {
      const key = monthKey(order.createdAt)
      const current = monthly.get(key) ?? { revenue: 0, orders: 0 }
      current.revenue += order.total.toNumber()
      current.orders += 1
      monthly.set(key, current)
    }

    const revenueByModel = [
      { model: "Bán đứt", amount: orderRevenue, orders: orders.length },
      { model: "Cho thuê", amount: rentalRevenue, orders: rentalOrders.length },
      {
        model: "Đặt may đo",
        amount: customRevenue,
        orders: customOrders.length,
      },
    ]
    const totalRevenue = orderRevenue + rentalRevenue + customRevenue

    const transactions = [
      ...orders.map((order) => ({
        id: `ORD-${order.id}`,
        type: "in",
        description: `Thanh toán đơn ${order.orderNumber}`,
        customer: order.user.name,
        amount: order.total.toNumber(),
        date: order.createdAt.toISOString(),
        status: order.paymentStatus,
      })),
      ...rentalOrders.map((order) => ({
        id: `RT-${order.id}`,
        type: "deposit",
        description: `Phí thuê ${order.orderNumber}`,
        customer: order.user.name,
        amount: order.rentalFee.toNumber(),
        date: order.createdAt.toISOString(),
        status: order.status,
      })),
      ...customOrders.map((order) => ({
        id: `TAIL-${order.id}`,
        type: "custom",
        description: `Đặt may ${order.orderNumber}`,
        customer: order.user.name,
        amount: order.totalPaid.toNumber(),
        date: order.createdAt.toISOString(),
        status: order.status,
      })),
    ]
      .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
      .slice(0, 12)

    return NextResponse.json({
      data: {
        summary: {
          monthRevenue: [...orders, ...rentalOrders, ...customOrders]
            .filter((item) => item.createdAt >= monthStart)
            .reduce((sum, item) => {
              if ("total" in item) return sum + item.total.toNumber()
              if ("rentalFee" in item) return sum + item.rentalFee.toNumber()
              return sum + item.totalPaid.toNumber()
            }, 0),
          totalRevenue,
          heldDeposits,
          pendingPayments,
          availableBalance: Math.max(totalRevenue - completedPayouts, 0),
        },
        revenueByModel: revenueByModel.map((item) => ({
          ...item,
          percent:
            totalRevenue > 0
              ? Math.round((item.amount / totalRevenue) * 100)
              : 0,
        })),
        monthlyRevenue: Array.from(monthly.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-6)
          .map(([key, value]) => ({
            month: monthLabel(key),
            revenue: value.revenue,
            orders: value.orders,
          })),
        transactions,
      },
    })
  } catch (error) {
    console.error("GET /api/seller/revenue error:", error)
    return NextResponse.json(
      { error: "Không thể lấy dữ liệu tài chính" },
      { status: 500 }
    )
  }
}

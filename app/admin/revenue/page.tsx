import RevenueManagement from "@/components/admin/revenue/revenue-management"
import { prisma } from "@/lib/prisma"

const getMonthKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

const getMonthLabel = (date: Date): string =>
  new Intl.DateTimeFormat("vi-VN", {
    month: "short",
    year: "numeric",
  }).format(date)

export default async function RevenuePage() {
  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const fourMonths = Array.from({ length: 4 }, (_, index) => {
    return new Date(now.getFullYear(), now.getMonth() - (3 - index), 1)
  })

  const [orders, customOrders, rentalOrders] = await Promise.all([
    prisma.order.findMany({
      select: {
        total: true,
        createdAt: true,
      },
    }),
    prisma.customOrder.findMany({
      select: {
        finalAmount: true,
        totalPaid: true,
        createdAt: true,
      },
    }),
    prisma.rentalOrder.findMany({
      select: {
        rentalFee: true,
        createdAt: true,
      },
    }),
  ])

  const saleRevenue = orders.reduce(
    (sum, order) => sum + Number(order.total),
    0
  )
  const customRevenue = customOrders.reduce(
    (sum, order) => sum + Number(order.totalPaid || order.finalAmount || 0),
    0
  )
  const rentalRevenue = rentalOrders.reduce(
    (sum, order) => sum + Number(order.rentalFee),
    0
  )
  const totalRevenue = saleRevenue + customRevenue + rentalRevenue

  const allTransactions = [
    ...orders.map((order) => ({
      amount: Number(order.total),
      createdAt: order.createdAt,
    })),
    ...customOrders.map((order) => ({
      amount: Number(order.totalPaid || order.finalAmount || 0),
      createdAt: order.createdAt,
    })),
    ...rentalOrders.map((order) => ({
      amount: Number(order.rentalFee),
      createdAt: order.createdAt,
    })),
  ]

  const currentMonthRevenue = allTransactions
    .filter((item) => item.createdAt >= currentMonthStart)
    .reduce((sum, item) => sum + item.amount, 0)
  const previousMonthRevenue = allTransactions
    .filter(
      (item) =>
        item.createdAt >= previousMonthStart &&
        item.createdAt < currentMonthStart
    )
    .reduce((sum, item) => sum + item.amount, 0)
  const growthRate =
    previousMonthRevenue === 0
      ? currentMonthRevenue > 0
        ? 100
        : 0
      : ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) *
        100

  const revenueByType = [
    {
      type: "Đơn bán",
      amount: saleRevenue,
      percent: totalRevenue ? (saleRevenue / totalRevenue) * 100 : 0,
      color: "bg-primary",
    },
    {
      type: "Đơn đặt may",
      amount: customRevenue,
      percent: totalRevenue ? (customRevenue / totalRevenue) * 100 : 0,
      color: "bg-emerald-500",
    },
    {
      type: "Đơn thuê",
      amount: rentalRevenue,
      percent: totalRevenue ? (rentalRevenue / totalRevenue) * 100 : 0,
      color: "bg-sky-500",
    },
  ]

  const monthlyRevenue = fourMonths.map((month) => ({
    month: getMonthLabel(month),
    amount: allTransactions
      .filter((item) => getMonthKey(item.createdAt) === getMonthKey(month))
      .reduce((sum, item) => sum + item.amount, 0),
  }))

  return (
    <RevenueManagement
      currentMonthRevenue={currentMonthRevenue}
      previousMonthRevenue={previousMonthRevenue}
      growthRate={growthRate}
      revenueByType={revenueByType}
      monthlyRevenue={monthlyRevenue}
    />
  )
}

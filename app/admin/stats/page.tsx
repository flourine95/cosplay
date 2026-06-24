import { UserRole } from "@/app/generated/prisma/enums"
import StatsManagement from "@/components/admin/stats/stats-management"
import { prisma } from "@/lib/prisma"

const formatCurrency = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toLocaleString("vi-VN", {
      maximumFractionDigits: 1,
    })} tỷ`
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString("vi-VN", {
      maximumFractionDigits: 1,
    })} triệu`
  }
  return `${value.toLocaleString("vi-VN")}đ`
}

const getGrowth = (current: number, previous: number): string => {
  if (previous === 0) return current > 0 ? "+100%" : "0%"
  const growth = ((current - previous) / previous) * 100
  return `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`
}

const statusLabels: Record<string, string> = {
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
  REFUNDED: "Đã hoàn tiền",
  DRAFT: "Nháp",
  SUBMITTED: "Đã gửi yêu cầu",
  QUOTED: "Đã báo giá",
  QUOTE_ACCEPTED: "Đã nhận báo giá",
  DEPOSIT_PAID: "Đã đặt cọc",
  IN_PROGRESS: "Đang thực hiện",
  REVISION_REQUESTED: "Yêu cầu chỉnh sửa",
  READY: "Sẵn sàng bàn giao",
  READY_FOR_PICKUP: "Sẵn sàng nhận đồ",
  RENTED: "Đang thuê",
  RETURNED: "Đã trả đồ",
  DEPOSIT_REFUNDED: "Đã hoàn cọc",
  OVERDUE: "Quá hạn",
}

export default async function StatsPage() {
  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const [users, orders, customOrders, rentalOrders, orderItems, sellers] =
    await Promise.all([
      prisma.user.findMany({
        select: { createdAt: true },
      }),
      prisma.order.findMany({
        include: {
          items: {
            select: {
              productName: true,
              quantity: true,
              subtotal: true,
            },
          },
        },
      }),
      prisma.customOrder.findMany({
        select: {
          status: true,
          totalPaid: true,
          finalAmount: true,
          createdAt: true,
        },
      }),
      prisma.rentalOrder.findMany({
        select: {
          status: true,
          rentalFee: true,
          createdAt: true,
        },
      }),
      prisma.orderItem.findMany({
        select: {
          productName: true,
          quantity: true,
          subtotal: true,
        },
      }),
      prisma.user.findMany({
        where: { role: UserRole.SELLER },
        include: {
          ordersAsSeller: {
            select: { total: true, createdAt: true },
          },
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

  const currentMonthRevenue =
    orders
      .filter((order) => order.createdAt >= currentMonthStart)
      .reduce((sum, order) => sum + Number(order.total), 0) +
    customOrders
      .filter((order) => order.createdAt >= currentMonthStart)
      .reduce(
        (sum, order) => sum + Number(order.totalPaid || order.finalAmount || 0),
        0
      ) +
    rentalOrders
      .filter((order) => order.createdAt >= currentMonthStart)
      .reduce((sum, order) => sum + Number(order.rentalFee), 0)

  const previousMonthRevenue =
    orders
      .filter(
        (order) =>
          order.createdAt >= previousMonthStart &&
          order.createdAt < currentMonthStart
      )
      .reduce((sum, order) => sum + Number(order.total), 0) +
    customOrders
      .filter(
        (order) =>
          order.createdAt >= previousMonthStart &&
          order.createdAt < currentMonthStart
      )
      .reduce(
        (sum, order) => sum + Number(order.totalPaid || order.finalAmount || 0),
        0
      ) +
    rentalOrders
      .filter(
        (order) =>
          order.createdAt >= previousMonthStart &&
          order.createdAt < currentMonthStart
      )
      .reduce((sum, order) => sum + Number(order.rentalFee), 0)

  const currentMonthUsers = users.filter(
    (user) => user.createdAt >= currentMonthStart
  ).length
  const previousMonthUsers = users.filter(
    (user) =>
      user.createdAt >= previousMonthStart && user.createdAt < currentMonthStart
  ).length

  const allStatuses = [
    ...orders.map((order) => order.status),
    ...customOrders.map((order) => order.status),
    ...rentalOrders.map((order) => order.status),
  ]
  const totalOrders = allStatuses.length
  const completedOrders = allStatuses.filter(
    (status) => status === "COMPLETED"
  ).length
  const completionRate =
    totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0

  const productMap = new Map<
    string,
    { name: string; orders: number; revenue: number }
  >()
  for (const item of orderItems) {
    const current = productMap.get(item.productName) ?? {
      name: item.productName,
      orders: 0,
      revenue: 0,
    }
    current.orders += item.quantity
    current.revenue += Number(item.subtotal)
    productMap.set(item.productName, current)
  }
  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  const topSellers = sellers
    .map((seller) => ({
      name: seller.shopName ?? seller.name,
      orders: seller.ordersAsSeller.length,
      revenue: seller.ordersAsSeller.reduce(
        (sum, order) => sum + Number(order.total),
        0
      ),
      rating: seller.sellerRating,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  const statusCounts = allStatuses.reduce<Record<string, number>>(
    (result, status) => {
      result[status] = (result[status] ?? 0) + 1
      return result
    },
    {}
  )
  const statusBreakdown = Object.entries(statusCounts)
    .map(([status, value]) => ({
      label: statusLabels[status] ?? status,
      value,
      percent: totalOrders ? (value / totalOrders) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value)

  const overallStats = [
    {
      label: "Tổng người dùng",
      value: users.length.toLocaleString("vi-VN"),
      trend: `${getGrowth(currentMonthUsers, previousMonthUsers)} so với tháng trước`,
      icon: "users" as const,
    },
    {
      label: "Tổng đơn hàng",
      value: totalOrders.toLocaleString("vi-VN"),
      trend: `${completedOrders.toLocaleString("vi-VN")} đơn hoàn tất`,
      icon: "orders" as const,
    },
    {
      label: "Tổng doanh thu",
      value: formatCurrency(totalRevenue),
      trend: `${getGrowth(currentMonthRevenue, previousMonthRevenue)} doanh thu tháng này`,
      icon: "revenue" as const,
    },
    {
      label: "Tỷ lệ hoàn thành",
      value: `${completionRate.toFixed(1)}%`,
      trend: `${completedOrders}/${totalOrders} đơn`,
      icon: "conversion" as const,
    },
  ]

  return (
    <StatsManagement
      overallStats={overallStats}
      topProducts={topProducts}
      topSellers={topSellers}
      statusBreakdown={statusBreakdown}
    />
  )
}

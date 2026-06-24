import { SellerStatus } from "@/app/generated/prisma/enums"
import DashboardOverview from "@/components/admin/dashboard/dashboard-overview"
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

const getGrowthLabel = (current: number, previous: number): string => {
  if (previous === 0) return current > 0 ? "+100%" : "0%"
  const growth = ((current - previous) / previous) * 100
  return `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`
}

const getDaysLabel = (date: Date | null | undefined): string => {
  if (!date) return "Chưa có hạn"

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)

  const diffDays = Math.ceil(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diffDays < 0) return `Trễ ${Math.abs(diffDays)} ngày`
  if (diffDays === 0) return "Hôm nay"
  if (diffDays === 1) return "Ngày mai"
  return `Còn ${diffDays} ngày`
}

const getRentalUrgency = (date: Date): "high" | "medium" | "low" => {
  const now = new Date()
  const hours = (date.getTime() - now.getTime()) / (1000 * 60 * 60)
  if (hours <= 24) return "high"
  if (hours <= 72) return "medium"
  return "low"
}

export default async function AdminPage() {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const [
    orders,
    customOrders,
    rentalOrders,
    usersCount,
    sellersCount,
    pendingSellersCount,
    activeProductsCount,
    totalProductsCount,
    fees,
    topSellerUsers,
  ] = await Promise.all([
    prisma.order.findMany({
      select: {
        total: true,
        status: true,
        createdAt: true,
        sellerId: true,
      },
    }),
    prisma.customOrder.findMany({
      include: {
        user: { select: { name: true } },
        progressUpdates: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            title: true,
            progressPercent: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.rentalOrder.findMany({
      include: {
        user: { select: { name: true } },
        rentalItem: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
      orderBy: { endDate: "asc" },
    }),
    prisma.user.count(),
    prisma.user.count({ where: { role: "SELLER" } }),
    prisma.user.count({
      where: { role: "SELLER", sellerStatus: SellerStatus.PENDING },
    }),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.product.count(),
    prisma.systemFee.findMany({
      where: { isActive: true, feeType: "percentage" },
      orderBy: { updatedAt: "desc" },
      take: 1,
    }),
    prisma.user.findMany({
      where: { role: "SELLER" },
      include: {
        ordersAsSeller: {
          select: {
            total: true,
            createdAt: true,
          },
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

  const transactions = [
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
  const currentMonthRevenue = transactions
    .filter((transaction) => transaction.createdAt >= currentMonthStart)
    .reduce((sum, transaction) => sum + transaction.amount, 0)
  const previousMonthRevenue = transactions
    .filter(
      (transaction) =>
        transaction.createdAt >= previousMonthStart &&
        transaction.createdAt < currentMonthStart
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const activeRentalCount = rentalOrders.filter(
    (order) =>
      !["CANCELLED", "RETURNED", "DEPOSIT_REFUNDED", "COMPLETED"].includes(
        order.status
      )
  ).length
  const newCustomTodayCount = customOrders.filter(
    (order) => order.createdAt >= todayStart
  ).length
  const totalOrderCount =
    orders.length + customOrders.length + rentalOrders.length
  const completedCount =
    orders.filter((order) => order.status === "COMPLETED").length +
    customOrders.filter((order) => order.status === "COMPLETED").length +
    rentalOrders.filter((order) => order.status === "COMPLETED").length
  const completionRate =
    totalOrderCount > 0 ? (completedCount / totalOrderCount) * 100 : 0

  const activeCustomOrders = customOrders.filter(
    (order) => !["COMPLETED", "CANCELLED", "DRAFT"].includes(order.status)
  )
  const tailoringOrders = activeCustomOrders.slice(0, 3).map((order) => {
    const [latestProgress] = order.progressUpdates
    const progress = latestProgress?.progressPercent ?? 0
    return {
      id: order.orderNumber,
      title: order.title,
      client: order.user.name,
      progress,
      step: latestProgress?.title ?? "Chờ cập nhật tiến độ",
      dueDate: getDaysLabel(order.deadline),
      isDelayed: order.deadline ? order.deadline < now : false,
    }
  })

  const rentalDeadlines = rentalOrders
    .filter(
      (order) =>
        !["CANCELLED", "RETURNED", "DEPOSIT_REFUNDED", "COMPLETED"].includes(
          order.status
        )
    )
    .slice(0, 3)
    .map((order) => ({
      id: order.orderNumber,
      name: order.user.name,
      item: order.rentalItem.product.name,
      time: getDaysLabel(order.endDate),
      urgency: getRentalUrgency(order.endDate),
    }))

  const topSellers = topSellerUsers
    .map((seller) => {
      const salesCount = seller.ordersAsSeller.length
      const currentSales = seller.ordersAsSeller.filter(
        (order) => order.createdAt >= currentMonthStart
      ).length
      const previousSales = seller.ordersAsSeller.filter(
        (order) =>
          order.createdAt >= previousMonthStart &&
          order.createdAt < currentMonthStart
      ).length
      return {
        name: seller.shopName ?? seller.name,
        salesCount,
        sales: `${salesCount} đơn`,
        growth: getGrowthLabel(currentSales, previousSales),
        avatar: (seller.shopName ?? seller.name).charAt(0).toUpperCase(),
      }
    })
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, 3)

  const feeRate = fees[0] ? Number(fees[0].feeValue) / 100 : 0
  const platformFeeBalance = totalRevenue * feeRate

  const revenueByType = [
    {
      type: "Đơn bán",
      amount: saleRevenue,
      percent: totalRevenue ? (saleRevenue / totalRevenue) * 100 : 0,
      color: "bg-primary",
    },
    {
      type: "Đặt may",
      amount: customRevenue,
      percent: totalRevenue ? (customRevenue / totalRevenue) * 100 : 0,
      color: "bg-emerald-500",
    },
    {
      type: "Thuê đồ",
      amount: rentalRevenue,
      percent: totalRevenue ? (rentalRevenue / totalRevenue) * 100 : 0,
      color: "bg-sky-500",
    },
  ]

  const stats = [
    {
      label: "Doanh thu tháng này",
      value: formatCurrency(currentMonthRevenue),
      change: getGrowthLabel(currentMonthRevenue, previousMonthRevenue),
      isPositive: currentMonthRevenue >= previousMonthRevenue,
      icon: "revenue" as const,
    },
    {
      label: "Đơn thuê hoạt động",
      value: activeRentalCount.toLocaleString("vi-VN"),
      change: `${rentalOrders.length.toLocaleString("vi-VN")} đơn thuê`,
      isPositive: true,
      icon: "rental" as const,
    },
    {
      label: "Đặt may mới hôm nay",
      value: newCustomTodayCount.toLocaleString("vi-VN"),
      change: `${activeCustomOrders.length.toLocaleString("vi-VN")} đang xử lý`,
      isPositive: true,
      icon: "tailoring" as const,
    },
    {
      label: "Tỷ lệ hoàn thành",
      value: `${completionRate.toFixed(1)}%`,
      change: `${completedCount}/${totalOrderCount} đơn`,
      isPositive: completionRate >= 80,
      icon: "completion" as const,
    },
    {
      label: "Người dùng",
      value: usersCount.toLocaleString("vi-VN"),
      change: `${sellersCount.toLocaleString("vi-VN")} seller`,
      isPositive: true,
      icon: "users" as const,
    },
    {
      label: "Seller chờ duyệt",
      value: pendingSellersCount.toLocaleString("vi-VN"),
      change: `${sellersCount.toLocaleString("vi-VN")} seller tổng`,
      isPositive: pendingSellersCount === 0,
      icon: "sellers" as const,
    },
    {
      label: "Sản phẩm đã duyệt",
      value: activeProductsCount.toLocaleString("vi-VN"),
      change: `${totalProductsCount.toLocaleString("vi-VN")} sản phẩm tổng`,
      isPositive: true,
      icon: "products" as const,
    },
    {
      label: "Phí nền tảng",
      value: formatCurrency(platformFeeBalance),
      change: fees[0]
        ? `${Number(fees[0].feeValue)}% đang áp dụng`
        : "Chưa cấu hình",
      isPositive: true,
      icon: "fees" as const,
    },
  ]

  return (
    <DashboardOverview
      stats={stats}
      tailoringOrders={tailoringOrders}
      activeTailoringCount={activeCustomOrders.length}
      rentalDeadlines={rentalDeadlines}
      topSellers={topSellers}
      revenueByType={revenueByType}
      platformFeeBalance={platformFeeBalance}
    />
  )
}

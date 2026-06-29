import RevenueManagement from "@/components/admin/revenue/revenue-management"
import {
  EscrowStatus,
  OrderStatus,
  PaymentStatus,
  ReturnStatus,
} from "@/app/generated/prisma/enums"
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

  const [orders, customOrders, rentalOrders, payouts, platformCommission] =
    await Promise.all([
      prisma.order.findMany({
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          paymentStatus: true,
          escrowStatus: true,
          payoutId: true,
          createdAt: true,
          returnRequests: {
            where: {
              status: {
                in: [
                  ReturnStatus.PENDING,
                  ReturnStatus.APPROVED,
                  ReturnStatus.SHIPPING_BACK,
                  ReturnStatus.RECEIVED,
                ],
              },
            },
            select: { id: true },
          },
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              shopName: true,
              bankName: true,
              bankAccount: true,
              bankAccountName: true,
            },
          },
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
      prisma.sellerPayout.findMany({
        include: {
          seller: {
            select: {
              name: true,
              shopName: true,
            },
          },
          orders: {
            select: { id: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.systemFee.findFirst({
        where: {
          name: "platform_commission",
          feeType: "percentage",
          isActive: true,
        },
        select: { feeValue: true },
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

  const platformCommissionRate = platformCommission
    ? Number(platformCommission.feeValue)
    : 10
  const escrowHolding = orders
    .filter((order) => order.escrowStatus === EscrowStatus.HOLDING)
    .reduce((sum, order) => sum + Number(order.total), 0)
  const escrowReadyOrders = orders.filter(
    (order) =>
      order.status === OrderStatus.COMPLETED &&
      order.paymentStatus === PaymentStatus.PAID &&
      order.escrowStatus === EscrowStatus.HOLDING &&
      order.payoutId === null &&
      order.returnRequests.length === 0
  )
  const escrowReady = escrowReadyOrders.reduce(
    (sum, order) => sum + Number(order.total),
    0
  )
  const escrowReleased = orders
    .filter((order) => order.escrowStatus === EscrowStatus.RELEASED)
    .reduce((sum, order) => sum + Number(order.total), 0)

  const eligibleBySeller = new Map<
    number,
    {
      sellerId: number
      sellerName: string
      sellerEmail: string
      bankName: string | null
      bankAccount: string | null
      bankAccountName: string | null
      orderCount: number
      grossAmount: number
    }
  >()

  for (const order of escrowReadyOrders) {
    const current = eligibleBySeller.get(order.seller.id) ?? {
      sellerId: order.seller.id,
      sellerName: order.seller.shopName ?? order.seller.name,
      sellerEmail: order.seller.email,
      bankName: order.seller.bankName,
      bankAccount: order.seller.bankAccount,
      bankAccountName: order.seller.bankAccountName,
      orderCount: 0,
      grossAmount: 0,
    }

    current.orderCount += 1
    current.grossAmount += Number(order.total)
    eligibleBySeller.set(order.seller.id, current)
  }

  const eligiblePayouts = Array.from(eligibleBySeller.values()).map((item) => {
    const platformFee = (item.grossAmount * platformCommissionRate) / 100
    return {
      ...item,
      platformFee,
      netAmount: item.grossAmount - platformFee,
    }
  })

  const serializedPayouts = payouts.map((payout) => ({
    id: payout.id,
    sellerName: payout.seller.shopName ?? payout.seller.name,
    orderCount: payout.orders.length,
    amount: Number(payout.amount),
    platformFee: Number(payout.platformFee),
    netAmount: Number(payout.netAmount),
    status: payout.status,
    bankName: payout.bankName,
    bankAccount: payout.bankAccount,
    bankAccountName: payout.bankAccountName,
    transferProof: payout.transferProof,
    createdAt: payout.createdAt.toISOString(),
    processedAt: payout.processedAt?.toISOString() ?? null,
  }))

  return (
    <RevenueManagement
      currentMonthRevenue={currentMonthRevenue}
      previousMonthRevenue={previousMonthRevenue}
      growthRate={growthRate}
      revenueByType={revenueByType}
      monthlyRevenue={monthlyRevenue}
      eligiblePayouts={eligiblePayouts}
      payouts={serializedPayouts}
      escrowHolding={escrowHolding}
      escrowReady={escrowReady}
      escrowReleased={escrowReleased}
    />
  )
}

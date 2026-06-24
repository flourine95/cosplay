import InvoiceManagement from "@/components/admin/invoices/invoice-management"
import { PayoutStatus, UserRole } from "@/app/generated/prisma/enums"
import { prisma } from "@/lib/prisma"

export default async function InvoicesPage() {
  const now = new Date()
  const period = new Intl.DateTimeFormat("vi-VN", {
    month: "long",
    year: "numeric",
  }).format(now)

  const [sellers, fees, completedPayouts] = await Promise.all([
    prisma.user.findMany({
      where: { role: UserRole.SELLER },
      include: {
        ordersAsSeller: {
          select: {
            total: true,
            payoutId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.systemFee.findMany({
      where: { isActive: true, feeType: "percentage" },
      orderBy: { updatedAt: "desc" },
      take: 1,
    }),
    prisma.sellerPayout.findMany({
      where: { status: PayoutStatus.COMPLETED },
      select: { id: true },
    }),
  ])

  const completedPayoutIds = new Set(
    completedPayouts.map((payout) => payout.id)
  )
  const feeRate = fees[0] ? Number(fees[0].feeValue) / 100 : 0

  const invoices = sellers
    .map((seller) => {
      const revenue = seller.ordersAsSeller.reduce(
        (sum, order) => sum + Number(order.total),
        0
      )
      const platformFee = revenue * feeRate
      const netAmount = revenue - platformFee
      const hasUnpaidOrder = seller.ordersAsSeller.some(
        (order) => !order.payoutId || !completedPayoutIds.has(order.payoutId)
      )

      return {
        id: `INV-${seller.id.toString().padStart(4, "0")}`,
        seller: seller.shopName ?? seller.name,
        period,
        revenue,
        platformFee,
        netAmount,
        status: hasUnpaidOrder ? ("PENDING" as const) : ("PAID" as const),
        issuedAt: now,
      }
    })
    .filter((invoice) => invoice.revenue > 0)

  return <InvoiceManagement invoices={invoices} />
}

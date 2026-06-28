import { DisputeManagement } from "@/components/admin/disputes/dispute-management"
import { prisma } from "@/lib/prisma"

export default async function AdminDisputesPage() {
  const disputes = await prisma.returnRequest.findMany({
    include: {
      order: {
        include: {
          user: { select: { name: true, email: true } },
          seller: { select: { name: true, email: true, shopName: true } },
          items: {
            select: { productName: true, quantity: true, subtotal: true },
          },
          payout: { select: { status: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const rows = disputes.map((dispute) => ({
    id: dispute.id,
    orderNumber: dispute.order.orderNumber,
    customer: dispute.order.user.name,
    customerEmail: dispute.order.user.email,
    seller: dispute.order.seller.shopName ?? dispute.order.seller.name,
    sellerEmail: dispute.order.seller.email,
    itemSummary: dispute.order.items
      .map((item) => `${item.productName} x${item.quantity}`)
      .join(", "),
    orderTotal: Number(dispute.order.total),
    paymentStatus: dispute.order.paymentStatus,
    escrowStatus: dispute.order.escrowStatus,
    orderStatus: dispute.order.status,
    payoutStatus: dispute.order.payout?.status ?? null,
    reason: dispute.reason,
    description: dispute.description,
    images: dispute.images,
    videos: dispute.videos,
    status: dispute.status,
    adminNote: dispute.adminNote,
    refundAmount: dispute.refundAmount ? Number(dispute.refundAmount) : null,
    createdAt: dispute.createdAt.toISOString(),
    resolvedAt: dispute.resolvedAt?.toISOString() ?? null,
  }))

  return <DisputeManagement disputes={rows} />
}

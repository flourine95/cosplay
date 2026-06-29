import { DisputeManagement } from "@/components/admin/disputes/dispute-management"
import { RentalDisputeManagement } from "@/components/admin/disputes/rental-dispute-management"
import { prisma } from "@/lib/prisma"

export default async function AdminDisputesPage() {
  const [disputes, rentalDisputes] = await Promise.all([
    prisma.returnRequest.findMany({
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
    }),
    prisma.rentalDispute.findMany({
      include: {
        rentalOrder: {
          include: {
            user: { select: { name: true, email: true } },
            rentalItem: {
              include: {
                seller: { select: { name: true, shopName: true } },
                product: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ])

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

  const rentalRows = rentalDisputes.map((dispute) => ({
    id: dispute.id,
    orderNumber: dispute.rentalOrder.orderNumber,
    itemName: dispute.rentalOrder.rentalItem.product.name,
    customer: dispute.rentalOrder.user.name,
    seller:
      dispute.rentalOrder.rentalItem.seller.shopName ??
      dispute.rentalOrder.rentalItem.seller.name,
    reason: dispute.reason,
    description: dispute.description,
    shopResponse: dispute.shopResponse,
    adminNote: dispute.adminNote,
    status: dispute.status,
    depositAmount: dispute.rentalOrder.depositAmount.toNumber(),
    refundAmount: dispute.refundAmount?.toNumber() ?? null,
    createdAt: dispute.createdAt.toISOString(),
  }))

  return (
    <div className="space-y-8">
      <DisputeManagement disputes={rows} />
      <RentalDisputeManagement disputes={rentalRows} />
    </div>
  )
}

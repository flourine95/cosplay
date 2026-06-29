import type { Prisma } from "@/app/generated/prisma/client"
import { CustomOrderStatus } from "@/app/generated/prisma/enums"

export const customerCustomOrderInclude = {
  seller: { select: { id: true, name: true, shopName: true, avatar: true } },
  measurement: true,
  quotes: { orderBy: { createdAt: "desc" } },
  progressUpdates: { orderBy: { createdAt: "asc" } },
  revisions: { orderBy: { createdAt: "desc" } },
} satisfies Prisma.CustomOrderInclude

export type CustomerCustomOrderWithRelations = Prisma.CustomOrderGetPayload<{
  include: typeof customerCustomOrderInclude
}>

export const customerCustomOrderStatusLabels: Record<
  CustomOrderStatus,
  string
> = {
  [CustomOrderStatus.DRAFT]: "Nháp",
  [CustomOrderStatus.SUBMITTED]: "Đã gửi yêu cầu",
  [CustomOrderStatus.QUOTED]: "Seller đã báo giá",
  [CustomOrderStatus.QUOTE_ACCEPTED]: "Đã nhận báo giá",
  [CustomOrderStatus.DEPOSIT_PAID]: "Đã đặt cọc",
  [CustomOrderStatus.IN_PROGRESS]: "Đang gia công",
  [CustomOrderStatus.REVISION_REQUESTED]: "Yêu cầu chỉnh sửa",
  [CustomOrderStatus.READY]: "Sẵn sàng giao",
  [CustomOrderStatus.COMPLETED]: "Hoàn tất",
  [CustomOrderStatus.CANCELLED]: "Đã hủy",
}

export function serializeCustomerCustomOrder(
  order: CustomerCustomOrderWithRelations
) {
  const latestProgress =
    order.progressUpdates[order.progressUpdates.length - 1] ?? null
  const acceptedQuote = order.quotes.find((quote) => quote.isAccepted)

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    title: order.title,
    description: order.description,
    referenceImages: order.referenceImages,
    characterName: order.characterName,
    animeName: order.animeName,
    specialRequests: order.specialRequests,
    deadline: order.deadline?.toISOString() ?? null,
    status: order.status,
    statusLabel: customerCustomOrderStatusLabels[order.status],
    estimatedPrice: order.estimatedPrice?.toNumber() ?? null,
    depositAmount: order.depositAmount?.toNumber() ?? null,
    finalAmount: order.finalAmount?.toNumber() ?? null,
    totalPaid: order.totalPaid.toNumber(),
    shippingFee: order.shippingFee?.toNumber() ?? 0,
    trackingCode: order.trackingCode,
    shippingCarrier: order.shippingCarrier,
    remainingAmount: Math.max(
      (order.finalAmount?.toNumber() ?? 0) +
        (order.shippingFee?.toNumber() ?? 0) -
        Math.max(
          order.totalPaid.toNumber(),
          order.depositAmount?.toNumber() ?? 0
        ),
      0
    ),
    progressPercent: latestProgress?.progressPercent ?? 0,
    createdAt: order.createdAt.toISOString(),
    submittedAt: order.submittedAt?.toISOString() ?? null,
    acceptedAt: order.acceptedAt?.toISOString() ?? null,
    completedAt: order.completedAt?.toISOString() ?? null,
    seller: {
      id: order.seller.id,
      name: order.seller.shopName ?? order.seller.name,
      avatar: order.seller.avatar,
    },
    measurement: order.measurement
      ? {
          height: order.measurement.height,
          weight: order.measurement.weight,
          chest: order.measurement.chest,
          waist: order.measurement.waist,
          hips: order.measurement.hips,
          shoulder: order.measurement.shoulder,
          armLength: order.measurement.armLength,
          legLength: order.measurement.legLength,
          neck: order.measurement.neck,
          notes: order.measurement.notes,
        }
      : null,
    quotes: order.quotes.map((quote) => ({
      id: quote.id,
      quotedPrice: quote.quotedPrice.toNumber(),
      depositAmount: quote.depositAmount.toNumber(),
      estimatedDays: quote.estimatedDays,
      description: quote.description,
      isAccepted: quote.isAccepted,
      isRejected: quote.isRejected,
      createdAt: quote.createdAt.toISOString(),
    })),
    acceptedQuote: acceptedQuote
      ? {
          id: acceptedQuote.id,
          quotedPrice: acceptedQuote.quotedPrice.toNumber(),
          depositAmount: acceptedQuote.depositAmount.toNumber(),
          estimatedDays: acceptedQuote.estimatedDays,
        }
      : null,
    progressUpdates: order.progressUpdates.map((progress) => ({
      id: progress.id,
      title: progress.title,
      description: progress.description,
      images: progress.images,
      videos: progress.videos,
      progressPercent: progress.progressPercent,
      createdAt: progress.createdAt.toISOString(),
    })),
    revisions: order.revisions.map((revision) => ({
      id: revision.id,
      description: revision.description,
      images: revision.images,
      videos: revision.videos,
      sellerResponse: revision.sellerResponse,
      respondedAt: revision.respondedAt?.toISOString() ?? null,
      createdAt: revision.createdAt.toISOString(),
    })),
  }
}

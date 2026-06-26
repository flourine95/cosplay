import type { Prisma } from "@/app/generated/prisma/client"
import { CustomOrderStatus } from "@/app/generated/prisma/enums"

export const sellerCustomOrderInclude = {
  user: { select: { id: true, name: true, phone: true, email: true } },
  measurement: true,
  quotes: { orderBy: { createdAt: "desc" } },
  progressUpdates: { orderBy: { createdAt: "desc" } },
  revisions: { orderBy: { createdAt: "desc" } },
} satisfies Prisma.CustomOrderInclude

export type SellerCustomOrderWithRelations = Prisma.CustomOrderGetPayload<{
  include: typeof sellerCustomOrderInclude
}>

export const customOrderStatusLabels: Record<CustomOrderStatus, string> = {
  [CustomOrderStatus.DRAFT]: "Nháp",
  [CustomOrderStatus.SUBMITTED]: "Chờ báo giá",
  [CustomOrderStatus.QUOTED]: "Đã báo giá",
  [CustomOrderStatus.QUOTE_ACCEPTED]: "Khách đã chốt giá",
  [CustomOrderStatus.DEPOSIT_PAID]: "Đã đặt cọc",
  [CustomOrderStatus.IN_PROGRESS]: "Đang gia công",
  [CustomOrderStatus.REVISION_REQUESTED]: "Yêu cầu chỉnh sửa",
  [CustomOrderStatus.READY]: "Sẵn sàng giao",
  [CustomOrderStatus.COMPLETED]: "Hoàn tất",
  [CustomOrderStatus.CANCELLED]: "Đã hủy",
}

export function serializeSellerCustomOrder(
  order: SellerCustomOrderWithRelations
) {
  const [latestProgress] = order.progressUpdates
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
    statusLabel: customOrderStatusLabels[order.status],
    estimatedPrice: order.estimatedPrice?.toNumber() ?? null,
    depositAmount: order.depositAmount?.toNumber() ?? null,
    finalAmount: order.finalAmount?.toNumber() ?? null,
    totalPaid: order.totalPaid.toNumber(),
    progressPercent: latestProgress?.progressPercent ?? 0,
    createdAt: order.createdAt.toISOString(),
    submittedAt: order.submittedAt?.toISOString() ?? null,
    customer: {
      id: order.user.id,
      name: order.user.name,
      phone: order.user.phone,
      email: order.user.email,
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

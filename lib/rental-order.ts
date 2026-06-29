import type { Prisma } from "@/app/generated/prisma/client"
import { RentalDisputeStatus, RentalStatus } from "@/app/generated/prisma/enums"

export const activeRentalStatuses: RentalStatus[] = [
  RentalStatus.PENDING,
  RentalStatus.CONFIRMED,
  RentalStatus.DEPOSIT_PAID,
  RentalStatus.READY_FOR_PICKUP,
  RentalStatus.RENTED,
  RentalStatus.RETURNED,
  RentalStatus.OVERDUE,
]

export const rentalStatusLabels: Record<RentalStatus, string> = {
  [RentalStatus.PENDING]: "Chờ thanh toán",
  [RentalStatus.CONFIRMED]: "Shop đã xác nhận",
  [RentalStatus.DEPOSIT_PAID]: "Admin đang giữ cọc",
  [RentalStatus.READY_FOR_PICKUP]: "Sẵn sàng nhận đồ",
  [RentalStatus.RENTED]: "Đang thuê",
  [RentalStatus.RETURNED]: "Khách đã báo trả đồ",
  [RentalStatus.DEPOSIT_REFUNDED]: "Chờ admin hoàn cọc",
  [RentalStatus.COMPLETED]: "Hoàn tất",
  [RentalStatus.CANCELLED]: "Đã hủy",
  [RentalStatus.OVERDUE]: "Quá hạn",
}

export const rentalDisputeStatusLabels: Record<RentalDisputeStatus, string> = {
  [RentalDisputeStatus.OPEN]: "Mới tạo",
  [RentalDisputeStatus.SHOP_RESPONDED]: "Shop đã phản hồi",
  [RentalDisputeStatus.ADMIN_REVIEWING]: "Admin đang xem xét",
  [RentalDisputeStatus.RESOLVED_REFUND_CUSTOMER]: "Hoàn cọc cho khách",
  [RentalDisputeStatus.RESOLVED_PAY_SHOP]: "Chuyển cọc cho shop",
  [RentalDisputeStatus.RESOLVED_SPLIT]: "Chia cọc hai bên",
  [RentalDisputeStatus.CLOSED]: "Đã đóng",
}

export const rentalOrderInclude = {
  user: { select: { id: true, name: true, email: true, phone: true } },
  rentalItem: {
    include: {
      seller: { select: { id: true, name: true, shopName: true } },
      product: {
        include: {
          images: {
            orderBy: [{ isPrimary: "desc" }, { order: "asc" }],
            take: 1,
          },
        },
      },
    },
  },
  payments: { orderBy: { createdAt: "desc" } },
  disputes: { orderBy: { createdAt: "desc" } },
} satisfies Prisma.RentalOrderInclude

export type RentalOrderWithRelations = Prisma.RentalOrderGetPayload<{
  include: typeof rentalOrderInclude
}>

export function getRentalTabStatus(status: RentalStatus) {
  if (
    status === RentalStatus.PENDING ||
    status === RentalStatus.CONFIRMED ||
    status === RentalStatus.DEPOSIT_PAID ||
    status === RentalStatus.READY_FOR_PICKUP
  ) {
    return "pending" as const
  }

  if (status === RentalStatus.RENTED || status === RentalStatus.OVERDUE) {
    return "active" as const
  }

  if (
    status === RentalStatus.RETURNED ||
    status === RentalStatus.DEPOSIT_REFUNDED
  ) {
    return "returning" as const
  }

  return "completed" as const
}

const startOfDay = (date: Date) => {
  const normalized = new Date(date)
  normalized.setHours(0, 0, 0, 0)
  return normalized
}

export function serializeRentalOrder(order: RentalOrderWithRelations) {
  const today = startOfDay(new Date())
  const endDate = startOfDay(order.endDate)
  const daysLeft =
    order.status === RentalStatus.RENTED ||
    order.status === RentalStatus.OVERDUE
      ? Math.ceil((endDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))
      : null

  const latestDispute = order.disputes[0] ?? null

  return {
    id: order.orderNumber,
    numericId: order.id,
    orderNumber: order.orderNumber,
    status: getRentalTabStatus(order.status),
    rawStatus: order.status,
    statusLabel: rentalStatusLabels[order.status],
    itemName: order.rentalItem.product.name,
    shopName: order.rentalItem.seller.shopName ?? order.rentalItem.seller.name,
    customerName: order.user.name,
    customerPhone: order.user.phone,
    startDate: order.startDate.toLocaleDateString("vi-VN"),
    endDate: order.endDate.toLocaleDateString("vi-VN"),
    startDateIso: order.startDate.toISOString(),
    endDateIso: order.endDate.toISOString(),
    daysLeft,
    totalDays: order.totalDays,
    pricePerDay: order.pricePerDay.toNumber(),
    totalPrice: order.rentalFee.toNumber(),
    deposit: order.depositAmount.toNumber(),
    shippingName: order.shippingName,
    shippingPhone: order.shippingPhone,
    shippingAddress: order.shippingAddress,
    shippingCity: order.shippingCity,
    shippingDistrict: order.shippingDistrict,
    shippingWard: order.shippingWard,
    shippingNote: order.shippingNote,
    returnName: order.returnName,
    returnPhone: order.returnPhone,
    returnAddress: order.returnAddress,
    returnCity: order.returnCity,
    returnDistrict: order.returnDistrict,
    returnWard: order.returnWard,
    returnAddressNote: order.returnAddressNote,
    lateFee: order.lateFee.toNumber(),
    damageFee: order.damageFee.toNumber(),
    refundAmount: order.refundAmount.toNumber(),
    returnNotes: order.returnNotes,
    pickupNotes: order.pickupNotes,
    pickupImages: order.pickupImages,
    returnImages: order.returnImages,
    damageDescription: order.damageDescription,
    image: order.rentalItem.product.images[0]?.url ?? "/images/placeholder.jpg",
    latestDispute: latestDispute
      ? {
          id: latestDispute.id,
          status: latestDispute.status,
          statusLabel: rentalDisputeStatusLabels[latestDispute.status],
          reason: latestDispute.reason,
          description: latestDispute.description,
          shopResponse: latestDispute.shopResponse,
          adminNote: latestDispute.adminNote,
          refundAmount: latestDispute.refundAmount?.toNumber() ?? null,
          createdAt: latestDispute.createdAt.toISOString(),
        }
      : null,
  }
}

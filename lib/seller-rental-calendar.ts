import type { Prisma } from "@/app/generated/prisma/client"
import { RentalStatus } from "@/app/generated/prisma/enums"

export const rentalStatusLabels: Record<RentalStatus, string> = {
  [RentalStatus.PENDING]: "Chờ xác nhận",
  [RentalStatus.CONFIRMED]: "Đã xác nhận",
  [RentalStatus.DEPOSIT_PAID]: "Đã cọc",
  [RentalStatus.READY_FOR_PICKUP]: "Sẵn sàng lấy",
  [RentalStatus.RENTED]: "Đang thuê",
  [RentalStatus.RETURNED]: "Đã trả",
  [RentalStatus.DEPOSIT_REFUNDED]: "Đã hoàn cọc",
  [RentalStatus.COMPLETED]: "Hoàn tất",
  [RentalStatus.CANCELLED]: "Đã hủy",
  [RentalStatus.OVERDUE]: "Quá hạn",
}

export const sellerRentalCalendarInclude = {
  user: { select: { id: true, name: true, phone: true } },
  rentalItem: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: {
            where: { isPrimary: true },
            select: { url: true },
            take: 1,
          },
        },
      },
    },
  },
} satisfies Prisma.RentalOrderInclude

type SellerRentalCalendarOrder = Prisma.RentalOrderGetPayload<{
  include: typeof sellerRentalCalendarInclude
}>

export function serializeSellerRentalCalendarItem(
  order: SellerRentalCalendarOrder
) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customer: {
      id: order.user.id,
      name: order.user.name,
      phone: order.user.phone,
    },
    product: {
      id: order.rentalItem.product.id,
      name: order.rentalItem.product.name,
      slug: order.rentalItem.product.slug,
      image: order.rentalItem.product.images[0]?.url ?? null,
    },
    startDate: order.startDate.toISOString(),
    endDate: order.endDate.toISOString(),
    actualReturnDate: order.actualReturnDate?.toISOString() ?? null,
    totalDays: order.totalDays,
    rentalFee: order.rentalFee.toNumber(),
    depositAmount: order.depositAmount.toNumber(),
    status: order.status,
    statusLabel: rentalStatusLabels[order.status],
  }
}

export type SellerRentalCalendarItem = ReturnType<
  typeof serializeSellerRentalCalendarItem
>

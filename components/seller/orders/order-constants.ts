import { CustomOrderStatus, OrderStatus } from "@/app/generated/prisma/enums"

export const orderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "Chờ xác nhận",
  [OrderStatus.CONFIRMED]: "Đã xác nhận",
  [OrderStatus.PROCESSING]: "Đang xử lý",
  [OrderStatus.SHIPPING]: "Đang giao",
  [OrderStatus.DELIVERED]: "Đã giao",
  [OrderStatus.COMPLETED]: "Hoàn tất",
  [OrderStatus.CANCELLED]: "Đã hủy",
  [OrderStatus.REFUNDED]: "Đã hoàn tiền",
}

export const customOrderStatusLabels: Record<CustomOrderStatus, string> = {
  [CustomOrderStatus.DRAFT]: "Nháp",
  [CustomOrderStatus.SUBMITTED]: "Chờ seller nhận",
  [CustomOrderStatus.QUOTED]: "Đã báo giá",
  [CustomOrderStatus.QUOTE_ACCEPTED]: "Khách đã chốt giá",
  [CustomOrderStatus.DEPOSIT_PAID]: "Đã đặt cọc",
  [CustomOrderStatus.IN_PROGRESS]: "Đang gia công",
  [CustomOrderStatus.REVISION_REQUESTED]: "Yêu cầu chỉnh sửa",
  [CustomOrderStatus.READY]: "Sẵn sàng giao",
  [CustomOrderStatus.COMPLETED]: "Hoàn tất",
  [CustomOrderStatus.CANCELLED]: "Đã hủy",
}

export const orderTypeLabels = {
  SALE: "Bán đứt",
  RENTAL: "Thuê",
  CUSTOM: "Đặt may",
} as const

export const sellerOrderRoutes = {
  list: "/seller/orders",
} as const

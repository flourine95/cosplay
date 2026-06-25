import { OrderStatus } from "@/app/generated/prisma/enums"

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

export const orderTypeLabels = {
  SALE: "Bán đứt",
  RENTAL: "Thuê",
} as const

export const sellerOrderRoutes = {
  list: "/seller/orders",
} as const

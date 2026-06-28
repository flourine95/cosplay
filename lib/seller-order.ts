import type { Prisma } from "@/app/generated/prisma/client"
import { OrderStatus } from "@/app/generated/prisma/enums"

export const sellerOrderInclude = {
  user: { select: { id: true, name: true, phone: true, email: true } },
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          images: {
            where: { isPrimary: true },
            select: { url: true },
            take: 1,
          },
        },
      },
      variant: { select: { id: true, name: true } },
    },
    orderBy: { id: "asc" },
  },
  statusHistory: {
    orderBy: { createdAt: "desc" },
    take: 10,
  },
} satisfies Prisma.OrderInclude

export type SellerOrderWithRelations = Prisma.OrderGetPayload<{
  include: typeof sellerOrderInclude
}>

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

export const allowedOrderTransitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPING, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPING]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED, OrderStatus.REFUNDED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUNDED]: [],
}

export function serializeSellerOrder(order: SellerOrderWithRelations) {
  const itemTypes = new Set(order.items.map((item) => item.product.type))
  const orderType =
    itemTypes.has("RENTAL") || itemTypes.has("BOTH") ? "RENTAL" : "SALE"

  return {
    id: order.id,
    source: "ORDER" as const,
    orderNumber: order.orderNumber,
    orderType,
    customer: {
      id: order.user.id,
      name: order.user.name,
      phone: order.user.phone,
      email: order.user.email,
    },
    shipping: {
      name: order.shippingName,
      phone: order.shippingPhone,
      address: order.shippingAddress,
      city: order.shippingCity,
      district: order.shippingDistrict,
      ward: order.shippingWard,
      note: order.shippingNote,
    },
    subtotal: order.subtotal.toNumber(),
    shippingFee: order.shippingFee.toNumber(),
    discount: order.discount.toNumber(),
    tax: order.tax.toNumber(),
    total: order.total.toNumber(),
    status: order.status,
    statusLabel: orderStatusLabels[order.status],
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    escrowStatus: order.escrowStatus,
    customerNote: order.customerNote,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productSlug: item.product.slug,
      productName: item.productName,
      variantId: item.variantId,
      variantName: item.variantName,
      image: item.product.images[0]?.url ?? null,
      price: item.price.toNumber(),
      quantity: item.quantity,
      subtotal: item.subtotal.toNumber(),
    })),
    statusHistory: order.statusHistory.map((history) => ({
      id: history.id,
      status: history.status,
      statusLabel: orderStatusLabels[history.status],
      note: history.note,
      createdBy: history.createdBy,
      createdAt: history.createdAt.toISOString(),
    })),
    nextStatuses: allowedOrderTransitions[order.status],
  }
}

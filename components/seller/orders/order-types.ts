import type {
  CustomOrderStatus,
  OrderStatus,
} from "@/app/generated/prisma/enums"

export type OrderType = "SALE" | "RENTAL" | "CUSTOM"
export type OrderTypeFilter = "all" | "sale" | "rental" | "custom"
export type OrderStatusFilter = OrderStatus | CustomOrderStatus | "all"

export type SellerOrderListItem = {
  id: number
  source: "ORDER" | "CUSTOM_ORDER"
  orderNumber: string
  orderType: OrderType
  customer: {
    id: number
    name: string
    phone: string | null
    email: string
  }
  shipping: {
    name: string
    phone: string
    address: string
    city: string
    district: string
    ward: string
    note: string | null
  }
  subtotal: number
  shippingFee: number
  discount: number
  tax: number
  total: number
  status: OrderStatus | CustomOrderStatus
  statusLabel: string
  paymentStatus: string
  paymentMethod: string
  escrowStatus: string
  customerNote: string | null
  createdAt: string
  updatedAt: string
  items: {
    id: number
    productId: number
    productSlug: string
    productName: string
    variantId: number | null
    variantName: string | null
    image: string | null
    price: number
    quantity: number
    subtotal: number
  }[]
  statusHistory: {
    id: number
    status: OrderStatus | CustomOrderStatus
    statusLabel: string
    note: string | null
    createdBy: number | null
    createdAt: string
  }[]
  nextStatuses: OrderStatus[]
}

export type SellerOrdersResponse = {
  orders: SellerOrderListItem[]
  stats: {
    total: number
    sale: number
    rental: number
    custom: number
    byStatus: Record<string, number>
  }
}

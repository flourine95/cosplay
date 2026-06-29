import type { CustomOrderStatus } from "@/app/generated/prisma/enums"

export type SellerQuoteOrder = {
  id: number
  orderNumber: string
  title: string
  description: string
  deadline: string | null
  status: CustomOrderStatus
  statusLabel: string
  estimatedPrice: number | null
  depositAmount: number | null
  createdAt: string
  customer: {
    id: number
    name: string
    phone: string | null
    email: string
  }
  quotes: {
    id: number
    quotedPrice: number
    depositAmount: number
    estimatedDays: number
    description: string | null
    isAccepted: boolean
    isRejected: boolean
    createdAt: string
  }[]
}

export type SellerQuotesResponse = {
  orders: SellerQuoteOrder[]
  stats: {
    total: number
    needsQuote: number
    inProgress: number
    ready: number
  }
}

export type QuoteFormState = {
  quotedPrice: string
  depositAmount: string
  estimatedDays: string
  description: string
}

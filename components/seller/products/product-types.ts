import type {
  ProductStatus,
  ProductType,
  RentalItemCondition,
} from "@/app/generated/prisma/enums"

export type SellerProductListItem = {
  id: number
  slug: string
  name: string
  sku: string | null
  categoryName: string
  type: ProductType
  businessTypes: string[]
  status: ProductStatus
  price: number
  image: string | null
  totalStock: number
  rented: number
  rental: { pricePerDay: number } | null
}

export type SellerProductsResponse = {
  products: SellerProductListItem[]
  stats: {
    total: number
    active: number
    totalStock: number
    rented: number
  }
  profileCompletion?: {
    isComplete: boolean
    missingFields: string[]
  }
}

export type SellerProductResponse = {
  id: number
  slug: string
  name: string
  sku: string | null
  categoryId: number
  type: ProductType
  status: ProductStatus
  description: string | null
  shortDescription: string | null
  condition: string | undefined
  price: number
  comparePrice: number | null
  tags: string[]
  images: string[]
  variants: { id: number; size: string; sku: string | null; stock: number }[]
  rental: {
    pricePerDay: number
    depositAmount: number
    minDays: number
    maxDays: number | null
    condition: RentalItemCondition
  } | null
}

export type SellerProductCategory = {
  id: number
  name: string
  slug: string
  parentId: number | null
}

export type ProductStatusFilter = ProductStatus | "all"
export type ProductTypeFilter = ProductType | "all"
export type ProductSortField = "name" | "stock" | "rented"
export type SortDirection = "asc" | "desc"

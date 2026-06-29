import type { Prisma } from "@/app/generated/prisma/client"
import { ProductType, RentalStatus } from "@/app/generated/prisma/enums"

// Các trạng thái thuê được coi là "đang cho thuê" (đồ đang ở ngoài).
export const ACTIVE_RENTAL_STATUSES: RentalStatus[] = [
  RentalStatus.DEPOSIT_PAID,
  RentalStatus.READY_FOR_PICKUP,
  RentalStatus.RENTED,
  RentalStatus.OVERDUE,
]

// Quan hệ cần include để serialize đầy đủ một sản phẩm của seller.
export const sellerProductInclude = {
  category: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { order: "asc" } },
  variants: { orderBy: { id: "asc" } },
  rentalItem: {
    include: {
      _count: {
        select: {
          rentalOrders: { where: { status: { in: ACTIVE_RENTAL_STATUSES } } },
        },
      },
    },
  },
} satisfies Prisma.ProductInclude

type SellerProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof sellerProductInclude
}>

const businessTypeLabels: Record<ProductType, string[]> = {
  [ProductType.SALE]: ["Bán"],
  [ProductType.RENTAL]: ["Thuê"],
  [ProductType.BOTH]: ["Bán", "Thuê"],
}

export function serializeSellerProduct(product: SellerProductWithRelations) {
  const variants = product.variants.map((variant) => ({
    id: variant.id,
    size: variant.name,
    sku: variant.sku,
    stock: variant.stock,
  }))

  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0)
  const primaryImage =
    product.images.find((img) => img.isPrimary) ?? product.images[0]

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    sku: product.sku,
    categoryId: product.categoryId,
    categoryName: product.category.name,
    type: product.type,
    businessTypes: businessTypeLabels[product.type],
    status: product.status,
    description: product.description,
    shortDescription: product.shortDescription,
    condition: product.tags.find((t) => t.startsWith("condition:"))?.slice(10),
    price: product.price.toNumber(),
    comparePrice: product.comparePrice?.toNumber() ?? null,
    tags: product.tags,
    image: primaryImage?.url ?? null,
    images: product.images.map((img) => img.url),
    variants,
    totalStock,
    rented: product.rentalItem?._count.rentalOrders ?? 0,
    rental: product.rentalItem
      ? {
          pricePerDay: product.rentalItem.pricePerDay.toNumber(),
          depositAmount: product.rentalItem.depositAmount.toNumber(),
          minDays: product.rentalItem.minDays,
          maxDays: product.rentalItem.maxDays,
          condition: product.rentalItem.condition,
          isAvailable: product.rentalItem.isAvailable,
        }
      : null,
  }
}

export type SerializedSellerProduct = ReturnType<typeof serializeSellerProduct>

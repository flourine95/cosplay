import { ProductType } from "@/app/generated/prisma/enums"
import type { Product as FrontendProduct } from "@/lib/products"

const PLACEHOLDER_IMAGE = "/images/placeholder.jpg"

type DecimalLike = {
  toNumber?: () => number
  toString: () => string
}

type DbProductVariantForFrontend = {
  name: string
  stock: number
  attributes: unknown
}

type DbProductForFrontend = {
  name: string
  slug: string
  description: string | null
  shortDescription: string | null
  price: DecimalLike
  comparePrice: DecimalLike | null
  type: ProductType
  tags: string[]
  rating: number
  reviewCount: number
  soldCount: number
  createdAt: Date
  category?: {
    name: string
  } | null
  images?: Array<{
    url: string
    order: number
    isPrimary: boolean
  }>
  variants?: DbProductVariantForFrontend[]
  rentalItem?: {
    pricePerDay: DecimalLike
  } | null
}

const decimalToNumber = (value: DecimalLike | null | undefined) => {
  if (!value) return null
  return value.toNumber ? value.toNumber() : Number(value.toString())
}

const getVariantSize = (variant: DbProductVariantForFrontend) => {
  const attributes =
    typeof variant.attributes === "string"
      ? JSON.parse(variant.attributes)
      : variant.attributes

  if (
    attributes &&
    typeof attributes === "object" &&
    "size" in attributes &&
    typeof attributes.size === "string"
  ) {
    return attributes.size
  }

  return variant.name
}

const getBadge = (product: DbProductForFrontend) => {
  if (product.tags.includes("badge:premium")) return "Premium"
  if (product.tags.includes("badge:hot")) return "Hot"
  if (product.tags.includes("badge:new")) return "Mới"
  if (product.soldCount >= 20) return "Bán chạy"

  const daysSinceCreated =
    (Date.now() - product.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  if (daysSinceCreated <= 14) return "Mới"

  return null
}

export function mapDbProductToFrontendProduct(
  product: DbProductForFrontend
): FrontendProduct {
  const images = [...(product.images ?? [])]
    .sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1
      return a.order - b.order
    })
    .map((image) => image.url)

  const sizes = Array.from(
    new Set(
      (product.variants ?? []).filter((v) => v.stock > 0).map(getVariantSize)
    )
  )

  const price = decimalToNumber(product.price) ?? 0
  const rentPrice = product.rentalItem
    ? decimalToNumber(product.rentalItem.pricePerDay)
    : null

  return {
    slug: product.slug,
    name: product.name,
    series:
      product.tags.find((tag) => tag.startsWith("series:"))?.slice(7) ??
      "Cosplay",
    category: product.category?.name ?? "Khác",
    price,
    originalPrice: decimalToNumber(product.comparePrice),
    rentPrice,
    canRent:
      product.type === ProductType.RENTAL || product.type === ProductType.BOTH,
    rating: product.rating,
    reviewCount: product.reviewCount,
    badge: getBadge(product),
    images: images.length > 0 ? images : [PLACEHOLDER_IMAGE],
    sizes: sizes.length > 0 ? sizes : ["M"],
    description:
      product.description ??
      product.shortDescription ??
      "Sản phẩm cosplay được đăng bán trên cosplay.vn.",
    details: [
      { label: "Danh mục", value: product.category?.name ?? "Khác" },
      {
        label: "Hình thức",
        value:
          product.type === ProductType.BOTH
            ? "Mua hoặc thuê"
            : product.type === ProductType.RENTAL
              ? "Thuê"
              : "Mua",
      },
      { label: "Kích thước", value: sizes.length > 0 ? sizes.join(", ") : "M" },
      { label: "Giao hàng", value: "2-5 ngày toàn quốc" },
      { label: "Đổi trả", value: "7 ngày nếu lỗi sản xuất" },
    ],
    createdAt: product.createdAt.toISOString(),
  }
}

import {
  RentalItemCondition,
  ProductStatus,
  ProductType,
} from "@/app/generated/prisma/enums"
import type {
  SellerProductFormValues,
  SellerProductInput,
} from "@/schemas/seller-product"
import { sellerProductSchema } from "@/schemas/seller-product"
import type { SellerProductResponse } from "./product-types"

export const defaultProductFormValues: SellerProductFormValues = {
  name: "",
  slug: "",
  categoryId: 0,
  description: "",
  shortDescription: "",
  condition: "Mới 100%",
  price: "",
  comparePrice: undefined,
  sku: "",
  type: ProductType.SALE,
  status: ProductStatus.DRAFT,
  tags: [],
  imageUrls: [],
  variants: [{ size: "Free-size", sku: "", stock: 1 }],
  rentalPricePerDay: undefined,
  rentalDepositAmount: undefined,
  rentalAccessories: "",
  rentalMinDays: 1,
  rentalMaxDays: undefined,
  rentalCondition: RentalItemCondition.EXCELLENT,
}

export const productConditionOptions = [
  "Mới 100%",
  "Như mới 95%",
  "Đã sử dụng 80%",
  "Có lỗi nhẹ",
]

export function toProductFormValues(
  product: SellerProductResponse
): SellerProductFormValues {
  return {
    name: product.name,
    slug: product.slug,
    categoryId: product.categoryId,
    description: product.description ?? "",
    shortDescription: product.shortDescription ?? "",
    condition: product.condition ?? "Mới 100%",
    price: product.price,
    comparePrice: product.comparePrice ?? undefined,
    sku: product.sku ?? "",
    type: product.type,
    status: ProductStatus.DRAFT,
    tags: product.tags.filter((tag) => !tag.startsWith("condition:")),
    imageUrls: product.images,
    variants:
      product.variants.length > 0
        ? product.variants.map((variant) => ({
            size: variant.size,
            sku: variant.sku ?? "",
            stock: variant.stock,
          }))
        : [{ size: "Free-size", sku: "", stock: 1 }],
    rentalPricePerDay: product.rental?.pricePerDay ?? undefined,
    rentalDepositAmount: product.rental?.depositAmount ?? undefined,
    rentalAccessories: "",
    rentalMinDays: product.rental?.minDays ?? 1,
    rentalMaxDays: product.rental?.maxDays ?? undefined,
    rentalCondition: product.rental?.condition ?? RentalItemCondition.EXCELLENT,
  }
}

export function normalizeProductPayload(
  values: SellerProductFormValues
): SellerProductInput {
  const cleaned = {
    ...values,
    comparePrice: values.comparePrice || undefined,
    sku: values.sku?.trim() || undefined,
    description: values.description?.trim() || undefined,
    shortDescription: values.shortDescription?.trim() || undefined,
    condition: values.condition?.trim() || undefined,
    rentalPricePerDay: values.rentalPricePerDay || undefined,
    rentalDepositAmount: values.rentalDepositAmount || undefined,
    rentalAccessories: values.rentalAccessories?.trim() || undefined,
    rentalMaxDays: values.rentalMaxDays || undefined,
    tags: values.tags ?? [],
    imageUrls: values.imageUrls.filter(Boolean),
    variants: values.variants.map((variant) => ({
      size: variant.size.trim(),
      sku: variant.sku?.trim() || undefined,
      stock: variant.stock,
    })),
  }

  return sellerProductSchema.parse(cleaned)
}

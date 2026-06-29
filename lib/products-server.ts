import { Product as FrontendProduct } from "./products"
import {
  Product as DbProduct,
  ProductImage,
  Category,
  RentalItem,
  ProductVariant,
} from "@/app/generated/prisma/client"

export interface DbProductWithRelations extends Omit<
  DbProduct,
  "price" | "comparePrice"
> {
  price: string | number | { toString(): string }
  comparePrice: string | number | { toString(): string } | null
  images?: ProductImage[] | null
  category?: Category | null
  rentalItem?:
    | (Omit<RentalItem, "pricePerDay" | "depositAmount"> & {
        pricePerDay: string | number | { toString(): string }
        depositAmount: string | number | { toString(): string }
      })
    | null
  variants?: ProductVariant[] | null
}

export function mapDbProductToFrontendProduct(
  dbProduct: DbProductWithRelations
): FrontendProduct {
  const price = Number(dbProduct.price)
  const originalPrice = dbProduct.comparePrice
    ? Number(dbProduct.comparePrice)
    : null
  const rentPrice = dbProduct.rentalItem
    ? Number(dbProduct.rentalItem.pricePerDay)
    : null
  const canRent = dbProduct.type === "RENTAL" || dbProduct.type === "BOTH"

  // Extract and capitalize the first tag for the series name
  let series = "Cosplay"
  if (dbProduct.tags && dbProduct.tags.length > 0) {
    const [firstTag] = dbProduct.tags
    if (firstTag) {
      series = firstTag
        .split(" ")
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    }
  }

  // Extract unique sizes from product variants' attributes JSON
  const sizesSet = new Set<string>()
  if (dbProduct.variants) {
    dbProduct.variants.forEach((v: ProductVariant) => {
      let sizeVal: string | null = null
      const attrs = v.attributes
      if (typeof attrs === "string") {
        try {
          const parsed = JSON.parse(attrs) as Record<string, unknown>
          if (
            parsed &&
            typeof parsed === "object" &&
            typeof parsed.size === "string"
          ) {
            sizeVal = parsed.size
          }
        } catch {
          // ignore
        }
      } else if (attrs && typeof attrs === "object" && !Array.isArray(attrs)) {
        const obj = attrs as Record<string, unknown>
        if (typeof obj.size === "string") {
          sizeVal = obj.size
        }
      }
      if (sizeVal) {
        sizesSet.add(sizeVal)
      }
    })
  }
  const sizes = sizesSet.size > 0 ? Array.from(sizesSet) : ["S", "M", "L", "XL"]

  // Dynamically assign badges based on product conditions
  let badge: string | null = null
  if (originalPrice && originalPrice > price) {
    badge = "Giảm giá"
  } else if (dbProduct.rating >= 4.9 && dbProduct.reviewCount >= 100) {
    badge = "Bán chạy"
  } else if (canRent) {
    badge = "Thuê được"
  } else if (dbProduct.rating >= 4.8) {
    badge = "Hot"
  }

  // Extract and sort images by order
  const images = dbProduct.images
    ? [...dbProduct.images]
        .sort(
          (a: ProductImage, b: ProductImage) => (a.order || 0) - (b.order || 0)
        )
        .map((img: ProductImage) => img.url)
    : []

  if (images.length === 0) {
    images.push(
      "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&h=1000&fit=crop"
    )
  }

  // Default design details for premium look
  const details = [
    { label: "Chất liệu", value: "Vải cao cấp thiết kế" },
    { label: "Xuất xứ", value: "Sản xuất tại Việt Nam" },
    { label: "Bảo quản", value: "Giặt tay, phơi bóng mát" },
    { label: "Giao hàng", value: "2–5 ngày toàn quốc" },
    { label: "Đổi trả", value: "7 ngày nếu lỗi sản xuất" },
  ]

  return {
    slug: dbProduct.slug,
    name: dbProduct.name,
    series,
    category: dbProduct.category?.name || "Cosplay",
    price,
    originalPrice,
    rentPrice,
    canRent,
    rating: dbProduct.rating || 5.0,
    reviewCount: dbProduct.reviewCount || 0,
    badge,
    images,
    sizes,
    description: dbProduct.description || "",
    details,
  }
}

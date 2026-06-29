import { ProductStatus, ProductType } from "@/app/generated/prisma/enums"

export const productStatusLabels: Record<ProductStatus, string> = {
  [ProductStatus.DRAFT]: "Chờ duyệt",
  [ProductStatus.ACTIVE]: "Đã duyệt",
  [ProductStatus.OUT_OF_STOCK]: "Hết hàng",
  [ProductStatus.DISCONTINUED]: "Từ chối/Ẩn",
}

export const productTypeLabels: Record<ProductType, string> = {
  [ProductType.SALE]: "Chỉ bán",
  [ProductType.RENTAL]: "Chỉ thuê",
  [ProductType.BOTH]: "Bán và thuê",
}

export const sellerProductRoutes = {
  list: "/seller/products",
  new: "/seller/products/new",
} as const

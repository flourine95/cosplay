import { ProductStatus, ProductType } from "@/app/generated/prisma/enums"

export const productStatusLabels: Record<ProductStatus, string> = {
  [ProductStatus.DRAFT]: "Nháp",
  [ProductStatus.ACTIVE]: "Hoạt động",
  [ProductStatus.OUT_OF_STOCK]: "Hết hàng",
  [ProductStatus.DISCONTINUED]: "Ngừng kinh doanh",
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

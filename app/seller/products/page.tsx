import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ProductsSectionNew } from "@/components/seller/section/products-section"

export default function SellerProductsPage() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/seller">Seller Center</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Quản lý sản phẩm</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Quản lý sản phẩm
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Quản lý tồn kho, mô hình kinh doanh (bán, thuê, may đo) và trạng thái
          hiển thị
        </p>
      </div>

      {/* Products Content */}
      <ProductsSectionNew />
    </div>
  )
}

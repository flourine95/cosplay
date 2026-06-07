import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { DashboardSectionNew } from "@/components/seller/section/dashboard-section"

export default function SellerDashboardPage() {
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
            <BreadcrumbPage>Seller Center</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Tổng quan Seller
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Theo dõi hoạt động kinh doanh, đơn hàng mới và các chỉ số quan trọng
        </p>
      </div>

      {/* Dashboard Content */}
      <DashboardSectionNew />
    </div>
  )
}

import { TailoringRequestClient } from "@/components/seller/tailoring/tailoring-request-client"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function SellerTailoringRequestsPage() {
  return (
    <div className="flex flex-col gap-6">
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
            <BreadcrumbLink href="/seller/tailoring">Đặt may</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Nhận yêu cầu</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Nhận yêu cầu đặt may
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Xem yêu cầu mới từ khách, nhận đơn để báo giá hoặc từ chối nếu shop
          không thể thực hiện.
        </p>
      </div>

      <TailoringRequestClient />
    </div>
  )
}

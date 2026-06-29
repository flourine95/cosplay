import { RentalOrderManagement } from "@/components/seller/rentals/rental-order-management"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function SellerRentalsPage() {
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
            <BreadcrumbPage>Đơn thuê</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Quản lý đơn thuê
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Xác nhận đơn, giao đồ, kiểm tra đồ trả và xử lý khiếu nại thuê.
        </p>
      </div>

      <RentalOrderManagement />
    </div>
  )
}

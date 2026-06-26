import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { OrderListClient } from "@/components/seller/orders/order-list-client"

export default function SellerOrdersPage() {
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
            <BreadcrumbPage>Đơn mua & Thuê</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Đơn mua & Thuê
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Quản lý giao dịch, trạng thái xử lý và lịch sử đơn mua/thuê
        </p>
      </div>

      <OrderListClient />
    </div>
  )
}

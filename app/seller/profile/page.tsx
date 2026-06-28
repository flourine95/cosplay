import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SellerProfileClient } from "@/components/seller/seller-profile-client"

export default function SellerProfilePage() {
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
            <BreadcrumbPage>Hồ sơ seller</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Hồ sơ seller</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Cập nhật thông tin shop, giấy tờ và tài khoản nhận payout.
        </p>
      </div>

      <SellerProfileClient />
    </div>
  )
}

import { OrdersSectionNew } from "@/components/seller/section/orders-section"

export default function SellerOrdersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Đơn mua & Thuê
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quản lý đơn hàng mua đứt và đơn thuê trang phục
        </p>
      </div>

      <OrdersSectionNew />
    </div>
  )
}

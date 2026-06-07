import { RevenueSectionNew } from "@/components/seller/section/revenue-section"

export default function SellerRevenuePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Quản lý tài chính
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Theo dõi doanh thu, tiền cọc và các khoản thanh toán
        </p>
      </div>

      <RevenueSectionNew />
    </div>
  )
}

import { StatisticsSectionNew } from "@/components/seller/section/statistics-section"

export default function SellerStatisticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Thống kê
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Xem hiệu suất bán hàng, sản phẩm bán chạy và đánh giá khách hàng
        </p>
      </div>

      <StatisticsSectionNew />
    </div>
  )
}

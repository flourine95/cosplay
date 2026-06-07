import { TailoringSectionNew } from "@/components/seller/section/tailoring-section"

export default function SellerTailoringPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Quản lý đặt may
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tiếp nhận yêu cầu đặt may, báo giá và cập nhật tiến độ gia công
        </p>
      </div>

      <TailoringSectionNew />
    </div>
  )
}

import { CalendarSectionNew } from "@/components/seller/section/calendar-section"

export default function SellerCalendarPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Lịch trình thuê
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quản lý lịch giao hàng, nhận trả và bảo trì trang phục
        </p>
      </div>

      <CalendarSectionNew />
    </div>
  )
}

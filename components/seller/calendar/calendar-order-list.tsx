import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"
import { rentalCalendarStatusClasses } from "./calendar-constants"
import { formatShortDate } from "./calendar-utils"
import type { RentalCalendarItem } from "./calendar-types"

export function CalendarOrderList({ items }: { items: RentalCalendarItem[] }) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>Lịch trình giao/nhận</CardTitle>
        <p className="text-sm text-muted-foreground">
          Dữ liệu từ đơn thuê, chỉ hiển thị để theo dõi lịch vận hành
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {items.length === 0 ? (
            <div className="rounded-lg border border-border/60 p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Không có đơn thuê trong ngày đã chọn
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-border/60 p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{item.product.name}</p>
                    <Badge
                      variant="secondary"
                      className={rentalCalendarStatusClasses[item.status]}
                    >
                      {item.statusLabel}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.customer.name} · {item.customer.phone ?? "-"} ·{" "}
                    {item.orderNumber}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Phí thuê {formatCurrency(item.rentalFee)} · Cọc{" "}
                    {formatCurrency(item.depositAmount)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {formatShortDate(item.startDate)} -{" "}
                    {formatShortDate(item.endDate)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.totalDays} ngày
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

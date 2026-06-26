import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"
import type { RevenueData } from "./revenue-types"

export function RevenueModelCard({
  items,
}: {
  items: RevenueData["revenueByModel"]
}) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>Doanh thu theo mô hình</CardTitle>
        <p className="text-sm text-muted-foreground">
          Tổng hợp từ đơn mua, thuê và đặt may trong DB.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {items.map((item) => (
          <div key={item.model} className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{item.model}</p>
                <p className="text-xs text-muted-foreground">
                  {item.orders} đơn
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary">
                  {formatCurrency(item.amount)}
                </p>
                <p className="text-xs text-muted-foreground">{item.percent}%</p>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary"
                style={{ width: `${item.percent}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

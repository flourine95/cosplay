import { Clock, Star, TrendingUp, Users } from "lucide-react"
import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { StatisticsData } from "./statistics-types"

export function StatisticsKpis({ kpis }: { kpis: StatisticsData["kpis"] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Kpi
        icon={Star}
        label="Đánh giá trung bình"
        value={kpis.averageRating}
        note={`${kpis.reviewCount} đánh giá`}
      />
      <Kpi
        icon={TrendingUp}
        label="Tỉ lệ hoàn thành"
        value={`${kpis.completionRate}%`}
        note="Đơn hoàn tất"
      />
      <Kpi
        icon={Clock}
        label="Thời gian phản hồi"
        value={`${kpis.responseMinutes} phút`}
        note="Trung bình"
      />
      <Kpi
        icon={Users}
        label="Khách quay lại"
        value={`${kpis.returnCustomerRate}%`}
        note="Theo dữ liệu đơn hàng"
      />
    </div>
  )
}

function Kpi({
  icon: Icon,
  label,
  note,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  note: string
  value: number | string
}) {
  return (
    <Card className="border-border/60">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <div className="rounded-full bg-muted p-2">
          <Icon className="size-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  )
}

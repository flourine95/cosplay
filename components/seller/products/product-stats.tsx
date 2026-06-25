import type React from "react"
import { ArrowUpDown, Boxes, PackageCheck, Shirt } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPercent } from "@/lib/format"
import type { SellerProductsResponse } from "./product-types"

type ProductStatsProps = {
  stats: SellerProductsResponse["stats"]
}

export function ProductStats({ stats }: ProductStatsProps) {
  const rentalRate =
    stats.totalStock > 0
      ? formatPercent((stats.rented / stats.totalStock) * 100)
      : "0%"

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SellerStatCard
        icon={Shirt}
        label="Tổng sản phẩm"
        note={`${stats.active} đang hiển thị`}
        value={stats.total}
      />
      <SellerStatCard
        icon={Boxes}
        label="Tồn theo size"
        note="Tổng tồn từ biến thể"
        value={stats.totalStock}
      />
      <SellerStatCard
        icon={PackageCheck}
        label="Đang cho thuê"
        note="Đồ đang ở ngoài"
        value={stats.rented}
      />
      <SellerStatCard
        icon={ArrowUpDown}
        label="Tỷ lệ đang thuê"
        note="Trên tổng tồn kho"
        value={rentalRate}
      />
    </div>
  )
}

function SellerStatCard({
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
        <div className="flex size-8 items-center justify-center rounded-full bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-foreground">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  )
}

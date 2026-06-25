import type React from "react"
import { AlertCircle, Boxes, PackageCheck, Shirt } from "lucide-react"

import { ProductStatus, ProductType } from "@/app/generated/prisma/enums"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type {
  SellerProductListItem,
  SellerProductsResponse,
} from "./product-types"

type ProductStatsProps = {
  products: SellerProductListItem[]
  stats: SellerProductsResponse["stats"]
}

export function ProductStats({ products, stats }: ProductStatsProps) {
  const needsAttention = products.filter((product) => {
    return (
      !product.image ||
      product.totalStock === 0 ||
      product.status === ProductStatus.DRAFT ||
      (product.type !== ProductType.SALE && !product.rental)
    )
  }).length

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
        emphasis={needsAttention > 0}
        icon={AlertCircle}
        label="Cần xử lý"
        note="Thiếu ảnh, kho, cấu hình hoặc còn nháp"
        value={needsAttention}
      />
    </div>
  )
}

function SellerStatCard({
  icon: Icon,
  label,
  note,
  value,
  emphasis = false,
}: {
  emphasis?: boolean
  icon: React.ComponentType<{ className?: string }>
  label: string
  note: string
  value: number | string
}) {
  return (
    <Card
      className={
        emphasis ? "border-primary/35 bg-brand-subtle/45" : "border-border/60"
      }
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-foreground/75">
          {label}
        </CardTitle>
        <div className="flex size-8 items-center justify-center rounded-full bg-muted">
          <Icon className="size-4 text-foreground/65" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-foreground">{value}</div>
        <p className="mt-1 text-xs text-foreground/65">{note}</p>
      </CardContent>
    </Card>
  )
}

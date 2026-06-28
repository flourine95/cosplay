import type React from "react"
import { AlertCircle, Banknote, PackageCheck, Truck } from "lucide-react"

import { OrderStatus } from "@/app/generated/prisma/enums"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"
import type { SellerOrderListItem, SellerOrdersResponse } from "./order-types"

const actionableStatuses: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
]

type OrderStatsProps = {
  orders: SellerOrderListItem[]
  stats: SellerOrdersResponse["stats"]
}

export function OrderStats({ orders, stats }: OrderStatsProps) {
  const revenueInView = orders
    .filter((order) => order.status !== OrderStatus.CANCELLED)
    .reduce((sum, order) => sum + order.total, 0)
  const needsAttention = orders.filter((order) =>
    actionableStatuses.includes(order.status as OrderStatus)
  ).length
  const shipping = stats.byStatus[OrderStatus.SHIPPING] ?? 0

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SellerStatCard
        icon={PackageCheck}
        label="Tổng đơn"
        note={`${stats.sale} bán đứt · ${stats.rental} thuê`}
        value={stats.total}
      />
      <SellerStatCard
        icon={AlertCircle}
        label="Cần xử lý"
        note="Đơn chờ xác nhận hoặc đang chuẩn bị"
        value={needsAttention}
        emphasis={needsAttention > 0}
      />
      <SellerStatCard
        icon={Truck}
        label="Đang giao"
        note="Cần theo dõi vận chuyển"
        value={shipping}
      />
      <SellerStatCard
        icon={Banknote}
        label="Giá trị hiển thị"
        note="Không tính đơn đã hủy"
        value={formatCurrency(revenueInView)}
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

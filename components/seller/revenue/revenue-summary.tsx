import { Clock, DollarSign, Wallet } from "lucide-react"
import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"
import type { RevenueData } from "./revenue-types"

export function RevenueSummary({
  summary,
}: {
  summary: RevenueData["summary"]
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <RevenueMetric
        icon={DollarSign}
        label="Doanh thu tháng"
        value={summary.monthRevenue}
      />
      <RevenueMetric
        icon={Wallet}
        label="Số dư khả dụng"
        value={summary.availableBalance}
      />
      <RevenueMetric
        icon={Clock}
        label="Tiền cọc đang giữ"
        value={summary.heldDeposits}
      />
      <RevenueMetric
        icon={Clock}
        label="Chờ thanh toán"
        value={summary.pendingPayments}
      />
    </div>
  )
}

function RevenueMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
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
        <div className="text-2xl font-bold">{formatCurrency(value)}</div>
      </CardContent>
    </Card>
  )
}

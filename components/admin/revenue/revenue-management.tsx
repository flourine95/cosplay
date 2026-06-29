import { DollarSign, TrendingUp } from "lucide-react"
import { PayoutManagement } from "@/components/admin/revenue/payout-management"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type RevenueTypeRow = {
  type: string
  amount: number
  percent: number
  color: string
}

type MonthlyRevenueRow = {
  month: string
  amount: number
}

type EligiblePayoutRow = {
  sellerId: number
  sellerName: string
  sellerEmail: string
  bankName: string | null
  bankAccount: string | null
  bankAccountName: string | null
  orderCount: number
  grossAmount: number
  platformFee: number
  netAmount: number
}

type PayoutRow = {
  id: number
  sellerName: string
  orderCount: number
  amount: number
  platformFee: number
  netAmount: number
  status: string
  bankName: string | null
  bankAccount: string | null
  bankAccountName: string | null
  transferProof: string | null
  createdAt: string
  processedAt: string | null
}

interface RevenueManagementProps {
  currentMonthRevenue: number
  previousMonthRevenue: number
  growthRate: number
  revenueByType: RevenueTypeRow[]
  monthlyRevenue: MonthlyRevenueRow[]
  eligiblePayouts: EligiblePayoutRow[]
  payouts: PayoutRow[]
  escrowHolding: number
  escrowReady: number
  escrowReleased: number
}

const formatCurrency = (value: number): string =>
  `${value.toLocaleString("vi-VN")}đ`

const formatCompactCurrency = (value: number): string => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString("vi-VN", {
      maximumFractionDigits: 1,
    })} triệu`
  }
  return formatCurrency(value)
}

export default function RevenueManagement({
  currentMonthRevenue,
  previousMonthRevenue,
  growthRate,
  revenueByType,
  monthlyRevenue,
  eligiblePayouts,
  payouts,
  escrowHolding,
  escrowReady,
  escrowReleased,
}: RevenueManagementProps) {
  const stats = [
    {
      label: "Doanh thu tháng này",
      value: formatCompactCurrency(currentMonthRevenue),
      icon: DollarSign,
      trend: `${growthRate >= 0 ? "+" : ""}${growthRate.toFixed(1)}%`,
    },
    {
      label: "Doanh thu tháng trước",
      value: formatCompactCurrency(previousMonthRevenue),
      icon: DollarSign,
      trend: null,
    },
    {
      label: "Tăng trưởng",
      value: `${growthRate >= 0 ? "+" : ""}${growthRate.toFixed(1)}%`,
      icon: TrendingUp,
      trend: null,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Quản lý doanh thu
        </h1>
        <p className="text-sm text-muted-foreground">
          Theo dõi doanh thu hệ thống từ đơn bán, đơn thuê và đặt may.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="border-border/60">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div className="rounded-full bg-muted p-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {stat.value}
                </div>
                {stat.trend && (
                  <p
                    className={`mt-2 text-sm ${
                      growthRate >= 0 ? "text-emerald-600" : "text-destructive"
                    }`}
                  >
                    {stat.trend}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Doanh thu theo loại giao dịch</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {revenueByType.map((item) => (
            <div key={item.type} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${item.color}`} />
                  <span className="font-semibold text-foreground">
                    {item.type}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {item.percent.toFixed(1)}%
                  </span>
                  <span className="font-bold text-foreground">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full ${item.color}`}
                  style={{ width: `${Math.min(item.percent, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Doanh thu 4 tháng gần nhất</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyRevenue.map((item, index) => (
              <div
                key={item.month}
                className="flex items-center justify-between border-b border-border pb-4 last:border-0"
              >
                <div className="flex items-center gap-4">
                  <Badge variant="secondary">{item.month}</Badge>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
                {index > 0 &&
                  item.amount >= (monthlyRevenue[index - 1]?.amount ?? 0) && (
                    <div className="flex items-center gap-1 text-sm text-emerald-600">
                      <TrendingUp className="h-4 w-4" />
                      <span>Tăng</span>
                    </div>
                  )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <PayoutManagement
        eligiblePayouts={eligiblePayouts}
        payouts={payouts}
        escrowHolding={escrowHolding}
        escrowReady={escrowReady}
        escrowReleased={escrowReleased}
      />
    </div>
  )
}

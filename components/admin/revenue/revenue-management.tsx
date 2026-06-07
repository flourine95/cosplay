"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, Download } from "lucide-react"

const stats = [
  {
    label: "Doanh thu tháng này",
    value: "145.8M",
    icon: DollarSign,
    trend: "+12.5%",
  },
  {
    label: "Doanh thu tháng trước",
    value: "129.6M",
    icon: DollarSign,
    trend: "+8.2%",
  },
  { label: "Tăng trưởng", value: "+12.5%", icon: TrendingUp, trend: null },
]

const revenueByType = [
  { type: "Đơn thuê", amount: "65.4M", percent: 45, color: "bg-primary" },
  {
    type: "Đơn đặt may",
    amount: "51.2M",
    percent: 35,
    color: "bg-emerald-500",
  },
  { type: "Đơn bán đứt", amount: "29.2M", percent: 20, color: "bg-sky-500" },
]

const monthlyRevenue = [
  { month: "T1", amount: "98.5M" },
  { month: "T2", amount: "112.3M" },
  { month: "T3", amount: "129.6M" },
  { month: "T4", amount: "145.8M" },
]

export default function RevenueManagement() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Quản lý Doanh thu
          </h1>
          <p className="text-sm text-muted-foreground">
            Theo dõi và phân tích doanh thu hệ thống
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Xuất báo cáo
        </Button>
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
                  <p className="mt-2 text-sm text-emerald-600">{stat.trend}</p>
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
                    {item.percent}%
                  </span>
                  <span className="font-bold text-foreground">
                    {item.amount}
                  </span>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full ${item.color}`}
                  style={{ width: `${item.percent}%` }}
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
                    {item.amount}
                  </span>
                </div>
                {index > 0 && (
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
    </div>
  )
}

import Link from "next/link"
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Package,
  Scissors,
  Store,
  TrendingUp,
  Users,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type StatItem = {
  label: string
  value: string
  change?: string
  isPositive?: boolean
  icon:
    | "revenue"
    | "rental"
    | "tailoring"
    | "completion"
    | "users"
    | "sellers"
    | "products"
    | "fees"
}

type TailoringOrderItem = {
  id: string
  title: string
  client: string
  progress: number
  step: string
  dueDate: string
  isDelayed: boolean
}

type RentalDeadlineItem = {
  id: string
  name: string
  item: string
  time: string
  urgency: "high" | "medium" | "low"
}

type TopSellerItem = {
  name: string
  sales: string
  growth: string
  avatar: string
}

type RevenueTypeItem = {
  type: string
  amount: number
  percent: number
  color: string
}

interface DashboardOverviewProps {
  stats: StatItem[]
  tailoringOrders: TailoringOrderItem[]
  activeTailoringCount: number
  rentalDeadlines: RentalDeadlineItem[]
  topSellers: TopSellerItem[]
  revenueByType: RevenueTypeItem[]
  platformFeeBalance: number
}

const iconMap = {
  revenue: DollarSign,
  rental: Clock,
  tailoring: Scissors,
  completion: CheckCircle2,
  users: Users,
  sellers: Store,
  products: Package,
  fees: DollarSign,
}

const formatCurrency = (value: number): string =>
  `${value.toLocaleString("vi-VN")}đ`

export default function DashboardOverview({
  stats,
  tailoringOrders,
  activeTailoringCount,
  rentalDeadlines,
  topSellers,
  revenueByType,
  platformFeeBalance,
}: DashboardOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Trung tâm điều hành
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tổng quan hoạt động thật của hệ thống cosplay marketplace.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/revenue">Xem doanh thu</Link>
          </Button>
          <Button variant="default" size="sm" asChild>
            <Link href="/admin/orders">Xem đơn hàng</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = iconMap[stat.icon]
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
                {stat.change && (
                  <div className="mt-2 flex items-center gap-1 text-xs">
                    {stat.isPositive && (
                      <TrendingUp className="h-3 w-3 text-emerald-600" />
                    )}
                    <span
                      className={
                        stat.isPositive
                          ? "text-emerald-600"
                          : "text-muted-foreground"
                      }
                    >
                      {stat.change}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card className="border-border/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <Activity className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle>Tiến độ đặt may</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Đang thực hiện: {activeTailoringCount} đơn
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/orders">
                    Xem tất cả
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {tailoringOrders.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border/80 p-6 text-center text-sm text-muted-foreground">
                  Chưa có đơn đặt may đang xử lý.
                </p>
              ) : (
                tailoringOrders.map((order) => (
                  <div key={order.id} className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {order.id}
                          </Badge>
                          <h4 className="text-sm font-semibold text-foreground">
                            {order.title}
                          </h4>
                        </div>
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          Khách hàng: {order.client}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            order.isDelayed ? "destructive" : "secondary"
                          }
                          className="text-xs"
                        >
                          {order.dueDate}
                        </Badge>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {order.step}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-muted-foreground">
                          Tiến độ xưởng
                        </span>
                        <span className="font-semibold text-foreground">
                          {order.progress}%
                        </span>
                      </div>
                      <Progress value={order.progress} className="h-2" />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Phân tích doanh thu</CardTitle>
              <p className="text-sm text-muted-foreground">
                Tỷ trọng doanh thu theo loại giao dịch.
              </p>
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
        </div>

        <div className="space-y-6">
          <Card className="border-border/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <CardTitle>Hạn trả đồ</CardTitle>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/orders">Xem lịch</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {rentalDeadlines.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border/80 p-4 text-center text-sm text-muted-foreground">
                  Không có đơn thuê sắp đến hạn.
                </p>
              ) : (
                rentalDeadlines.map((deadline) => {
                  const urgencyColors = {
                    high: "bg-destructive",
                    medium: "bg-amber-500",
                    low: "bg-emerald-500",
                  }
                  return (
                    <div
                      key={deadline.id}
                      className="flex items-center gap-3 rounded-lg border border-border/60 p-3"
                    >
                      <div
                        className={`h-10 w-1 rounded-full ${urgencyColors[deadline.urgency]}`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="truncate text-sm font-semibold text-foreground">
                            {deadline.name}
                          </h5>
                          <Badge variant="outline" className="text-xs">
                            {deadline.id}
                          </Badge>
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {deadline.item}
                        </p>
                        <div className="mt-1 flex items-center gap-1 text-xs font-medium text-destructive">
                          <Clock className="h-3 w-3" />
                          {deadline.time}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Top seller</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topSellers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Chưa có dữ liệu seller.
                </p>
              ) : (
                topSellers.map((seller) => {
                  const isPositive = seller.growth.startsWith("+")
                  return (
                    <div
                      key={seller.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-muted text-sm font-semibold text-muted-foreground">
                            {seller.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {seller.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {seller.sales}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          isPositive ? "text-emerald-600" : "text-destructive"
                        }`}
                      >
                        {seller.growth}
                      </span>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Số dư phí nền tảng</CardTitle>
              <p className="text-sm text-muted-foreground">
                Ước tính từ doanh thu và phí đang bật
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-foreground">
                {formatCurrency(platformFeeBalance)}
              </div>
              <div className="flex gap-2">
                <Button variant="default" size="sm" className="flex-1" asChild>
                  <Link href="/admin/invoices">Đối soát</Link>
                </Button>
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href="/admin/fees">Cấu hình phí</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

"use client"

import {
  DollarSign,
  Clock,
  Scissors,
  CheckCircle2,
  Activity,
  AlertCircle,
  TrendingUp,
  Users,
  ArrowUpRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

// Mock data
const stats = [
  {
    label: "Doanh thu dự kiến",
    value: "1.450B",
    change: "+18.4%",
    isPositive: true,
    icon: DollarSign,
  },
  {
    label: "Đơn thuê hoạt động",
    value: "482",
    change: "+12.5%",
    isPositive: true,
    icon: Clock,
  },
  {
    label: "May mới trong ngày",
    value: "12",
    change: "-2.1%",
    isPositive: false,
    icon: Scissors,
  },
  {
    label: "Tỷ lệ hoàn thành",
    value: "94.2%",
    change: "+5.7%",
    isPositive: true,
    icon: CheckCircle2,
  },
]

const tailoringOrders = [
  {
    id: "#MK-5521",
    character: "Genshin Impact - Raiden Shogun",
    client: "Ngô Thanh Vân",
    progress: 75,
    step: "Gắn phụ kiện LED",
    dueDate: "Còn 3 ngày",
    isDelayed: false,
  },
  {
    id: "#MK-5548",
    character: "League of Legends - Ahri",
    client: "Phạm Bảo Nhi",
    progress: 40,
    step: "Dựng form váy & đuôi",
    dueDate: "Còn 12 ngày",
    isDelayed: true,
  },
  {
    id: "#MK-5582",
    character: "Fate/Stay Night - Saber",
    client: "Lâm Tuấn Kiệt",
    progress: 95,
    step: "Kiểm tra lần cuối",
    dueDate: "Ngày mai",
    isDelayed: false,
  },
]

const rentalDeadlines = [
  {
    id: "RT-4421",
    name: "Trần Thúy Vy",
    item: "Kimono Demon Slayer",
    time: "2 giờ nữa",
    urgency: "high" as const,
  },
  {
    id: "RT-4425",
    name: "Lê Quốc Bảo",
    item: "Giáp Master Chief",
    time: "Hôm nay, 18:00",
    urgency: "medium" as const,
  },
  {
    id: "RT-4430",
    name: "Nguyễn Hà My",
    item: "Váy Lolita Pinky",
    time: "Ngày mai",
    urgency: "low" as const,
  },
]

const topSellers = [
  { name: "Wibu Shop", sales: "154 đơn", growth: "+12%", avatar: "W" },
  { name: "Cosplay Pro", sales: "122 đơn", growth: "+8%", avatar: "C" },
  { name: "Moe Costume", sales: "98 đơn", growth: "-2%", avatar: "M" },
]

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Trung tâm Điều hành
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tổng quan hoạt động hệ thống
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm">
            Tổng quan
          </Button>
          <Button variant="default" size="sm">
            Tạo thông báo
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left Column: Tailoring Progress */}
        <div className="space-y-6">
          {/* Tailoring Orders */}
          <Card className="border-border/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <Activity className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle>Tiến độ may đo</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Đang thực hiện: 24 đơn
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
              {tailoringOrders.map((order) => (
                <div key={order.id} className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {order.id}
                        </Badge>
                        <h4 className="text-sm font-semibold text-foreground">
                          {order.character}
                        </h4>
                      </div>
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        Khách hàng: {order.client}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={order.isDelayed ? "destructive" : "secondary"}
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
              ))}
            </CardContent>
          </Card>

          {/* Revenue Chart Placeholder */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Phân tích hiệu quả kinh doanh</CardTitle>
              <p className="text-sm text-muted-foreground">
                So sánh giữa dịch vụ Thuê và Đặt may
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-center justify-center rounded-lg border border-border/60 bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  Biểu đồ doanh thu (Chart placeholder)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Deadlines & Top Sellers */}
        <div className="space-y-6">
          {/* Rental Deadlines */}
          <Card className="border-border/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <CardTitle>Hạn trả đồ</CardTitle>
                </div>
                <Button variant="ghost" size="sm" className="text-xs">
                  Xem lịch
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {rentalDeadlines.map((deadline) => {
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
              })}
              <Button variant="outline" size="sm" className="w-full">
                Nhắc nhở tự động tất cả
              </Button>
            </CardContent>
          </Card>

          {/* Top Sellers */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Top Sellers Tuần</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topSellers.map((seller) => {
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
              })}
            </CardContent>
          </Card>

          {/* Platform Revenue */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Số dư phí sàn</CardTitle>
              <p className="text-sm text-muted-foreground">Khả dụng</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-foreground">
                42.850.000 đ
              </div>
              <div className="flex gap-2">
                <Button variant="default" size="sm" className="flex-1">
                  Đối soát
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Rút tiền
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

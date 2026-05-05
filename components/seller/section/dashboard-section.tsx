import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowUpRight,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Clock,
  Package,
  AlertCircle,
  CheckCircle2,
  Scissors,
  MessageSquare,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { sellerKpis, sellerOrders } from "../seller-data"

// Recent activities
const recentActivities = [
  {
    id: 1,
    type: "order",
    title: "Đơn hàng mới #DH-1024",
    description: "Nguyễn Minh Anh đặt thuê Đầm công chúa",
    time: "5 phút trước",
    icon: ShoppingBag,
    color: "text-sky-600",
    bg: "bg-sky-500/10",
  },
  {
    id: 2,
    type: "tailoring",
    title: "Yêu cầu đặt may mới",
    description: "Trần Hữu Khang yêu cầu may Giáp tay Iron Man",
    time: "15 phút trước",
    icon: Scissors,
    color: "text-purple-600",
    bg: "bg-purple-500/10",
  },
  {
    id: 3,
    type: "payment",
    title: "Thanh toán thành công",
    description: "Nhận 850.000đ từ đơn #DH-1029",
    time: "1 giờ trước",
    icon: DollarSign,
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
  },
  {
    id: 4,
    type: "return",
    title: "Đơn thuê đã trả",
    description: "Hoàng Nam trả Set Hầu gái - Hoàn cọc 300k",
    time: "2 giờ trước",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
  },
  {
    id: 5,
    type: "alert",
    title: "Sắp hết hạn thuê",
    description: "3 đơn thuê cần nhận lại trong hôm nay",
    time: "3 giờ trước",
    icon: AlertCircle,
    color: "text-amber-600",
    bg: "bg-amber-500/10",
  },
]

export function DashboardSectionNew() {
  // Get recent orders (last 8)
  const recentOrders = sellerOrders.slice(0, 8)

  return (
    <div className="space-y-6">
      {/* KPI Cards - Clean, no colors */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sellerKpis.map((stat) => {
          const isPositive =
            stat.note.includes("+") || stat.note.includes("tăng")
          const icons = {
            "Đơn mới": ShoppingBag,
            "Đang thuê": Package,
            "Doanh thu tháng": DollarSign,
            "Tỉ lệ báo giá": Clock,
          }
          const Icon = icons[stat.label as keyof typeof icons] || ShoppingBag

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
                  {isPositive && (
                    <TrendingUp className="h-3 w-3 text-emerald-600" />
                  )}
                  <span
                    className={
                      isPositive ? "text-emerald-600" : "text-muted-foreground"
                    }
                  >
                    {stat.note}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Recent Orders */}
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Đơn hàng gần đây</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {recentOrders.length} đơn hàng cần xử lý
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/seller/orders">
                  Xem tất cả
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Đơn hàng</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead className="text-right">Tổng tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => {
                    const statusColors = {
                      "Chờ xác nhận": "bg-amber-500/10 text-amber-700",
                      "Đang giao": "bg-sky-500/10 text-sky-700",
                      "Đang thuê": "bg-purple-500/10 text-purple-700",
                      "Hoàn tất": "bg-emerald-500/10 text-emerald-700",
                    }
                    return (
                      <TableRow key={order.id} className="group">
                        <TableCell>
                          <div>
                            <p className="font-semibold text-foreground">
                              {order.id}
                            </p>
                            <Badge
                              variant="outline"
                              className="mt-1 text-[10px]"
                            >
                              {order.orderType}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                                {order.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                {order.customer}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {order.phone}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-semibold text-primary">
                            {order.total}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              statusColors[
                                order.status as keyof typeof statusColors
                              ] || "bg-muted text-muted-foreground"
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <p className="text-sm text-muted-foreground">
              Cập nhật mới nhất từ cửa hàng
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = activity.icon
                return (
                  <div
                    key={activity.id}
                    className="flex gap-3 rounded-lg border border-border/60 p-3 transition-all hover:border-primary/30 hover:bg-muted/30"
                  >
                    <div className={`rounded-full p-2 ${activity.bg}`}>
                      <Icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm leading-none font-semibold">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Simplified */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Button
          variant="outline"
          className="h-auto flex-col items-start gap-2 p-4 hover:border-primary hover:bg-primary/5"
          asChild
        >
          <Link href="/seller/products">
            <div className="flex w-full items-center justify-between">
              <Package className="h-5 w-5 text-muted-foreground" />
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="w-full text-left">
              <p className="font-semibold text-foreground">Sản phẩm</p>
              <p className="text-xs text-muted-foreground">Quản lý kho</p>
            </div>
          </Link>
        </Button>

        <Button
          variant="outline"
          className="h-auto flex-col items-start gap-2 p-4 hover:border-primary hover:bg-primary/5"
          asChild
        >
          <Link href="/seller/orders">
            <div className="flex w-full items-center justify-between">
              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="w-full text-left">
              <p className="font-semibold text-foreground">Đơn hàng</p>
              <p className="text-xs text-muted-foreground">Mua & Thuê</p>
            </div>
          </Link>
        </Button>

        <Button
          variant="outline"
          className="h-auto flex-col items-start gap-2 p-4 hover:border-primary hover:bg-primary/5"
          asChild
        >
          <Link href="/seller/tailoring">
            <div className="flex w-full items-center justify-between">
              <Scissors className="h-5 w-5 text-muted-foreground" />
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="w-full text-left">
              <p className="font-semibold text-foreground">Đặt may</p>
              <p className="text-xs text-muted-foreground">Yêu cầu may đo</p>
            </div>
          </Link>
        </Button>

        <Button
          variant="outline"
          className="h-auto flex-col items-start gap-2 p-4 hover:border-primary hover:bg-primary/5"
          asChild
        >
          <Link href="/seller/messages">
            <div className="flex w-full items-center justify-between">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                3
              </Badge>
            </div>
            <div className="w-full text-left">
              <p className="font-semibold text-foreground">Tin nhắn</p>
              <p className="text-xs text-muted-foreground">3 chưa đọc</p>
            </div>
          </Link>
        </Button>

        <Button
          variant="outline"
          className="h-auto flex-col items-start gap-2 p-4 hover:border-primary hover:bg-primary/5"
          asChild
        >
          <Link href="/seller/statistics">
            <div className="flex w-full items-center justify-between">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="w-full text-left">
              <p className="font-semibold text-foreground">Thống kê</p>
              <p className="text-xs text-muted-foreground">Báo cáo</p>
            </div>
          </Link>
        </Button>
      </div>
    </div>
  )
}

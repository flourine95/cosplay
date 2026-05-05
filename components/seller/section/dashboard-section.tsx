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
  TrendingDown,
  ShoppingBag,
  DollarSign,
  Users,
  Clock,
  Package,
  AlertCircle,
  CheckCircle2,
  Scissors,
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
      {/* KPI Cards */}
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
          const colors = {
            "Đơn mới": "text-sky-600 bg-sky-500/10",
            "Đang thuê": "text-purple-600 bg-purple-500/10",
            "Doanh thu tháng": "text-primary bg-primary/10",
            "Tỉ lệ báo giá": "text-emerald-600 bg-emerald-500/10",
          }
          const colorClass =
            colors[stat.label as keyof typeof colors] ||
            "text-muted-foreground bg-muted"

          return (
            <Card
              key={stat.label}
              className="border-border/60 transition-all hover:border-primary/30 hover:shadow-sm"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div className={`rounded-full p-2 ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs">
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3 text-emerald-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-muted-foreground" />
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

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="group border-border/60 transition-all hover:border-primary/30 hover:shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="rounded-full bg-primary/10 p-2">
                <Package className="h-5 w-5 text-primary" />
              </div>
            </div>
            <CardTitle className="mt-3 text-base">Quản lý sản phẩm</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Thêm, sửa, xóa sản phẩm và quản lý tồn kho
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
              asChild
            >
              <Link href="/seller/products">Đi đến sản phẩm</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="group border-border/60 transition-all hover:border-primary/30 hover:shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="rounded-full bg-purple-500/10 p-2">
                <Scissors className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <CardTitle className="mt-3 text-base">Quản lý đặt may</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Xử lý yêu cầu đặt may và cập nhật tiến độ
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
              asChild
            >
              <Link href="/seller/tailoring">Đi đến đặt may</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="group border-border/60 transition-all hover:border-primary/30 hover:shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="rounded-full bg-sky-500/10 p-2">
                <Clock className="h-5 w-5 text-sky-600" />
              </div>
            </div>
            <CardTitle className="mt-3 text-base">Lịch trình thuê</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Theo dõi lịch giao hàng và nhận trả
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
              asChild
            >
              <Link href="/seller/calendar">Xem lịch trình</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="group border-border/60 transition-all hover:border-primary/30 hover:shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="rounded-full bg-emerald-500/10 p-2">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <CardTitle className="mt-3 text-base">Tin nhắn</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Trao đổi với khách hàng về đơn hàng
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
              asChild
            >
              <Link href="/seller/messages">Xem tin nhắn</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

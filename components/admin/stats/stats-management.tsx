import {
  BarChart3,
  Package,
  ShoppingCart,
  Star,
  Store,
  TrendingUp,
  Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type OverallStat = {
  label: string
  value: string
  trend: string
  icon: "users" | "orders" | "revenue" | "conversion"
}

type TopProduct = {
  name: string
  orders: number
  revenue: number
}

type TopSeller = {
  name: string
  orders: number
  revenue: number
  rating: number
}

type StatusBreakdown = {
  label: string
  value: number
  percent: number
}

interface StatsManagementProps {
  overallStats: OverallStat[]
  topProducts: TopProduct[]
  topSellers: TopSeller[]
  statusBreakdown: StatusBreakdown[]
}

const iconMap = {
  users: Users,
  orders: ShoppingCart,
  revenue: TrendingUp,
  conversion: BarChart3,
}

const formatCurrency = (value: number): string =>
  `${value.toLocaleString("vi-VN")}đ`

export default function StatsManagement({
  overallStats,
  topProducts,
  topSellers,
  statusBreakdown,
}: StatsManagementProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Thống kê</h1>
        <p className="text-sm text-muted-foreground">
          Tổng quan và phân tích dữ liệu thật của hệ thống.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {overallStats.map((stat) => {
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
                <p className="mt-2 text-sm text-muted-foreground">
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Top sản phẩm bán chạy</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {topProducts.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border/80 p-6 text-center text-sm text-muted-foreground">
                Chưa có dữ liệu sản phẩm.
              </p>
            ) : (
              topProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between border-b border-border pb-4 last:border-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Badge
                      variant="secondary"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full p-0"
                    >
                      {index + 1}
                    </Badge>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">
                        {product.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {product.orders.toLocaleString("vi-VN")} đơn hàng
                      </p>
                    </div>
                  </div>
                  <p className="shrink-0 font-bold text-foreground">
                    {formatCurrency(product.revenue)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Top seller xuất sắc</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {topSellers.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border/80 p-6 text-center text-sm text-muted-foreground">
                Chưa có dữ liệu seller.
              </p>
            ) : (
              topSellers.map((seller, index) => (
                <div
                  key={seller.name}
                  className="flex items-center justify-between border-b border-border pb-4 last:border-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Badge
                      variant="secondary"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full p-0"
                    >
                      {index + 1}
                    </Badge>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">
                        {seller.name}
                      </p>
                      <p className="flex items-center gap-1 text-sm text-muted-foreground">
                        {seller.orders.toLocaleString("vi-VN")} đơn
                        <span>•</span>
                        <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                        {seller.rating.toFixed(1)}
                      </p>
                    </div>
                  </div>
                  <p className="shrink-0 font-bold text-foreground">
                    {formatCurrency(seller.revenue)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Phân bổ trạng thái đơn hàng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {statusBreakdown.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border/80 p-6 text-center text-sm text-muted-foreground">
              Chưa có đơn hàng để thống kê.
            </p>
          ) : (
            statusBreakdown.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">
                    {item.label}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {item.value.toLocaleString("vi-VN")} đơn •{" "}
                    {item.percent.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${Math.min(item.percent, 100)}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

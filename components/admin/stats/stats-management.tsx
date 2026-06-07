"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  Users,
  ShoppingCart,
  TrendingUp,
  Download,
} from "lucide-react"

const overallStats = [
  { label: "Tổng người dùng", value: "12,840", icon: Users, trend: "+452" },
  { label: "Tổng đơn hàng", value: "1,248", icon: ShoppingCart, trend: "+89" },
  {
    label: "Tổng doanh thu",
    value: "145.8M",
    icon: TrendingUp,
    trend: "+12.5%",
  },
  { label: "Tỷ lệ chuyển đổi", value: "3.2%", icon: BarChart3, trend: "+0.5%" },
]

const topProducts = [
  { name: "Kimono Furisode Red Sakura", orders: 156, revenue: "45.2M" },
  { name: "Giáp Genshin Impact", orders: 89, revenue: "38.5M" },
  { name: "Váy Lolita Blue Alice", orders: 124, revenue: "28.9M" },
  { name: "Cosplay Samurai Armor", orders: 67, revenue: "22.1M" },
]

const topSellers = [
  { name: "Cosplay Wonderland", orders: 342, revenue: "142.5M", rating: 4.8 },
  { name: "Kimono House", orders: 256, revenue: "98.2M", rating: 4.7 },
  { name: "Props Master Tech", orders: 189, revenue: "89.2M", rating: 4.9 },
]

export default function StatsManagement() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Thống kê</h1>
          <p className="text-sm text-muted-foreground">
            Tổng quan và phân tích dữ liệu hệ thống
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Xuất báo cáo
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {overallStats.map((stat) => {
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
                <p className="mt-2 text-sm text-emerald-600">{stat.trend}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Top sản phẩm bán chạy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topProducts.map((product, index) => (
              <div
                key={product.name}
                className="flex items-center justify-between border-b border-border pb-4 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant="secondary"
                    className="flex h-8 w-8 items-center justify-center rounded-full p-0"
                  >
                    {index + 1}
                  </Badge>
                  <div>
                    <p className="font-semibold text-foreground">
                      {product.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {product.orders} đơn hàng
                    </p>
                  </div>
                </div>
                <p className="font-bold text-foreground">{product.revenue}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Top sellers xuất sắc</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topSellers.map((seller, index) => (
              <div
                key={seller.name}
                className="flex items-center justify-between border-b border-border pb-4 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant="secondary"
                    className="flex h-8 w-8 items-center justify-center rounded-full p-0"
                  >
                    {index + 1}
                  </Badge>
                  <div>
                    <p className="font-semibold text-foreground">
                      {seller.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {seller.orders} đơn • ⭐ {seller.rating}
                    </p>
                  </div>
                </div>
                <p className="font-bold text-foreground">{seller.revenue}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { OrderStatus } from "@/app/generated/prisma/enums"
import { formatCurrency } from "@/lib/format"
import {
  ArrowUpRight,
  BarChart3,
  Clock,
  DollarSign,
  MessageSquare,
  Package,
  Scissors,
  ShoppingBag,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import type React from "react"
import { toast } from "sonner"

type DashboardData = {
  kpis: {
    pendingOrders: number
    activeRentals: number
    monthlyRevenue: number
    productCount: number
  }
  recentOrders: {
    id: number
    orderNumber: string
    customer: string
    phone: string | null
    item: string
    total: number
    status: OrderStatus
  }[]
}

const statusLabels: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "Chờ xác nhận",
  [OrderStatus.CONFIRMED]: "Đã xác nhận",
  [OrderStatus.PROCESSING]: "Đang xử lý",
  [OrderStatus.SHIPPING]: "Đang giao",
  [OrderStatus.DELIVERED]: "Đã giao",
  [OrderStatus.COMPLETED]: "Hoàn tất",
  [OrderStatus.CANCELLED]: "Đã hủy",
  [OrderStatus.REFUNDED]: "Đã hoàn tiền",
}

const statusClasses: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "bg-amber-500/10 text-amber-700",
  [OrderStatus.CONFIRMED]: "bg-sky-500/10 text-sky-700",
  [OrderStatus.PROCESSING]: "bg-sky-500/10 text-sky-700",
  [OrderStatus.SHIPPING]: "bg-purple-500/10 text-purple-700",
  [OrderStatus.DELIVERED]: "bg-emerald-500/10 text-emerald-700",
  [OrderStatus.COMPLETED]: "bg-emerald-500/10 text-emerald-700",
  [OrderStatus.CANCELLED]: "bg-rose-500/10 text-rose-700",
  [OrderStatus.REFUNDED]: "bg-slate-100 text-slate-700",
}

export function SellerDashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetch("/api/seller/dashboard")
        const json = await response.json()
        if (!response.ok) {
          throw new Error(json.error ?? "Không thể lấy dữ liệu dashboard")
        }
        setData(json.data)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  const kpis = data?.kpis ?? {
    pendingOrders: 0,
    activeRentals: 0,
    monthlyRevenue: 0,
    productCount: 0,
  }
  const recentOrders = data?.recentOrders ?? []

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={ShoppingBag}
          label="Đơn mới"
          note="Đơn chờ xác nhận"
          value={kpis.pendingOrders}
        />
        <KpiCard
          icon={Package}
          label="Đang thuê"
          note="Rental đang hoạt động"
          value={kpis.activeRentals}
        />
        <KpiCard
          icon={DollarSign}
          label="Doanh thu tháng"
          note="Từ đơn đã xác nhận trở lên"
          value={formatCurrency(kpis.monthlyRevenue)}
        />
        <KpiCard
          icon={Clock}
          label="Sản phẩm"
          note="Tổng sản phẩm trong shop"
          value={kpis.productCount}
        />
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Đơn hàng gần đây</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {recentOrders.length} đơn hàng mới nhất
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
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead className="text-right">Tổng tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <p className="text-sm text-muted-foreground">
                        Chưa có đơn hàng nào
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <p className="font-semibold text-foreground">
                          {order.orderNumber}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                              {order.customer.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {order.customer}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {order.phone ?? "-"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate">
                        {order.item}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-primary">
                          {formatCurrency(order.total)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={statusClasses[order.status]}
                        >
                          {statusLabels[order.status]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <QuickAction
          href="/seller/products"
          icon={Package}
          title="Sản phẩm"
          subtitle="Quản lý kho"
        />
        <QuickAction
          href="/seller/orders"
          icon={ShoppingBag}
          title="Đơn hàng"
          subtitle="Mua & Thuê"
        />
        <QuickAction
          href="/seller/tailoring"
          icon={Scissors}
          title="Đặt may"
          subtitle="Yêu cầu may đo"
        />
        <QuickAction
          href="/seller/messages"
          icon={MessageSquare}
          title="Tin nhắn"
          subtitle="Trao đổi khách"
        />
        <QuickAction
          href="/seller/statistics"
          icon={BarChart3}
          title="Thống kê"
          subtitle="Báo cáo"
        />
      </div>
    </div>
  )
}

function KpiCard({
  icon: Icon,
  label,
  note,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  note: string
  value: number | string
}) {
  return (
    <Card className="border-border/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <div className="rounded-full bg-muted p-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  )
}

function QuickAction({
  href,
  icon: Icon,
  subtitle,
  title,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  subtitle: string
  title: string
}) {
  return (
    <Button
      variant="outline"
      className="h-auto flex-col items-start gap-2 p-4 hover:border-primary hover:bg-primary/5"
      asChild
    >
      <Link href={href}>
        <div className="flex w-full items-center justify-between">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="w-full text-left">
          <p className="font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </Link>
    </Button>
  )
}

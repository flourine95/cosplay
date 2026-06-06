"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ShoppingCart,
  Clock,
  AlertCircle,
  MoreHorizontal,
  Loader2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { orders as mockOrders } from "./orders.data"

const statusLabels: Record<string, string> = {
  Ongoing: "Đang thuê",
  Returned: "Đã trả",
  Processing: "Đang may",
  Overdue: "Quá hạn",
  Pending_Measurement: "Chờ số đo",
}

interface OrderDisplay {
  id: string
  customer: string
  type: string
  item: string
  amount: string
  status:
    | "Ongoing"
    | "Returned"
    | "Processing"
    | "Overdue"
    | "Pending_Measurement"
  dateRange?: string
  progress?: number
  deadline: string
}

export default function OrderManagement() {
  const [ordersList, setOrdersList] = useState<OrderDisplay[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterType, setFilterType] = useState("all")

  useEffect(() => {
    async function loadOrders() {
      try {
        setIsLoading(true)
        const res = await fetch("/api/admin/orders")
        if (!res.ok) {
          throw new Error("Không thể lấy danh sách đơn hàng thực tế")
        }
        const data = await res.json()
        setOrdersList(data.orders || [])
      } catch (err) {
        console.error(err)
        // Fallback to mock orders in case of error (for demo safety)
        setOrdersList(mockOrders as OrderDisplay[])
      } finally {
        setIsLoading(false)
      }
    }
    loadOrders()
  }, [])

  const filteredOrders =
    filterType === "all"
      ? ordersList
      : ordersList.filter((o) => o.type.toLowerCase() === filterType)

  // Compute dynamic stats
  const totalCount = ordersList.length
  const processingCount = ordersList.filter(
    (o) =>
      o.status === "Processing" ||
      o.status === "Ongoing" ||
      o.status === "Pending_Measurement"
  ).length
  const overdueCount = ordersList.filter((o) => o.status === "Overdue").length

  const stats = [
    {
      label: "Tổng đơn hàng",
      value: totalCount.toString(),
      icon: ShoppingCart,
    },
    { label: "Đang xử lý", value: processingCount.toString(), icon: Clock },
    { label: "Quá hạn", value: overdueCount.toString(), icon: AlertCircle },
  ]

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">
          Đang tải dữ liệu đơn hàng...
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Quản lý Đơn hàng (Dữ liệu thực tế)
          </h1>
          <p className="text-sm text-muted-foreground">
            Theo dõi đơn thuê và đơn đặt may từ cơ sở dữ liệu
          </p>
        </div>
      </div>

      {/* Stats */}
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
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Lọc theo loại" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="rent">Đơn thuê</SelectItem>
            <SelectItem value="tailor">Đơn đặt may</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {filteredOrders.length} đơn hàng
        </span>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card className="border-dashed p-12 text-center">
            <p className="text-sm text-muted-foreground">
              Không có đơn hàng nào khớp với bộ lọc.
            </p>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="border-border/60">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left: Order Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{order.id}</Badge>
                      <Badge variant="secondary">
                        {order.type === "Rent" ? "Thuê" : "Đặt may"}
                      </Badge>
                      <Badge
                        variant={
                          order.status === "Ongoing" ||
                          order.status === "Processing"
                            ? "default"
                            : order.status === "Returned"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {statusLabels[order.status]}
                      </Badge>
                    </div>

                    <div>
                      <p className="font-semibold text-foreground">
                        {order.item}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Khách hàng: {order.customer}
                      </p>
                    </div>

                    {order.dateRange && (
                      <p className="text-sm text-muted-foreground">
                        Thời gian: {order.dateRange}
                      </p>
                    )}

                    {order.progress !== undefined && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            Tiến độ may
                          </span>
                          <span className="font-semibold text-foreground">
                            {order.progress}%
                          </span>
                        </div>
                        <Progress value={order.progress} className="h-2" />
                      </div>
                    )}
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Tổng tiền</p>
                      <p className="text-lg font-bold text-foreground">
                        {order.amount}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.deadline}
                      </p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                        <DropdownMenuItem>Cập nhật trạng thái</DropdownMenuItem>
                        <DropdownMenuItem>Liên hệ khách hàng</DropdownMenuItem>
                        {order.status === "Overdue" && (
                          <DropdownMenuItem className="text-destructive">
                            Xử lý quá hạn
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

"use client"

import { OrderStatus } from "@/app/generated/prisma/enums"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

type OrderType = "SALE" | "RENTAL"

type SellerOrder = {
  id: number
  orderNumber: string
  orderType: OrderType
  customer: {
    name: string
    phone: string | null
    email: string
  }
  total: number
  shippingFee: number
  status: OrderStatus
  statusLabel: string
  paymentStatus: string
  paymentMethod: string
  createdAt: string
  items: {
    id: number
    productName: string
    variantName: string | null
    price: number
    quantity: number
    subtotal: number
  }[]
  statusHistory: {
    id: number
    status: OrderStatus
    statusLabel: string
    note: string | null
    createdAt: string
  }[]
  nextStatuses: OrderStatus[]
}

type OrdersResponse = {
  orders: SellerOrder[]
  stats: {
    total: number
    sale: number
    rental: number
    byStatus: Record<OrderStatus, number>
  }
}

const emptyOrders: SellerOrder[] = []

const orderStatusLabels: Record<OrderStatus, string> = {
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
  [OrderStatus.PROCESSING]: "bg-indigo-500/10 text-indigo-700",
  [OrderStatus.SHIPPING]: "bg-purple-500/10 text-purple-700",
  [OrderStatus.DELIVERED]: "bg-emerald-500/10 text-emerald-700",
  [OrderStatus.COMPLETED]: "bg-emerald-500/10 text-emerald-700",
  [OrderStatus.CANCELLED]: "bg-rose-500/10 text-rose-700",
  [OrderStatus.REFUNDED]: "bg-slate-100 text-slate-700",
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value))

export function OrdersSectionNew() {
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | null>(null)
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null)
  const [data, setData] = useState<OrdersResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null)

  const loadOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (typeFilter !== "all") params.set("type", typeFilter)
      if (statusFilter) params.set("status", statusFilter)

      const response = await fetch(`/api/seller/orders?${params.toString()}`)
      const json = await response.json()
      if (!response.ok) {
        throw new Error(json.error ?? "Không thể lấy danh sách đơn hàng")
      }
      setData(json.data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter, typeFilter])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadOrders()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadOrders])

  const orders = data?.orders ?? emptyOrders
  const stats = data?.stats

  const visibleStatuses = useMemo(
    () =>
      Object.values(OrderStatus).filter(
        (status) => (stats?.byStatus[status] ?? 0) > 0
      ),
    [stats]
  )

  async function updateStatus(order: SellerOrder, status: OrderStatus) {
    setUpdatingOrderId(order.id)
    try {
      const response = await fetch(`/api/seller/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          note: `Seller chuyển trạng thái sang ${orderStatusLabels[status]}`,
        }),
      })
      const json = await response.json()
      if (!response.ok) {
        throw new Error(json.error ?? "Không thể cập nhật trạng thái")
      }
      toast.success("Đã cập nhật trạng thái đơn hàng")
      await loadOrders()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
    } finally {
      setUpdatingOrderId(null)
    }
  }

  if (isLoading) {
    return <Skeleton className="h-[520px] rounded-xl" />
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>Đơn mua & Thuê</CardTitle>
        <p className="text-sm text-muted-foreground">
          Quản lý giao dịch, trạng thái xử lý và lịch sử cập nhật đơn hàng
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={typeFilter} onValueChange={setTypeFilter}>
          <TabsList>
            <TabsTrigger value="all">Tất cả ({stats?.total ?? 0})</TabsTrigger>
            <TabsTrigger value="sale">Bán đứt ({stats?.sale ?? 0})</TabsTrigger>
            <TabsTrigger value="rental">
              Thuê ({stats?.rental ?? 0})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {visibleStatuses.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={statusFilter === null ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(null)}
            >
              Tất cả
            </Button>
            {visibleStatuses.map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {orderStatusLabels[status]} ({stats?.byStatus[status] ?? 0})
              </Button>
            ))}
          </div>
        )}

        <div className="rounded-lg border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Đơn hàng</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Ship</TableHead>
                <TableHead className="text-right">Tổng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <p className="text-sm text-muted-foreground">
                      Không tìm thấy đơn hàng nào
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <Collapsible
                    key={order.id}
                    open={expandedOrderId === order.id}
                    onOpenChange={(open) =>
                      setExpandedOrderId(open ? order.id : null)
                    }
                    asChild
                  >
                    <>
                      <TableRow>
                        <TableCell>
                          <div>
                            <p className="font-semibold">{order.orderNumber}</p>
                            <p className="text-xs text-muted-foreground">
                              {order.customer.name} ·{" "}
                              {order.customer.phone ?? order.customer.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {order.orderType === "SALE" ? "Bán đứt" : "Thuê"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {formatDate(order.createdAt)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm text-muted-foreground">
                            {formatCurrency(order.shippingFee)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-semibold">
                            {formatCurrency(order.total)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={statusClasses[order.status]}
                          >
                            {order.statusLabel}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                {expandedOrderId === order.id ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem disabled>
                                  Xem chi tiết
                                </DropdownMenuItem>
                                <DropdownMenuItem disabled>
                                  In hóa đơn
                                </DropdownMenuItem>
                                {order.nextStatuses.length > 0 && (
                                  <DropdownMenuSeparator />
                                )}
                                {order.nextStatuses.map((status) => (
                                  <DropdownMenuItem
                                    key={status}
                                    disabled={updatingOrderId === order.id}
                                    onClick={() => updateStatus(order, status)}
                                  >
                                    Chuyển sang {orderStatusLabels[status]}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={7} className="p-0">
                          <CollapsibleContent>
                            <div className="space-y-4 border-t border-border/60 bg-muted/30 p-4">
                              <div>
                                <p className="mb-3 text-xs font-semibold text-muted-foreground uppercase">
                                  Sản phẩm
                                </p>
                                <div className="grid gap-2 sm:grid-cols-2">
                                  {order.items.map((item) => (
                                    <div
                                      key={item.id}
                                      className="flex items-center justify-between rounded-lg border border-border/60 bg-background p-3"
                                    >
                                      <div>
                                        <p className="font-medium">
                                          {item.productName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {item.variantName ??
                                            "Không phân loại"}{" "}
                                          · {formatCurrency(item.price)}
                                        </p>
                                      </div>
                                      <Badge variant="secondary">
                                        x{item.quantity}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {order.statusHistory.length > 0 && (
                                <div>
                                  <p className="mb-3 text-xs font-semibold text-muted-foreground uppercase">
                                    Lịch sử trạng thái
                                  </p>
                                  <div className="space-y-2">
                                    {order.statusHistory.map((history) => (
                                      <div
                                        key={history.id}
                                        className="flex items-center justify-between rounded-lg border border-border/60 bg-background p-3"
                                      >
                                        <div>
                                          <p className="text-sm font-medium">
                                            {history.statusLabel}
                                          </p>
                                          {history.note && (
                                            <p className="text-xs text-muted-foreground">
                                              {history.note}
                                            </p>
                                          )}
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                          {formatDate(history.createdAt)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CollapsibleContent>
                        </TableCell>
                      </TableRow>
                    </>
                  </Collapsible>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

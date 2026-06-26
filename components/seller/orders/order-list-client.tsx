"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
import { toast } from "sonner"

import { OrderStatus } from "@/app/generated/prisma/enums"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { orderStatusLabels, orderTypeLabels } from "./order-constants"
import { OrderDetailDialog } from "./order-detail-dialog"
import { OrderStats } from "./order-stats"
import { OrderTable } from "./order-table"
import type {
  OrderStatusFilter,
  OrderTypeFilter,
  SellerOrderListItem,
  SellerOrdersResponse,
} from "./order-types"

const emptyOrders: SellerOrderListItem[] = []
const emptyStats: SellerOrdersResponse["stats"] = {
  total: 0,
  sale: 0,
  rental: 0,
  byStatus: Object.fromEntries(
    Object.values(OrderStatus).map((status) => [status, 0])
  ) as Record<OrderStatus, number>,
}

const typeFilters: Array<{ label: string; value: OrderTypeFilter }> = [
  { label: "Tất cả", value: "all" },
  { label: orderTypeLabels.SALE, value: "sale" },
  { label: orderTypeLabels.RENTAL, value: "rental" },
]

export function OrderListClient() {
  const [data, setData] = useState<SellerOrdersResponse | null>(null)
  const [detailOrder, setDetailOrder] = useState<SellerOrderListItem | null>(
    null
  )
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>("all")
  const [typeFilter, setTypeFilter] = useState<OrderTypeFilter>("all")
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null)

  const loadOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (typeFilter !== "all") params.set("type", typeFilter)
      if (statusFilter !== "all") params.set("status", statusFilter)

      const queryString = params.toString()
      const response = await fetch(
        `/api/seller/orders${queryString ? `?${queryString}` : ""}`
      )
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
  const stats = data?.stats ?? emptyStats
  const normalizedQuery = query.trim().toLowerCase()

  const visibleStatuses = useMemo(
    () =>
      Object.values(OrderStatus).filter(
        (status) => (stats.byStatus[status] ?? 0) > 0
      ),
    [stats]
  )

  const statusFilters = useMemo<
    Array<{ label: string; value: OrderStatusFilter }>
  >(
    () => [
      { label: "Tất cả", value: "all" },
      ...visibleStatuses.map((status) => ({
        label: `${orderStatusLabels[status]} (${stats.byStatus[status] ?? 0})`,
        value: status,
      })),
    ],
    [stats, visibleStatuses]
  )

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (!normalizedQuery) return true

      return (
        order.orderNumber.toLowerCase().includes(normalizedQuery) ||
        order.customer.name.toLowerCase().includes(normalizedQuery) ||
        order.customer.email.toLowerCase().includes(normalizedQuery) ||
        order.customer.phone?.toLowerCase().includes(normalizedQuery) ||
        order.items.some((item) =>
          item.productName.toLowerCase().includes(normalizedQuery)
        )
      )
    })
  }, [normalizedQuery, orders])

  const hasFilters =
    query.trim().length > 0 || statusFilter !== "all" || typeFilter !== "all"

  function handleClearFilters() {
    setQuery("")
    setStatusFilter("all")
    setTypeFilter("all")
  }

  function handleToggleOrder(orderId: number) {
    setExpandedOrderId((current) => (current === orderId ? null : orderId))
  }

  async function handleUpdateStatus(
    order: SellerOrderListItem,
    status: OrderStatus
  ) {
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
    return <OrderListSkeleton />
  }

  return (
    <div className="flex flex-col gap-6">
      <OrderStats orders={orders} stats={stats} />

      <Card className="border-border/80 bg-card">
        <CardHeader>
          <CardTitle>Đơn mua & Thuê</CardTitle>
          <CardDescription>
            Quản lý giao dịch, trạng thái xử lý và lịch sử cập nhật đơn hàng.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <OrderToolbar
            query={query}
            statusFilter={statusFilter}
            statusFilters={statusFilters}
            typeFilter={typeFilter}
            onClearFilters={handleClearFilters}
            onQueryChange={setQuery}
            onStatusFilterChange={setStatusFilter}
            onTypeFilterChange={setTypeFilter}
          />
          <OrderTable
            expandedOrderId={expandedOrderId}
            hasFilters={hasFilters}
            orders={filteredOrders}
            updatingOrderId={updatingOrderId}
            onClearFilters={handleClearFilters}
            onDetailOrder={setDetailOrder}
            onToggleOrder={handleToggleOrder}
            onUpdateStatus={handleUpdateStatus}
          />
        </CardContent>
      </Card>

      <OrderDetailDialog
        order={detailOrder}
        onOpenChange={(open) => {
          if (!open) setDetailOrder(null)
        }}
      />
    </div>
  )
}

function OrderToolbar({
  onClearFilters,
  onQueryChange,
  onStatusFilterChange,
  onTypeFilterChange,
  query,
  statusFilter,
  statusFilters,
  typeFilter,
}: {
  query: string
  statusFilter: OrderStatusFilter
  statusFilters: Array<{ label: string; value: OrderStatusFilter }>
  typeFilter: OrderTypeFilter
  onClearFilters: () => void
  onQueryChange: (value: string) => void
  onStatusFilterChange: (value: OrderStatusFilter) => void
  onTypeFilterChange: (value: OrderTypeFilter) => void
}) {
  const hasFilters =
    query.trim().length > 0 || statusFilter !== "all" || typeFilter !== "all"

  return (
    <div className="rounded-xl border border-border/70 bg-muted/25 p-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="relative w-full xl:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Tìm mã đơn, khách hoặc sản phẩm"
            className="bg-background pl-8"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <FilterGroup
            ariaLabel="Lọc theo loại đơn"
            value={typeFilter}
            options={typeFilters}
            onValueChange={(value) => {
              if (value) onTypeFilterChange(value as OrderTypeFilter)
            }}
          />
          <FilterGroup
            ariaLabel="Lọc theo trạng thái đơn"
            value={statusFilter}
            options={statusFilters}
            onValueChange={(value) => {
              if (value) onStatusFilterChange(value as OrderStatusFilter)
            }}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={onClearFilters}
          disabled={!hasFilters}
          className="self-start lg:self-auto"
        >
          Xóa lọc
        </Button>
      </div>
    </div>
  )
}

function FilterGroup<T extends string>({
  ariaLabel,
  onValueChange,
  options,
  value,
}: {
  ariaLabel: string
  value: T
  options: Array<{ label: string; value: T }>
  onValueChange: (value: string) => void
}) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={onValueChange}
      variant="outline"
      size="sm"
      className="max-w-full flex-wrap bg-background"
      aria-label={ariaLabel}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          className={cn(
            option.value === value && "bg-primary text-primary-foreground"
          )}
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

function OrderListSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  )
}

"use client"

import { Fragment } from "react"
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  PackageX,
  ReceiptText,
  SearchX,
} from "lucide-react"
import { OrderStatus } from "@/app/generated/prisma/enums"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "@/lib/format"
import { orderStatusLabels, orderTypeLabels } from "./order-constants"
import type { SellerOrderListItem } from "./order-types"

type OrderTableProps = {
  expandedOrderId: number | null
  hasFilters: boolean
  orders: SellerOrderListItem[]
  updatingOrderId: number | null
  onClearFilters: () => void
  onDetailOrder: (order: SellerOrderListItem) => void
  onToggleOrder: (orderId: number) => void
  onUpdateStatus: (order: SellerOrderListItem, status: OrderStatus) => void
}

export function OrderTable({
  expandedOrderId,
  hasFilters,
  onClearFilters,
  onDetailOrder,
  onToggleOrder,
  onUpdateStatus,
  orders,
  updatingOrderId,
}: OrderTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border/80 bg-background">
      <Table>
        <TableHeader className="bg-muted/55">
          <TableRow>
            <TableHead>Đơn hàng</TableHead>
            <TableHead>Loại</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead className="text-right">Ship</TableHead>
            <TableHead className="text-right">Tổng</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="w-[112px] text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7}>
                <OrderEmptyState
                  hasFilters={hasFilters}
                  onClearFilters={onClearFilters}
                />
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <Fragment key={order.id}>
                <TableRow>
                  <TableCell className="min-w-[260px]">
                    <OrderIdentity order={order} />
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {orderTypeLabels[order.orderType]}
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
                    <OrderStatusBadge
                      status={order.status}
                      label={order.statusLabel}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={
                          expandedOrderId === order.id
                            ? "Thu gọn đơn hàng"
                            : "Mở rộng đơn hàng"
                        }
                        onClick={() => onToggleOrder(order.id)}
                      >
                        {expandedOrderId === order.id ? (
                          <ChevronUp />
                        ) : (
                          <ChevronDown />
                        )}
                      </Button>
                      <OrderRowMenu
                        order={order}
                        updatingOrderId={updatingOrderId}
                        onDetailOrder={onDetailOrder}
                        onUpdateStatus={onUpdateStatus}
                      />
                    </div>
                  </TableCell>
                </TableRow>
                {expandedOrderId === order.id && (
                  <OrderExpandedRow order={order} />
                )}
              </Fragment>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function OrderIdentity({ order }: { order: SellerOrderListItem }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
        <ReceiptText className="size-5 text-foreground/65" />
      </div>
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">
          {order.orderNumber}
        </p>
        <p className="truncate text-xs text-foreground/60">
          {order.customer.name} · {order.customer.phone ?? order.customer.email}
        </p>
      </div>
    </div>
  )
}

function OrderRowMenu({
  onDetailOrder,
  onUpdateStatus,
  order,
  updatingOrderId,
}: {
  order: SellerOrderListItem
  updatingOrderId: number | null
  onDetailOrder: (order: SellerOrderListItem) => void
  onUpdateStatus: (order: SellerOrderListItem, status: OrderStatus) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Mở menu đơn hàng">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => onDetailOrder(order)}>
            Xem chi tiết
          </DropdownMenuItem>
          <DropdownMenuItem disabled>In hóa đơn</DropdownMenuItem>
        </DropdownMenuGroup>
        {order.nextStatuses.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {order.nextStatuses.map((status) => (
                <DropdownMenuItem
                  key={status}
                  disabled={updatingOrderId === order.id}
                  onClick={() => onUpdateStatus(order, status)}
                >
                  Chuyển sang {orderStatusLabels[status]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function OrderExpandedRow({ order }: { order: SellerOrderListItem }) {
  return (
    <TableRow>
      <TableCell colSpan={7} className="p-0">
        <div className="flex flex-col gap-4 border-t border-border/60 bg-muted/30 p-4">
          <div>
            <p className="mb-3 text-xs font-semibold text-muted-foreground uppercase">
              Sản phẩm
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.productName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.variantName ?? "Không phân loại"} ·{" "}
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                  <Badge variant="secondary">x{item.quantity}</Badge>
                </div>
              ))}
            </div>
          </div>

          {order.statusHistory.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-semibold text-muted-foreground uppercase">
                Lịch sử trạng thái
              </p>
              <div className="flex flex-col gap-2">
                {order.statusHistory.map((history) => (
                  <div
                    key={history.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {history.statusLabel}
                      </p>
                      {history.note && (
                        <p className="truncate text-xs text-muted-foreground">
                          {history.note}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDate(history.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}

function OrderEmptyState({
  hasFilters,
  onClearFilters,
}: {
  hasFilters: boolean
  onClearFilters: () => void
}) {
  return (
    <Empty className="min-h-64 border-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {hasFilters ? <SearchX /> : <PackageX />}
        </EmptyMedia>
        <EmptyTitle>
          {hasFilters ? "Không có đơn khớp bộ lọc" : "Chưa có đơn hàng"}
        </EmptyTitle>
        <EmptyDescription>
          {hasFilters
            ? "Xóa bộ lọc để xem lại toàn bộ đơn mua và thuê của shop."
            : "Khi khách đặt mua hoặc thuê trang phục, đơn sẽ xuất hiện tại đây."}
        </EmptyDescription>
      </EmptyHeader>
      {hasFilters && (
        <EmptyContent>
          <Button type="button" variant="outline" onClick={onClearFilters}>
            Xóa bộ lọc
          </Button>
        </EmptyContent>
      )}
    </Empty>
  )
}

function OrderStatusBadge({
  label,
  status,
}: {
  status: OrderStatus
  label: string
}) {
  if (status === OrderStatus.CANCELLED || status === OrderStatus.REFUNDED) {
    return <Badge variant="destructive">{label}</Badge>
  }

  if (status === OrderStatus.COMPLETED || status === OrderStatus.DELIVERED) {
    return <Badge variant="secondary">{label}</Badge>
  }

  return <Badge variant="outline">{label}</Badge>
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value))
}

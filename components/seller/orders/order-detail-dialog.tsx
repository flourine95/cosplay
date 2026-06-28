"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/format"
import type { SellerOrderListItem } from "./order-types"

type OrderDetailDialogProps = {
  order: SellerOrderListItem | null
  onOpenChange: (open: boolean) => void
}

export function OrderDetailDialog({
  onOpenChange,
  order,
}: OrderDetailDialogProps) {
  return (
    <Dialog open={!!order} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{order?.orderNumber}</DialogTitle>
          <DialogDescription>
            Chi tiết khách hàng, sản phẩm và lịch sử xử lý đơn.
          </DialogDescription>
        </DialogHeader>
        {order && (
          <div className="flex flex-col gap-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <Info label="Khách hàng" value={order.customer.name} />
              <Info
                label="Liên hệ"
                value={order.customer.phone ?? order.customer.email}
              />
              <Info label="Tổng tiền" value={formatCurrency(order.total)} />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold">Sản phẩm</p>
              <div className="flex flex-col gap-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/60 p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.productName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.variantName ?? "Không phân loại"} · x
                        {item.quantity}
                      </p>
                    </div>
                    <p className="shrink-0 font-semibold">
                      {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold">Lịch sử</p>
              <div className="flex flex-col gap-2">
                {order.statusHistory.map((history) => (
                  <div
                    key={history.id}
                    className="rounded-lg border border-border/60 p-3"
                  >
                    <p className="text-sm font-medium">{history.statusLabel}</p>
                    <p className="text-xs text-muted-foreground">
                      {history.note ?? "Không có ghi chú"} ·{" "}
                      {formatDate(history.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value))
}

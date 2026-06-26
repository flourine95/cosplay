"use client"

import { PackageX, Send } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
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
import type { SellerQuoteOrder } from "./quote-types"

type QuoteTableProps = {
  orders: SellerQuoteOrder[]
  submittingId: number | null
  onOpenQuote: (order: SellerQuoteOrder) => void
}

export function QuoteTable({
  onOpenQuote,
  orders,
  submittingId,
}: QuoteTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border/80 bg-background">
      <Table>
        <TableHeader className="bg-muted/55">
          <TableRow>
            <TableHead>Yêu cầu</TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Báo giá gần nhất</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="w-[120px] text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>
                <Empty className="min-h-64 border-0">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <PackageX />
                    </EmptyMedia>
                    <EmptyTitle>Không có yêu cầu chờ báo giá</EmptyTitle>
                    <EmptyDescription>
                      Khi khách gửi yêu cầu đặt may mới, yêu cầu cần báo giá sẽ
                      xuất hiện tại đây.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => {
              const [latestQuote] = order.quotes
              return (
                <TableRow key={order.id}>
                  <TableCell className="min-w-[260px]">
                    <p className="font-medium text-foreground">{order.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.orderNumber}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">{order.customer.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.customer.phone ?? order.customer.email}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {formatDate(order.deadline)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {latestQuote ? (
                      <div>
                        <p className="text-sm font-medium">
                          {formatCurrency(latestQuote.quotedPrice)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Cọc {formatCurrency(latestQuote.depositAmount)} ·{" "}
                          {latestQuote.estimatedDays} ngày
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Chưa có
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{order.statusLabel}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      disabled={submittingId === order.id}
                      onClick={() => onOpenQuote(order)}
                    >
                      <Send data-icon="inline-start" />
                      Báo giá
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function formatDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "short" }).format(
        new Date(value)
      )
    : "-"
}

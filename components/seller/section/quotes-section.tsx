"use client"

import { CustomOrderStatus } from "@/app/generated/prisma/enums"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Send } from "lucide-react"
import type React from "react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

type QuoteOrder = {
  id: number
  orderNumber: string
  title: string
  status: CustomOrderStatus
  statusLabel: string
  customer: {
    name: string
    phone: string | null
  }
  deadline: string | null
  createdAt: string
}

const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "short" }).format(
        new Date(value)
      )
    : "-"

export function QuotesSectionNew() {
  const [orders, setOrders] = useState<QuoteOrder[]>([])
  const [quoteOrder, setQuoteOrder] = useState<QuoteOrder | null>(null)
  const [quoteForm, setQuoteForm] = useState({
    quotedPrice: "1200000",
    depositAmount: "500000",
    estimatedDays: "14",
    description: "Báo giá từ seller",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [submittingId, setSubmittingId] = useState<number | null>(null)

  const loadOrders = useCallback(async () => {
    try {
      const response = await fetch("/api/seller/custom-orders?needsQuote=true")
      const json = await response.json()
      if (!response.ok) {
        throw new Error(json.error ?? "Không thể lấy danh sách chờ báo giá")
      }
      setOrders(json.data.orders)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadOrders()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadOrders])

  async function sendQuote() {
    if (!quoteOrder) return
    setSubmittingId(quoteOrder.id)
    try {
      const response = await fetch(
        `/api/seller/custom-orders/${quoteOrder.id}/quotes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quotedPrice: quoteForm.quotedPrice,
            depositAmount: quoteForm.depositAmount,
            estimatedDays: quoteForm.estimatedDays,
            description: quoteForm.description || undefined,
          }),
        }
      )
      const json = await response.json()
      if (!response.ok) throw new Error(json.error ?? "Không thể gửi báo giá")
      toast.success("Đã gửi báo giá")
      setQuoteOrder(null)
      await loadOrders()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
    } finally {
      setSubmittingId(null)
    }
  }

  if (isLoading) return <Skeleton className="h-[420px] rounded-xl" />

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>Đơn chờ báo giá</CardTitle>
        <p className="text-sm text-muted-foreground">
          Tạo báo giá cho các yêu cầu đặt may mới
        </p>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Yêu cầu</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-[120px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <p className="text-sm text-muted-foreground">
                      Không có yêu cầu nào đang chờ báo giá
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <p className="font-semibold">{order.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.orderNumber}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">
                        {order.customer.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.customer.phone ?? "-"}
                      </p>
                    </TableCell>
                    <TableCell>{formatDate(order.deadline)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{order.statusLabel}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        disabled={submittingId === order.id}
                        onClick={() => {
                          setQuoteOrder(order)
                          setQuoteForm({
                            quotedPrice: "1200000",
                            depositAmount: "500000",
                            estimatedDays: "14",
                            description: "Báo giá từ seller",
                          })
                        }}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Báo giá
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <Dialog
        open={!!quoteOrder}
        onOpenChange={(open) => !open && setQuoteOrder(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Gửi báo giá</DialogTitle>
            <DialogDescription>
              Nhập báo giá chi tiết cho yêu cầu đặt may đang chọn.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Giá báo">
              <Input
                type="number"
                value={quoteForm.quotedPrice}
                onChange={(event) =>
                  setQuoteForm((current) => ({
                    ...current,
                    quotedPrice: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Tiền cọc">
              <Input
                type="number"
                value={quoteForm.depositAmount}
                onChange={(event) =>
                  setQuoteForm((current) => ({
                    ...current,
                    depositAmount: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Số ngày dự kiến">
              <Input
                type="number"
                value={quoteForm.estimatedDays}
                onChange={(event) =>
                  setQuoteForm((current) => ({
                    ...current,
                    estimatedDays: event.target.value,
                  }))
                }
              />
            </Field>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Ghi chú</Label>
              <Input
                value={quoteForm.description}
                onChange={(event) =>
                  setQuoteForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuoteOrder(null)}>
              Hủy
            </Button>
            <Button
              disabled={submittingId === quoteOrder?.id}
              onClick={sendQuote}
            >
              Gửi báo giá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function Field({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

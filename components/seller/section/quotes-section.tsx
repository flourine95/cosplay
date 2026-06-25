"use client"

import { CustomOrderStatus } from "@/app/generated/prisma/enums"
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
import { Send } from "lucide-react"
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

  async function sendQuote(order: QuoteOrder) {
    const quotedPrice = Number(window.prompt("Giá báo (VNĐ):", "1200000"))
    if (!quotedPrice) return
    const depositAmount = Number(window.prompt("Tiền cọc (VNĐ):", "500000"))
    if (Number.isNaN(depositAmount)) return
    const estimatedDays = Number(window.prompt("Số ngày dự kiến:", "14"))
    if (!estimatedDays) return
    const description = window.prompt("Ghi chú báo giá:", "Báo giá từ seller")

    setSubmittingId(order.id)
    try {
      const response = await fetch(
        `/api/seller/custom-orders/${order.id}/quotes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quotedPrice,
            depositAmount,
            estimatedDays,
            description: description ?? undefined,
          }),
        }
      )
      const json = await response.json()
      if (!response.ok) throw new Error(json.error ?? "Không thể gửi báo giá")
      toast.success("Đã gửi báo giá")
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
                        onClick={() => sendQuote(order)}
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
    </Card>
  )
}

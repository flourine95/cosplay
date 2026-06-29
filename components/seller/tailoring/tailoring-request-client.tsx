"use client"

import { useCallback, useEffect, useMemo, useState, useTransition } from "react"
import Link from "next/link"
import Image from "next/image"
import { Check, Clock, Eye, Ruler, Scissors, X } from "lucide-react"
import { toast } from "sonner"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { formatCurrency } from "@/lib/format"

type TailoringRequest = {
  id: number
  orderNumber: string
  title: string
  description: string
  characterName: string | null
  animeName: string | null
  specialRequests: string | null
  deadline: string | null
  statusLabel: string
  estimatedPrice: number | null
  submittedAt: string | null
  acceptedAt: string | null
  referenceImages: string[]
  customer: {
    name: string
    phone: string | null
    email: string
  }
  measurement: Record<string, string | number | null> | null
}

type ResponseData = {
  orders: TailoringRequest[]
  stats: {
    total: number
    needsQuote: number
    inProgress: number
    ready: number
  }
}

const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(value))
    : "Chưa có"

export function TailoringRequestClient() {
  const [data, setData] = useState<ResponseData | null>(null)
  const [selected, setSelected] = useState<TailoringRequest | null>(null)
  const [rejectOrder, setRejectOrder] = useState<TailoringRequest | null>(null)
  const [rejectNote, setRejectNote] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  const loadRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/seller/custom-orders?needsQuote=true")
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Không thể tải yêu cầu")
      setData(json.data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadRequests()
    }, 0)
    return () => window.clearTimeout(timeoutId)
  }, [loadRequests])

  const pendingRequests = useMemo(
    () => (data?.orders ?? []).filter((order) => !order.acceptedAt),
    [data]
  )

  const decide = (order: TailoringRequest, action: "accept" | "reject") => {
    startTransition(async () => {
      const res = await fetch(
        `/api/seller/custom-orders/${order.id}/decision`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            note: action === "reject" ? rejectNote : undefined,
          }),
        }
      )
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(json.error ?? "Không thể xử lý yêu cầu")
        return
      }

      toast.success(
        action === "accept" ? "Đã nhận yêu cầu đặt may" : "Đã từ chối yêu cầu"
      )
      setRejectOrder(null)
      setRejectNote("")
      await loadRequests()
    })
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-56 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Chờ nhận
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingRequests.length}</div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đã báo giá/chờ xử lý
            </CardTitle>
            <Scissors className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.max(
                (data?.stats.needsQuote ?? 0) - pendingRequests.length,
                0
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đang gia công
            </CardTitle>
            <Ruler className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {data?.stats.inProgress ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {pendingRequests.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="flex min-h-64 flex-col items-center justify-center text-center">
            <Scissors className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="font-semibold">Chưa có yêu cầu đặt may mới</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Khi khách gửi yêu cầu, seller sẽ nhận và báo giá tại đây.
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/seller/tailoring">Xem quản lý đặt may</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {pendingRequests.map((order) => (
            <Card key={order.id} className="border-border/60">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">
                      {order.orderNumber}
                    </p>
                    <CardTitle className="mt-1 text-lg">
                      {order.title}
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {order.customer.name} ·{" "}
                      {order.customer.phone ?? order.customer.email}
                    </p>
                  </div>
                  <Badge variant="secondary">Chờ nhận</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {order.description}
                </p>
                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  <Info label="Deadline" value={formatDate(order.deadline)} />
                  <Info
                    label="Ngân sách"
                    value={
                      order.estimatedPrice
                        ? formatCurrency(order.estimatedPrice)
                        : "Chưa có"
                    }
                  />
                  <Info label="Gửi lúc" value={formatDate(order.submittedAt)} />
                  <Info
                    label="Ảnh tham khảo"
                    value={`${order.referenceImages.length} ảnh`}
                  />
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelected(order)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Chi tiết
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isPending}
                    onClick={() => setRejectOrder(order)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Từ chối
                  </Button>
                  <Button
                    size="sm"
                    disabled={isPending}
                    onClick={() => decide(order, "accept")}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Nhận đơn
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
            <DialogDescription>
              Chi tiết yêu cầu đặt may trước khi seller nhận đơn.
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border/60 p-4">
                <p className="text-sm font-semibold">Mô tả yêu cầu</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selected.description}
                </p>
                {selected.specialRequests && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {selected.specialRequests}
                  </p>
                )}
              </div>
              {selected.measurement && (
                <div className="grid gap-2 sm:grid-cols-3">
                  {Object.entries(selected.measurement)
                    .filter(([, value]) => value != null && value !== "")
                    .map(([key, value]) => (
                      <Info key={key} label={key} value={String(value)} />
                    ))}
                </div>
              )}
              {selected.referenceImages.length > 0 && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {selected.referenceImages.map((image) => (
                    <a
                      key={image}
                      href={image}
                      target="_blank"
                      rel="noreferrer"
                      className="group overflow-hidden rounded-lg border border-border/60 bg-muted"
                    >
                      <div className="relative aspect-video">
                        <Image
                          src={image}
                          alt={`Ảnh tham khảo ${selected.orderNumber}`}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selected && (
              <Button
                disabled={isPending}
                onClick={() => decide(selected, "accept")}
              >
                Nhận đơn
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!rejectOrder}
        onOpenChange={(open) => !open && setRejectOrder(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối yêu cầu đặt may</DialogTitle>
            <DialogDescription>
              Ghi lý do ngắn gọn để khách biết vì sao shop không nhận đơn.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectNote}
            onChange={(event) => setRejectNote(event.target.value)}
            placeholder="Ví dụ: Shop đang quá tải, không kịp deadline..."
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOrder(null)}>
              Hủy
            </Button>
            {rejectOrder && (
              <Button
                variant="destructive"
                disabled={isPending}
                onClick={() => decide(rejectOrder, "reject")}
              >
                Từ chối
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  )
}

"use client"

import { CustomOrderStatus } from "@/app/generated/prisma/enums"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  MessageSquare,
  Ruler,
  Send,
} from "lucide-react"
import Image from "next/image"
import type React from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

type CustomOrder = {
  id: number
  orderNumber: string
  title: string
  description: string
  referenceImages: string[]
  characterName: string | null
  animeName: string | null
  specialRequests: string | null
  deadline: string | null
  status: CustomOrderStatus
  statusLabel: string
  estimatedPrice: number | null
  depositAmount: number | null
  finalAmount: number | null
  totalPaid: number
  shippingFee: number
  trackingCode: string | null
  shippingCarrier: string | null
  remainingAmount: number
  progressPercent: number
  customer: {
    name: string
    phone: string | null
    email: string
  }
  measurement: Record<string, string | number | null> | null
  quotes: {
    id: number
    quotedPrice: number
    depositAmount: number
    estimatedDays: number
    description: string | null
    isAccepted: boolean
    createdAt: string
  }[]
  progressUpdates: {
    id: number
    title: string
    description: string
    images: string[]
    videos: string[]
    progressPercent: number
    createdAt: string
  }[]
  revisions: {
    id: number
    description: string
    sellerResponse: string | null
    createdAt: string
  }[]
}

type CustomOrdersResponse = {
  orders: CustomOrder[]
  stats: {
    total: number
    needsQuote: number
    inProgress: number
    ready: number
  }
}

const emptyOrders: CustomOrder[] = []

const statusClasses: Record<CustomOrderStatus, string> = {
  [CustomOrderStatus.DRAFT]: "bg-slate-100 text-slate-700 border-slate-200",
  [CustomOrderStatus.SUBMITTED]:
    "bg-amber-500/10 text-amber-700 border-amber-200",
  [CustomOrderStatus.QUOTED]: "bg-sky-500/10 text-sky-700 border-sky-200",
  [CustomOrderStatus.QUOTE_ACCEPTED]:
    "bg-sky-500/10 text-sky-700 border-sky-200",
  [CustomOrderStatus.DEPOSIT_PAID]:
    "bg-indigo-500/10 text-indigo-700 border-indigo-200",
  [CustomOrderStatus.IN_PROGRESS]:
    "bg-purple-500/10 text-purple-700 border-purple-200",
  [CustomOrderStatus.REVISION_REQUESTED]:
    "bg-orange-500/10 text-orange-700 border-orange-200",
  [CustomOrderStatus.READY]:
    "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  [CustomOrderStatus.COMPLETED]:
    "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  [CustomOrderStatus.CANCELLED]: "bg-rose-500/10 text-rose-700 border-rose-200",
}

const measurementLabels: Record<string, string> = {
  height: "Chiều cao",
  weight: "Cân nặng",
  chest: "Vòng ngực",
  waist: "Vòng eo",
  hips: "Vòng hông",
  shoulder: "Rộng vai",
  armLength: "Dài tay",
  legLength: "Dài chân",
  neck: "Vòng cổ",
  notes: "Ghi chú",
}

const tailoringStages = [
  { title: "Nhận cọc / chốt yêu cầu", progressPercent: 10 },
  { title: "Chuẩn bị vật liệu", progressPercent: 25 },
  { title: "Cắt rập / lên form", progressPercent: 45 },
  { title: "May chi tiết", progressPercent: 65 },
  { title: "Hoàn thiện phụ kiện", progressPercent: 85 },
  { title: "Sẵn sàng giao", progressPercent: 100 },
]

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

export function TailoringListClient() {
  const [data, setData] = useState<CustomOrdersResponse | null>(null)
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [replyText, setReplyText] = useState("")
  const [quoteOrder, setQuoteOrder] = useState<CustomOrder | null>(null)
  const [progressOrder, setProgressOrder] = useState<CustomOrder | null>(null)
  const [shippingOrder, setShippingOrder] = useState<CustomOrder | null>(null)
  const [detailOrder, setDetailOrder] = useState<CustomOrder | null>(null)
  const [quoteForm, setQuoteForm] = useState({
    quotedPrice: "1200000",
    depositAmount: "500000",
    estimatedDays: "14",
    description: "Báo giá từ seller",
  })
  const [progressForm, setProgressForm] = useState({
    title: "Cập nhật tiến độ",
    description: "Shop đã cập nhật tiến độ mới cho đơn đặt may.",
    progressPercent: "35",
  })
  const [shippingForm, setShippingForm] = useState({
    shippingCarrier: "GHTK",
    trackingCode: "",
    shippingFee: "35000",
  })
  const [progressFiles, setProgressFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadOrders = useCallback(async () => {
    try {
      const response = await fetch("/api/seller/custom-orders")
      const json = await response.json()
      if (!response.ok) {
        throw new Error(json.error ?? "Không thể lấy đơn đặt may")
      }
      setData(json.data)
      setSelectedOrderId(
        (current) => current ?? json.data.orders[0]?.id ?? null
      )
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

  const orders = data?.orders ?? emptyOrders
  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? null,
    [orders, selectedOrderId]
  )

  async function sendQuote() {
    if (!quoteOrder) return
    setIsSubmitting(true)
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
      setIsSubmitting(false)
    }
  }

  async function updateProgress() {
    if (!progressOrder) return
    setIsSubmitting(true)
    try {
      let imageUrls: string[] = []
      if (progressFiles.length > 0) {
        const formData = new FormData()
        progressFiles.forEach((file) => formData.append("files", file))

        const uploadResponse = await fetch(
          "/api/seller/custom-order-progress-images",
          {
            method: "POST",
            body: formData,
          }
        )
        const uploadJson = await uploadResponse.json()
        if (!uploadResponse.ok) {
          throw new Error(uploadJson.error ?? "KhÃ´ng thá»ƒ táº£i áº£nh lÃªn")
        }
        imageUrls = uploadJson.data.urls ?? []
      }

      const response = await fetch(
        `/api/seller/custom-orders/${progressOrder.id}/progress`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: progressForm.title,
            description: progressForm.description,
            progressPercent: progressForm.progressPercent,
            images: imageUrls,
            videos: [],
          }),
        }
      )
      const json = await response.json()
      if (!response.ok) throw new Error(json.error ?? "Không thể cập nhật")
      toast.success("Đã cập nhật tiến độ")
      setProgressOrder(null)
      setProgressFiles([])
      await loadOrders()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function updateShipping() {
    if (!shippingOrder) return
    setIsSubmitting(true)
    try {
      const response = await fetch(
        `/api/seller/custom-orders/${shippingOrder.id}/shipping`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(shippingForm),
        }
      )
      const json = await response.json()
      if (!response.ok)
        throw new Error(json.error ?? "Khong the cap nhat giao hang")
      toast.success("Da gui thong tin giao hang")
      setShippingOrder(null)
      await loadOrders()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Co loi xay ra")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function respondRevision(order: CustomOrder) {
    const revision = order.revisions.find((item) => !item.sellerResponse)
    if (!revision || !replyText.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(
        `/api/seller/custom-orders/${order.id}/revisions/${revision.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sellerResponse: replyText.trim() }),
        }
      )
      const json = await response.json()
      if (!response.ok) throw new Error(json.error ?? "Không thể phản hồi")
      toast.success("Đã phản hồi yêu cầu chỉnh sửa")
      setReplyText("")
      await loadOrders()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Skeleton className="h-[620px] rounded-xl" />
        <Skeleton className="h-[620px] rounded-xl" />
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Danh sách yêu cầu</CardTitle>
          <p className="text-sm text-muted-foreground">
            {data?.stats.total ?? 0} đơn đặt may · {data?.stats.needsQuote ?? 0}{" "}
            chờ báo giá
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {orders.map((order) => {
            const isSelected = selectedOrder?.id === order.id
            return (
              <button
                key={order.id}
                onClick={() => setSelectedOrderId(order.id)}
                className={`w-full cursor-pointer rounded-lg border p-4 text-left transition-all hover:border-primary/50 hover:bg-muted/50 ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border/60"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                        {order.customer.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {order.orderNumber}
                      </p>
                      <p className="font-semibold text-foreground">
                        {order.customer.name}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={statusClasses[order.status]}
                  >
                    {order.statusLabel}
                  </Badge>
                </div>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {order.title}
                </p>
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Tiến độ</span>
                    <span className="font-medium text-primary">
                      {order.progressPercent}%
                    </span>
                  </div>
                  <Progress value={order.progressPercent} className="h-1.5" />
                </div>
              </button>
            )
          })}
        </CardContent>
      </Card>

      {selectedOrder ? (
        <div className="space-y-6">
          <Card className="border-border/60">
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle>{selectedOrder.title}</CardTitle>
                    <Badge
                      variant="outline"
                      className={statusClasses[selectedOrder.status]}
                    >
                      {selectedOrder.statusLabel}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Đơn {selectedOrder.orderNumber} · Khách hàng:{" "}
                    {selectedOrder.customer.name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDetailOrder(selectedOrder)}
                  >
                    Chi tiết
                  </Button>
                  {selectedOrder.status === CustomOrderStatus.SUBMITTED && (
                    <Button
                      size="sm"
                      disabled={isSubmitting}
                      onClick={() => {
                        setQuoteOrder(selectedOrder)
                        setQuoteForm({
                          quotedPrice: String(
                            selectedOrder.estimatedPrice ?? 1200000
                          ),
                          depositAmount: String(
                            selectedOrder.depositAmount ?? 500000
                          ),
                          estimatedDays: "14",
                          description: "Báo giá từ seller",
                        })
                      }}
                    >
                      Gửi báo giá
                    </Button>
                  )}
                  {(
                    [
                      CustomOrderStatus.QUOTE_ACCEPTED,
                      CustomOrderStatus.DEPOSIT_PAID,
                      CustomOrderStatus.IN_PROGRESS,
                      CustomOrderStatus.REVISION_REQUESTED,
                      CustomOrderStatus.READY,
                    ] as CustomOrderStatus[]
                  ).includes(selectedOrder.status) && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isSubmitting}
                      onClick={() => {
                        setProgressOrder(selectedOrder)
                        setProgressFiles([])
                        setProgressForm({
                          title: "Cập nhật tiến độ",
                          description:
                            "Shop đã cập nhật tiến độ mới cho đơn đặt may.",
                          progressPercent: String(
                            Math.max(selectedOrder.progressPercent, 35)
                          ),
                        })
                      }}
                    >
                      Cập nhật tiến độ
                    </Button>
                  )}
                  {selectedOrder.status === CustomOrderStatus.READY && (
                    <Button
                      size="sm"
                      variant={
                        selectedOrder.trackingCode ? "secondary" : "default"
                      }
                      disabled={isSubmitting || !!selectedOrder.trackingCode}
                      onClick={() => {
                        if (selectedOrder.trackingCode) return
                        setShippingOrder(selectedOrder)
                        setShippingForm({
                          shippingCarrier:
                            selectedOrder.shippingCarrier ?? "GHTK",
                          trackingCode: selectedOrder.trackingCode ?? "",
                          shippingFee: String(
                            selectedOrder.shippingFee || 35000
                          ),
                        })
                      }}
                    >
                      {selectedOrder.trackingCode ? "Đã giao" : "Giao hàng"}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                <p className="text-sm font-medium text-foreground">
                  Yêu cầu từ khách hàng:
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedOrder.description}
                </p>
                {selectedOrder.specialRequests && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {selectedOrder.specialRequests}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/60">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Ruler className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-base">Số đo</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedOrder.measurement ? (
                    Object.entries(selectedOrder.measurement)
                      .filter(([, value]) => value != null && value !== "")
                      .map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between rounded-lg border border-border/60 bg-background p-3"
                        >
                          <span className="text-sm text-muted-foreground">
                            {measurementLabels[key] ?? key}
                          </span>
                          <span className="font-semibold text-foreground">
                            {value}
                          </span>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Khách chưa chọn số đo.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-sky-500/10 p-2">
                    <ImageIcon className="h-4 w-4 text-sky-600" />
                  </div>
                  <CardTitle className="text-base">
                    Hình ảnh tham khảo
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {selectedOrder.referenceImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {selectedOrder.referenceImages.map((reference) => (
                      <div
                        key={reference}
                        className="relative aspect-square overflow-hidden rounded-lg border border-border/60 bg-muted"
                      >
                        <Image
                          src={reference}
                          alt="Hình tham khảo"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/30">
                    <p className="text-sm text-muted-foreground">
                      Chưa có hình ảnh tham khảo
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/60">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-purple-500/10 p-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                </div>
                <CardTitle className="text-base">Báo giá & tiến độ</CardTitle>
              </div>
              <Progress
                value={selectedOrder.progressPercent}
                className="mt-2"
              />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-3">
                {tailoringStages.map((stage) => {
                  const isDone =
                    selectedOrder.progressPercent >= stage.progressPercent

                  return (
                    <div
                      key={stage.title}
                      className={`rounded-lg border p-3 ${
                        isDone
                          ? "border-emerald-200 bg-emerald-500/5"
                          : "border-border/60 bg-background"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          className={`h-4 w-4 ${
                            isDone
                              ? "text-emerald-600"
                              : "text-muted-foreground"
                          }`}
                        />
                        <span className="text-xs font-semibold">
                          {stage.progressPercent}%
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {stage.title}
                      </p>
                    </div>
                  )
                })}
              </div>

              {selectedOrder.quotes.length > 0 && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {selectedOrder.quotes.map((quote) => (
                    <div
                      key={quote.id}
                      className="rounded-lg border border-border/60 bg-background p-3"
                    >
                      <p className="font-semibold">
                        {formatCurrency(quote.quotedPrice)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Cọc {formatCurrency(quote.depositAmount)} ·{" "}
                        {quote.estimatedDays} ngày
                      </p>
                      {quote.isAccepted && (
                        <Badge className="mt-2" variant="secondary">
                          Đã chốt
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                {selectedOrder.progressUpdates.map((progress) => (
                  <div key={progress.id} className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-emerald-500/10 p-1">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {progress.title} · {progress.progressPercent}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {progress.description}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(progress.createdAt)}
                      </p>
                      {progress.images.length > 0 && (
                        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                          {progress.images.map((imageUrl) => (
                            <div
                              key={imageUrl}
                              className="relative aspect-square overflow-hidden rounded-md border border-border/60 bg-muted"
                            >
                              <Image
                                src={imageUrl}
                                alt={progress.title}
                                fill
                                sizes="120px"
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedOrder.revisions.length > 0 && (
            <Card className="border-amber-200 bg-amber-500/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-amber-500/10 p-2">
                    <MessageSquare className="h-4 w-4 text-amber-600" />
                  </div>
                  <CardTitle className="text-base">Yêu cầu chỉnh sửa</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedOrder.revisions.map((revision) => (
                    <div
                      key={revision.id}
                      className="rounded-lg border border-amber-200 bg-background p-4"
                    >
                      <p className="text-sm text-foreground">
                        {revision.description}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatDate(revision.createdAt)}
                      </p>
                      {revision.sellerResponse && (
                        <p className="mt-3 rounded-md bg-muted p-3 text-sm text-muted-foreground">
                          {revision.sellerResponse}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                {selectedOrder.revisions.some(
                  (item) => !item.sellerResponse
                ) && (
                  <div className="mt-4 space-y-2">
                    <Textarea
                      placeholder="Nhập phản hồi cho khách hàng..."
                      value={replyText}
                      onChange={(event) => setReplyText(event.target.value)}
                      className="min-h-[80px]"
                    />
                    <Button
                      size="sm"
                      className="w-full"
                      disabled={isSubmitting || !replyText.trim()}
                      onClick={() => respondRevision(selectedOrder)}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Gửi phản hồi
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card className="flex h-[600px] items-center justify-center border-border/60">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-muted p-4">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <p className="text-sm font-semibold text-foreground">
              Chọn một đơn đặt may
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Chọn đơn từ danh sách bên trái để xem chi tiết
            </p>
          </div>
        </Card>
      )}

      <Dialog
        open={!!quoteOrder}
        onOpenChange={(open) => !open && setQuoteOrder(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Gửi báo giá</DialogTitle>
            <DialogDescription>
              Nhập giá, tiền cọc và thời gian dự kiến cho yêu cầu đặt may.
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
            <div className="sm:col-span-2">
              <Field label="Ghi chú">
                <Textarea
                  value={quoteForm.description}
                  onChange={(event) =>
                    setQuoteForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                />
              </Field>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuoteOrder(null)}>
              Hủy
            </Button>
            <Button disabled={isSubmitting} onClick={sendQuote}>
              Gửi báo giá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!detailOrder}
        onOpenChange={(open) => !open && setDetailOrder(null)}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{detailOrder?.title}</DialogTitle>
            <DialogDescription>
              Tổng quan yêu cầu, báo giá và các mốc tiến độ đặt may.
            </DialogDescription>
          </DialogHeader>
          {detailOrder && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <Summary label="Mã đơn" value={detailOrder.orderNumber} />
                <Summary label="Khách hàng" value={detailOrder.customer.name} />
                <Summary label="Trạng thái" value={detailOrder.statusLabel} />
              </div>
              <div className="rounded-lg border border-border/60 p-4">
                <p className="text-sm font-semibold">Yêu cầu</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {detailOrder.description}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Summary
                  label="Báo giá gần nhất"
                  value={
                    detailOrder.quotes[0]
                      ? formatCurrency(detailOrder.quotes[0].quotedPrice)
                      : "Chưa có"
                  }
                />
                <Summary
                  label="Tiến độ"
                  value={`${detailOrder.progressPercent}%`}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!progressOrder}
        onOpenChange={(open) => {
          if (!open) {
            setProgressOrder(null)
            setProgressFiles([])
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Cập nhật tiến độ</DialogTitle>
            <DialogDescription>
              Ghi lại mốc tiến độ mới để khách theo dõi quá trình gia công.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Field label="Tiêu đề">
              <Input
                value={progressForm.title}
                onChange={(event) =>
                  setProgressForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Tiến độ (%)">
              <Input
                type="number"
                min={0}
                max={100}
                value={progressForm.progressPercent}
                onChange={(event) =>
                  setProgressForm((current) => ({
                    ...current,
                    progressPercent: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Mô tả">
              <Textarea
                value={progressForm.description}
                onChange={(event) =>
                  setProgressForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Ảnh hoàn thiện / tiến độ">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []).slice(0, 5)
                  setProgressFiles(files)
                }}
              />
              <p className="text-xs text-muted-foreground">
                Tối đa 5 ảnh, mỗi ảnh 5MB. Ảnh này sẽ gửi cho người đặt may.
              </p>
              {progressFiles.length > 0 && (
                <div className="grid grid-cols-5 gap-2">
                  {progressFiles.map((file) => (
                    <div
                      key={`${file.name}-${file.lastModified}`}
                      className="flex aspect-square items-center justify-center rounded-md border border-border/60 bg-muted text-muted-foreground"
                      title={file.name}
                    >
                      <ImageIcon className="h-5 w-5" />
                    </div>
                  ))}
                </div>
              )}
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProgressOrder(null)}>
              Hủy
            </Button>
            <Button disabled={isSubmitting} onClick={updateProgress}>
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!shippingOrder}
        onOpenChange={(open) => !open && setShippingOrder(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Giao hàng</DialogTitle>
            <DialogDescription>
              Nhập thông tin vận chuyển để người đặt may thanh toán phần còn lại
              và xác nhận nhận hàng.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Field label="Đơn vị vận chuyển">
              <Input
                value={shippingForm.shippingCarrier}
                onChange={(event) =>
                  setShippingForm((current) => ({
                    ...current,
                    shippingCarrier: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Mã vận đơn">
              <Input
                value={shippingForm.trackingCode}
                onChange={(event) =>
                  setShippingForm((current) => ({
                    ...current,
                    trackingCode: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Phí giao hàng">
              <Input
                type="number"
                min={0}
                value={shippingForm.shippingFee}
                onChange={(event) =>
                  setShippingForm((current) => ({
                    ...current,
                    shippingFee: event.target.value,
                  }))
                }
              />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShippingOrder(null)}>
              Hủy
            </Button>
            <Button disabled={isSubmitting} onClick={updateShipping}>
              Gửi thông tin giao hàng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
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

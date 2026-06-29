"use client"

import { useCallback, useEffect, useMemo, useState, useTransition } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import {
  Banknote,
  CheckCircle2,
  Clock,
  MessageCircle,
  Send,
} from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Footer } from "@/components/home/footer"
import { Navbar } from "@/components/home/navbar"
import { formatCurrency } from "@/lib/format"

type CustomOrder = {
  id: number
  orderNumber: string
  title: string
  description: string
  status: string
  statusLabel: string
  deadline: string | null
  finalAmount: number | null
  estimatedPrice: number | null
  depositAmount: number | null
  totalPaid: number
  shippingFee: number
  trackingCode: string | null
  shippingCarrier: string | null
  remainingAmount: number
  progressPercent: number
  seller: { id: number; name: string; avatar: string | null }
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
}

type Message = {
  id: string
  senderId: number
  senderName: string
  senderAvatar: string | null
  content: string
  createdAt: string
}

const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(value))
    : "Chưa có"

export function ProgressTracking() {
  const params = useParams()
  const orderId = String(params.id ?? "")
  const [order, setOrder] = useState<CustomOrder | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  const loadOrder = useCallback(async () => {
    const res = await fetch(`/api/custom-orders/${orderId}`)
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? "Không thể tải đơn đặt may")
    setOrder(json.data)
  }, [orderId])

  const loadMessages = useCallback(async () => {
    const res = await fetch(`/api/custom-orders/${orderId}/messages`)
    const json = await res.json()
    if (res.ok) setMessages(json.data.messages ?? [])
  }, [orderId])

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      try {
        await Promise.all([loadOrder(), loadMessages()])
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      } finally {
        setIsLoading(false)
      }
    }, 0)
    return () => window.clearTimeout(timeoutId)
  }, [loadMessages, loadOrder])

  const latestQuote = order?.quotes[0] ?? null
  const timeline = useMemo(() => {
    if (!order) return []
    return [
      {
        title: "Gửi yêu cầu",
        description: order.description,
        images: [],
        videos: [],
        progressPercent: 0,
        createdAt: null,
      },
      ...order.progressUpdates,
    ]
  }, [order])

  const acceptQuote = (quoteId: number) => {
    startTransition(async () => {
      const res = await fetch(`/api/custom-orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "acceptQuote", quoteId }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(json.error ?? "Không thể nhận báo giá")
        return
      }
      setOrder(json.data)
      toast.success("Đã nhận báo giá từ seller")
    })
  }

  const runOrderAction = (
    action: "payDeposit" | "payFinal" | "confirmReceived"
  ) => {
    startTransition(async () => {
      const res = await fetch(`/api/custom-orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(json.error ?? "Khong the cap nhat don dat may")
        return
      }
      setOrder(json.data)
      toast.success("Da cap nhat don dat may")
    })
  }

  const sendMessage = () => {
    if (!message.trim()) return
    startTransition(async () => {
      const res = await fetch(`/api/custom-orders/${orderId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message.trim() }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(json.error ?? "Không thể gửi tin nhắn")
        return
      }
      setMessages(json.data.messages ?? [])
      setMessage("")
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
          <Skeleton className="h-[640px] rounded-xl" />
        </div>
        <Footer />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          Không tìm thấy đơn đặt may.
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="border-b border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-5 md:px-6">
          <Breadcrumb className="mb-3">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/profile/custom-orders">
                  Đặt may của tôi
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{order.orderNumber}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                {order.title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Maker: <span className="font-medium">{order.seller.name}</span>
              </p>
            </div>
            <Badge variant="secondary" className="w-fit gap-1.5">
              <Clock className="h-3 w-3" />
              {order.statusLabel} ({order.progressPercent}%)
            </Badge>
          </div>
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
              <span>Tiến độ tổng thể</span>
              <span className="font-semibold text-primary">
                {order.progressPercent}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${order.progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-5">
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Banknote className="h-4 w-4 text-primary" />
                  Thông tin báo giá
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Info label="Mã đơn" value={order.orderNumber} />
                <Info
                  label="Báo giá"
                  value={
                    order.finalAmount || order.estimatedPrice
                      ? formatCurrency(
                          order.finalAmount ?? order.estimatedPrice ?? 0
                        )
                      : "Chưa có"
                  }
                />
                <Info
                  label="Tiền cọc"
                  value={
                    order.depositAmount
                      ? formatCurrency(order.depositAmount)
                      : "Chưa có"
                  }
                />
                <Info
                  label="Đã thanh toán"
                  value={formatCurrency(order.totalPaid)}
                />
                <Info
                  label="Còn lại"
                  value={formatCurrency(order.remainingAmount)}
                />
                {order.shippingFee > 0 && (
                  <Info
                    label="Phí giao hàng"
                    value={formatCurrency(order.shippingFee)}
                  />
                )}
                {order.trackingCode && (
                  <Info
                    label="Vận đơn"
                    value={`${order.shippingCarrier ?? "Đơn vị VC"} - ${order.trackingCode}`}
                  />
                )}
                <Info label="Deadline" value={formatDate(order.deadline)} />
                {order.status === "QUOTE_ACCEPTED" && order.depositAmount && (
                  <Button
                    className="w-full"
                    disabled={isPending}
                    onClick={() => runOrderAction("payDeposit")}
                  >
                    Đặt cọc {formatCurrency(order.depositAmount)}
                  </Button>
                )}
                {order.status === "READY" && order.remainingAmount > 0 && (
                  <Button
                    className="w-full"
                    disabled={isPending}
                    onClick={() => runOrderAction("payFinal")}
                  >
                    Thanh toán còn lại {formatCurrency(order.remainingAmount)}
                  </Button>
                )}
                {order.status === "READY" &&
                  order.trackingCode &&
                  order.remainingAmount === 0 && (
                    <Button
                      className="w-full"
                      disabled={isPending}
                      onClick={() => runOrderAction("confirmReceived")}
                    >
                      Xác nhận đã nhận hàng
                    </Button>
                  )}
              </CardContent>
            </Card>

            {latestQuote && (
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Báo giá mới từ seller
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <Info
                    label="Giá"
                    value={formatCurrency(latestQuote.quotedPrice)}
                  />
                  <Info
                    label="Cọc"
                    value={formatCurrency(latestQuote.depositAmount)}
                  />
                  <Info
                    label="Thời gian"
                    value={`${latestQuote.estimatedDays} ngày`}
                  />
                  {latestQuote.description && (
                    <p className="rounded-lg bg-background p-3 text-muted-foreground">
                      {latestQuote.description}
                    </p>
                  )}
                  <Button
                    className="w-full"
                    disabled={
                      isPending ||
                      latestQuote.isAccepted ||
                      order.status !== "QUOTED"
                    }
                    onClick={() => acceptQuote(latestQuote.id)}
                  >
                    {latestQuote.isAccepted
                      ? "Đã nhận báo giá"
                      : "Nhận báo giá"}
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4 text-primary" />
                  Cột mốc tiến độ
                </CardTitle>
              </CardHeader>
              <CardContent>
                {timeline.map((step, index) => (
                  <div
                    key={`${step.title}-${index}`}
                    className="flex gap-3 pb-4 last:pb-0"
                  >
                    <div className="flex flex-col items-center">
                      <div className="z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-green-500 bg-green-500 text-white">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                      {index < timeline.length - 1 && (
                        <div
                          className="mt-1 w-px bg-green-400"
                          style={{ height: 28 }}
                        />
                      )}
                    </div>
                    <div className="pt-0.5">
                      <p className="text-sm font-semibold">{step.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {step.progressPercent}% · {formatDate(step.createdAt)}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {step.description}
                      </p>
                      {step.images.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {step.images.map((imageUrl) => (
                            <div
                              key={imageUrl}
                              className="relative aspect-square overflow-hidden rounded-lg border border-border/60 bg-muted"
                            >
                              <Image
                                src={imageUrl}
                                alt={step.title}
                                fill
                                sizes="160px"
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col lg:col-span-2">
            <Card className="flex h-[640px] flex-1 flex-col overflow-hidden border-border/60">
              <CardHeader className="shrink-0 border-b bg-muted/20 px-4 py-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  Nhắn tin với seller
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full p-4">
                  {messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                      <MessageCircle className="mb-4 h-12 w-12 text-muted-foreground/30" />
                      <p className="text-sm font-semibold">
                        Chưa có tin nhắn nào
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((item) => {
                        const isSeller = item.senderId === order.seller.id
                        return (
                          <div
                            key={item.id}
                            className={`flex gap-3 ${isSeller ? "" : "flex-row-reverse"}`}
                          >
                            <Avatar className="size-9 shrink-0">
                              <AvatarImage
                                src={item.senderAvatar ?? undefined}
                              />
                              <AvatarFallback>
                                {item.senderName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`max-w-[75%] rounded-2xl p-3 text-sm ${
                                isSeller
                                  ? "rounded-tl-none bg-muted"
                                  : "rounded-tr-none bg-primary text-primary-foreground"
                              }`}
                            >
                              <p className="mb-1 text-xs opacity-70">
                                {item.senderName} · {formatDate(item.createdAt)}
                              </p>
                              {item.content}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>

              <Separator />
              <CardFooter className="shrink-0 p-3">
                <form
                  className="flex w-full items-center gap-2"
                  onSubmit={(event) => {
                    event.preventDefault()
                    sendMessage()
                  }}
                >
                  <Input
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Nhắn tin với seller..."
                    className="flex-1"
                    disabled={isPending}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!message.trim() || isPending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}

"use client"

import { useCallback, useEffect, useMemo, useState, useTransition } from "react"
import Link from "next/link"
import {
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  Package,
  PackageCheck,
  RotateCcw,
  Search,
  Truck,
  XCircle,
} from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Footer } from "@/components/home/footer"
import { Navbar } from "@/components/home/navbar"

type OrderItem = {
  id: string
  name: string
  quantity: number
  price: number
}

type ReturnRequest = {
  id: number
  status: string
  reason: string
  adminNote: string | null
  refundAmount: number | null
  createdAt: string
}

type Order = {
  source?: "ORDER" | "CUSTOM_ORDER"
  id: string
  detailUrl?: string | null
  date: string
  total: number
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipping"
    | "delivered"
    | "completed"
    | "cancelled"
    | "refunded"
    | "draft"
    | "submitted"
    | "quoted"
    | "quote_accepted"
    | "deposit_paid"
    | "in_progress"
    | "revision_requested"
    | "ready"
  paymentStatus?: string
  escrowStatus?: string
  returnRequest?: ReturnRequest | null
  items: OrderItem[]
  shippingAddress?: string
  trackingNumber?: string
  progressPercent?: number
  sellerName?: string
}

const statusConfig: Record<
  string,
  {
    label: string
    icon: typeof Clock
    variant: "secondary"
    color: string
  }
> = {
  pending: {
    label: "Chờ xác nhận",
    icon: Clock,
    variant: "secondary" as const,
    color: "text-muted-foreground",
  },
  confirmed: {
    label: "Đã xác nhận",
    icon: Package,
    variant: "secondary" as const,
    color: "text-blue-600",
  },
  processing: {
    label: "Đang xử lý",
    icon: Package,
    variant: "secondary" as const,
    color: "text-blue-600",
  },
  shipping: {
    label: "Đang giao",
    icon: Truck,
    variant: "secondary" as const,
    color: "text-amber-600",
  },
  delivered: {
    label: "Đã giao",
    icon: PackageCheck,
    variant: "secondary" as const,
    color: "text-blue-600",
  },
  completed: {
    label: "Hoàn thành",
    icon: CheckCircle2,
    variant: "secondary" as const,
    color: "text-green-600",
  },
  cancelled: {
    label: "Đã hủy",
    icon: XCircle,
    variant: "secondary" as const,
    color: "text-destructive",
  },
  refunded: {
    label: "Đã hoàn tiền",
    icon: RotateCcw,
    variant: "secondary" as const,
    color: "text-green-600",
  },
}

Object.assign(statusConfig, {
  draft: {
    label: "Nháp",
    icon: Clock,
    variant: "secondary" as const,
    color: "text-muted-foreground",
  },
  submitted: {
    label: "Đã gửi yêu cầu",
    icon: Clock,
    variant: "secondary" as const,
    color: "text-amber-600",
  },
  quoted: {
    label: "Seller đã báo giá",
    icon: Package,
    variant: "secondary" as const,
    color: "text-blue-600",
  },
  quote_accepted: {
    label: "Đã nhận báo giá",
    icon: CheckCircle2,
    variant: "secondary" as const,
    color: "text-blue-600",
  },
  deposit_paid: {
    label: "Đã đặt cọc",
    icon: CheckCircle2,
    variant: "secondary" as const,
    color: "text-green-600",
  },
  in_progress: {
    label: "Đang gia công",
    icon: Package,
    variant: "secondary" as const,
    color: "text-blue-600",
  },
  revision_requested: {
    label: "Yêu cầu chỉnh sửa",
    icon: RotateCcw,
    variant: "secondary" as const,
    color: "text-amber-600",
  },
  ready: {
    label: "Sẵn sàng giao",
    icon: Truck,
    variant: "secondary" as const,
    color: "text-amber-600",
  },
})

const returnReasons = [
  { value: "WRONG_ITEM", label: "Sai sản phẩm" },
  { value: "DAMAGED", label: "Sản phẩm hư hỏng" },
  { value: "NOT_AS_DESCRIBED", label: "Không đúng mô tả" },
  { value: "MISSING_PARTS", label: "Thiếu phụ kiện" },
  { value: "OTHER", label: "Khác" },
]

const returnStatusLabels: Record<string, string> = {
  PENDING: "Chờ admin xử lý",
  APPROVED: "Đã duyệt trả hàng",
  REJECTED: "Từ chối",
  SHIPPING_BACK: "Đang gửi trả",
  RECEIVED: "Đã nhận hàng trả",
  REFUNDED: "Đã hoàn tiền",
  CLOSED: "Đã đóng",
}

const canRequestReturn = (order: Order) =>
  order.source !== "CUSTOM_ORDER" &&
  ["delivered", "completed"].includes(order.status) &&
  order.paymentStatus !== "REFUNDED" &&
  !order.returnRequest

export function ProfileOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [returnOrder, setReturnOrder] = useState<Order | null>(null)
  const [reason, setReason] = useState("NOT_AS_DESCRIBED")
  const [description, setDescription] = useState("")
  const [imageLinks, setImageLinks] = useState("")
  const [isPending, startTransition] = useTransition()

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch("/api/orders")
      if (!res.ok) throw new Error("Không thể tải danh sách đơn hàng")
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (err) {
      setError((err as Error).message || "Đã xảy ra lỗi")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      void fetchOrders()
    })
  }, [fetchOrders])

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter
      const query = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !query ||
        order.id.toLowerCase().includes(query) ||
        order.items.some((item) => item.name.toLowerCase().includes(query))

      return matchesStatus && matchesSearch
    })
  }, [orders, searchQuery, statusFilter])

  const submitReturnRequest = () => {
    if (!returnOrder) return

    startTransition(async () => {
      const images = imageLinks
        .split("\n")
        .map((link) => link.trim())
        .filter(Boolean)

      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: returnOrder.id,
          reason,
          description,
          images,
          videos: [],
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error ?? "Không thể tạo yêu cầu hoàn tiền")
        return
      }

      toast.success("Đã gửi yêu cầu hoàn tiền cho admin")
      setReturnOrder(null)
      setDescription("")
      setImageLinks("")
      await fetchOrders()
    })
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount)

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="border-b border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-5 md:px-6">
          <h1 className="text-2xl font-extrabold tracking-tight">
            Lịch sử đơn hàng
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Theo dõi đơn hàng và gửi yêu cầu hoàn tiền khi cần admin xử lý.
          </p>
        </div>
      </div>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
          {isLoading ? (
            <div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">
              Đang tải lịch sử đơn hàng...
            </div>
          ) : error ? (
            <div className="flex min-h-[300px] items-center justify-center text-sm font-semibold text-destructive">
              {error}
            </div>
          ) : orders.length === 0 ? (
            <Card className="border-border/60">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="mb-4 h-12 w-12 text-muted-foreground/30" />
                <h3 className="text-lg font-semibold">Chưa có đơn hàng nào</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Các đơn hàng của bạn sẽ xuất hiện ở đây.
                </p>
                <Button asChild className="mt-6">
                  <Link href="/products">Khám phá sản phẩm</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="mb-6 border-border/60">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                      <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Tìm theo mã đơn hoặc tên sản phẩm..."
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-full sm:w-[210px]">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="pending">Chờ xác nhận</SelectItem>
                        <SelectItem value="processing">Đang xử lý</SelectItem>
                        <SelectItem value="shipping">Đang giao</SelectItem>
                        <SelectItem value="delivered">Đã giao</SelectItem>
                        <SelectItem value="completed">Hoàn thành</SelectItem>
                        <SelectItem value="refunded">Đã hoàn tiền</SelectItem>
                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const config =
                    statusConfig[order.status] ?? statusConfig.pending!
                  const StatusIcon = config.icon

                  return (
                    <Card key={order.id} className="border-border/60">
                      <CardHeader className="pb-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                              <PackageCheck className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-base">
                                {order.id}
                              </CardTitle>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(order.date)}
                              </p>
                              {order.source === "CUSTOM_ORDER" && (
                                <p className="mt-1 text-xs font-semibold text-primary">
                                  Đặt may
                                  {order.sellerName
                                    ? ` · ${order.sellerName}`
                                    : ""}
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant={config.variant}
                            className="w-fit gap-1.5"
                          >
                            <StatusIcon
                              className={`h-3.5 w-3.5 ${config.color}`}
                            />
                            <span className={config.color}>{config.label}</span>
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Separator />
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Số lượng: {item.quantity}
                                </p>
                              </div>
                              <p className="font-semibold">
                                {formatCurrency(item.price)}
                              </p>
                            </div>
                          ))}
                        </div>

                        {order.returnRequest && (
                          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                            <p className="font-semibold">
                              Yêu cầu hoàn tiền:{" "}
                              {returnStatusLabels[order.returnRequest.status] ??
                                order.returnRequest.status}
                            </p>
                            {order.returnRequest.adminNote && (
                              <p className="mt-1">
                                Admin: {order.returnRequest.adminNote}
                              </p>
                            )}
                          </div>
                        )}

                        {order.source === "CUSTOM_ORDER" && (
                          <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                            <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                              <span>Tiến độ đặt may</span>
                              <span className="font-semibold text-primary">
                                {order.progressPercent ?? 0}%
                              </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{
                                  width: `${order.progressPercent ?? 0}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        <Separator />
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              Tổng cộng:
                            </span>
                            <span className="ml-2 text-lg font-bold text-primary">
                              {formatCurrency(order.total)}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {canRequestReturn(order) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setReturnOrder(order)}
                              >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Yêu cầu hoàn tiền
                              </Button>
                            )}
                            {order.detailUrl ? (
                              <Button asChild variant="outline" size="sm">
                                <Link href={order.detailUrl}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Xem tiến độ
                                </Link>
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedOrder(order)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Chi tiết
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </main>

      <Dialog
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng</DialogTitle>
            <DialogDescription>
              Thông tin giao hàng, trạng thái thanh toán và sản phẩm.
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mã đơn hàng:</span>
                  <span className="font-semibold">{selectedOrder.id}</span>
                </div>
                <div className="mt-2 flex justify-between">
                  <span className="text-muted-foreground">Thanh toán:</span>
                  <span className="font-semibold">
                    {selectedOrder.paymentStatus ?? "N/A"}
                  </span>
                </div>
                <div className="mt-2 flex justify-between">
                  <span className="text-muted-foreground">Escrow:</span>
                  <span className="font-semibold">
                    {selectedOrder.escrowStatus ?? "N/A"}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="mb-3 font-semibold">Sản phẩm</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border border-border/60 p-3"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.shippingAddress && (
                <div>
                  <h4 className="mb-2 font-semibold">Địa chỉ giao hàng</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.shippingAddress}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!returnOrder}
        onOpenChange={(open) => !open && setReturnOrder(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yêu cầu hoàn tiền / tranh chấp</DialogTitle>
            <DialogDescription>
              Admin sẽ xem lý do, bằng chứng và quyết định hoàn tiền.
            </DialogDescription>
          </DialogHeader>
          {returnOrder && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <p className="font-semibold">{returnOrder.id}</p>
                <p className="text-muted-foreground">
                  Giá trị đơn: {formatCurrency(returnOrder.total)}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Lý do</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {returnReasons.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mô tả vấn đề</Label>
                <Textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  placeholder="Mô tả tình trạng sản phẩm, mong muốn xử lý..."
                />
              </div>
              <div className="space-y-2">
                <Label>Link ảnh bằng chứng</Label>
                <Textarea
                  value={imageLinks}
                  onChange={(event) => setImageLinks(event.target.value)}
                  rows={3}
                  placeholder="Mỗi dòng một link ảnh, tối đa 5 link"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReturnOrder(null)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button onClick={submitReturnRequest} disabled={isPending}>
              {isPending ? "Đang gửi..." : "Gửi yêu cầu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}

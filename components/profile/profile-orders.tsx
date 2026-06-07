"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Package,
  Search,
  Filter,
  Download,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  PackageCheck,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { Navbar } from "@/components/home/navbar"
import { Footer } from "@/components/home/footer"

type OrderItem = {
  id: string
  name: string
  quantity: number
  price: number
  image?: string
}

type Order = {
  id: string
  date: string
  total: number
  status: "pending" | "processing" | "shipping" | "completed" | "cancelled"
  items: OrderItem[]
  shippingAddress?: string
  trackingNumber?: string
}

const STORAGE_KEY = "orders"

const SAMPLE_ORDERS: Order[] = [
  {
    id: "ORD-2024-001",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    total: 1299000,
    status: "completed",
    items: [
      {
        id: "P1",
        name: "Genshin Impact – Raiden Shogun",
        quantity: 1,
        price: 1299000,
      },
    ],
    shippingAddress: "123 Đường ABC, Quận 1, TP.HCM",
    trackingNumber: "VN123456789",
  },
  {
    id: "ORD-2024-002",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    total: 899000,
    status: "shipping",
    items: [
      {
        id: "P2",
        name: "Spy x Family – Anya Forger",
        quantity: 1,
        price: 899000,
      },
    ],
    shippingAddress: "456 Đường XYZ, Quận 3, TP.HCM",
    trackingNumber: "VN987654321",
  },
  {
    id: "ORD-2024-003",
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    total: 1599000,
    status: "processing",
    items: [
      {
        id: "P3",
        name: "Demon Slayer – Nezuko Kamado",
        quantity: 1,
        price: 1599000,
      },
    ],
    shippingAddress: "789 Đường DEF, Quận 7, TP.HCM",
  },
]

const statusConfig = {
  pending: {
    label: "Chờ xác nhận",
    icon: Clock,
    variant: "secondary" as const,
    color: "text-muted-foreground",
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
}

// Helper to load from localStorage
const loadOrders = (): Order[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      console.error("Failed to load orders:", e)
    }
  }
  return []
}

export function ProfileOrders() {
  const [orders, setOrders] = useState<Order[]>(loadOrders)
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Save to localStorage whenever orders change
  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
    }
  }, [orders])

  // Filter orders - use useMemo to avoid setState in effect
  useEffect(() => {
    let filtered = orders

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.items.some((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    }

    // Use queueMicrotask to defer state update
    queueMicrotask(() => {
      setFilteredOrders(filtered)
    })
  }, [orders, statusFilter, searchQuery])

  const handleImportSample = () => {
    setOrders((prev) => [...SAMPLE_ORDERS, ...prev])
  }

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailOpen(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
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
                <BreadcrumbLink href="/profile">
                  Thông tin cá nhân
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Lịch sử đơn hàng</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                Lịch sử đơn hàng
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Theo dõi và quản lý các đơn hàng của bạn
              </p>
            </div>
            {orders.length === 0 && (
              <Button variant="outline" size="sm" onClick={handleImportSample}>
                <Download className="mr-2 h-4 w-4" />
                Nhập đơn mẫu
              </Button>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
          {orders.length === 0 ? (
            <Card className="border-border/60">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="mb-4 h-12 w-12 text-muted-foreground/30" />
                <h3 className="text-lg font-semibold">Chưa có đơn hàng nào</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Các đơn hàng của bạn sẽ xuất hiện ở đây
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <Button asChild>
                    <Link href="/products">Khám phá sản phẩm</Link>
                  </Button>
                  <Button variant="outline" onClick={handleImportSample}>
                    <Download className="mr-2 h-4 w-4" />
                    Nhập đơn mẫu
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Filters */}
              <Card className="mb-6 border-border/60">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                      <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Tìm theo mã đơn hoặc tên sản phẩm..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-full sm:w-[200px]">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="pending">Chờ xác nhận</SelectItem>
                        <SelectItem value="processing">Đang xử lý</SelectItem>
                        <SelectItem value="shipping">Đang giao</SelectItem>
                        <SelectItem value="completed">Hoàn thành</SelectItem>
                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Orders List */}
              {filteredOrders.length === 0 ? (
                <Card className="border-border/60">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="mb-4 h-12 w-12 text-muted-foreground/30" />
                    <h3 className="text-lg font-semibold">
                      Không tìm thấy đơn hàng
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => {
                    const config = statusConfig[order.status]
                    const StatusIcon = config.icon
                    return (
                      <Card
                        key={order.id}
                        className="border-border/60 transition-all hover:border-primary/50 hover:shadow-sm"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                <PackageCheck className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-base">
                                  {order.id}
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(order.date)}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant={config.variant}
                              className="w-fit gap-1.5"
                            >
                              <StatusIcon
                                className={`h-3.5 w-3.5 ${config.color}`}
                              />
                              <span className={config.color}>
                                {config.label}
                              </span>
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
                                <div className="flex-1">
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
                          <Separator />
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <span className="text-muted-foreground">
                                Tổng cộng:
                              </span>
                              <span className="ml-2 text-lg font-bold text-primary">
                                {formatCurrency(order.total)}
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(order)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Chi tiết
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Order Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về đơn hàng của bạn
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mã đơn hàng:</span>
                    <span className="font-semibold">{selectedOrder.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ngày đặt:</span>
                    <span className="font-medium">
                      {formatDate(selectedOrder.date)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trạng thái:</span>
                    <Badge
                      variant={statusConfig[selectedOrder.status].variant}
                      className="gap-1.5"
                    >
                      {(() => {
                        const StatusIcon =
                          statusConfig[selectedOrder.status].icon
                        return (
                          <StatusIcon
                            className={`h-3.5 w-3.5 ${statusConfig[selectedOrder.status].color}`}
                          />
                        )
                      })()}
                      <span
                        className={statusConfig[selectedOrder.status].color}
                      >
                        {statusConfig[selectedOrder.status].label}
                      </span>
                    </Badge>
                  </div>
                  {selectedOrder.trackingNumber && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mã vận đơn:</span>
                      <span className="font-medium">
                        {selectedOrder.trackingNumber}
                      </span>
                    </div>
                  )}
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
                      <div className="flex-1">
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

              <Separator />

              <div className="flex items-center justify-between rounded-lg bg-primary/5 p-4">
                <span className="font-semibold">Tổng cộng:</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(selectedOrder.total)}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}

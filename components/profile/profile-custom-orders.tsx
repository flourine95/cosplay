"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Clock, MessageCircle, Scissors, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Footer } from "@/components/home/footer"
import { Navbar } from "@/components/home/navbar"
import { formatCurrency } from "@/lib/format"

type CustomOrder = {
  id: number
  orderNumber: string
  title: string
  status: string
  statusLabel: string
  finalAmount: number | null
  estimatedPrice: number | null
  progressPercent: number
  createdAt: string
  seller: { name: string }
  quotes: { id: number }[]
}

export function ProfileCustomOrders() {
  const [orders, setOrders] = useState<CustomOrder[]>([])
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/custom-orders")
      const json = await res.json()
      if (res.ok) setOrders(json.data ?? [])
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

  const filteredOrders = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return orders
    return orders.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(normalized) ||
        order.title.toLowerCase().includes(normalized) ||
        order.seller.name.toLowerCase().includes(normalized)
    )
  }, [orders, query])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="border-b border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-5 md:px-6">
          <h1 className="text-2xl font-extrabold tracking-tight">
            Đặt may của tôi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Nhận báo giá từ seller, xem tiến độ và nhắn tin theo từng đơn đặt
            may.
          </p>
        </div>
      </div>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
          <Card className="mb-6 border-border/60">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm mã đơn, tên bộ cosplay hoặc seller..."
                  className="pl-9"
                />
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <Card className="border-border/60">
              <CardContent className="flex min-h-64 flex-col items-center justify-center text-center">
                <Scissors className="mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="font-semibold">Chưa có đơn đặt may</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Khi bạn gửi yêu cầu đặt may, đơn sẽ xuất hiện ở đây.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/custom-order">Tạo yêu cầu đặt may</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredOrders.map((order) => (
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
                          Seller: {order.seller.name}
                        </p>
                      </div>
                      <Badge variant="secondary">{order.statusLabel}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 text-sm sm:grid-cols-2">
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
                        label="Tiến độ"
                        value={`${order.progressPercent}%`}
                      />
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${order.progressPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/custom-order/${order.id}`}>
                          <Clock className="mr-2 h-4 w-4" />
                          Xem tiến độ
                        </Link>
                      </Button>
                      <Button asChild size="sm">
                        <Link href={`/custom-order/${order.id}`}>
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Nhắn tin
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
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

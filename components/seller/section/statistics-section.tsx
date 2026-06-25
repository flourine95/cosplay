"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, Package, Star, ThumbsUp, TrendingUp, Users } from "lucide-react"
import Image from "next/image"
import type React from "react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

type StatisticsData = {
  kpis: {
    averageRating: number
    reviewCount: number
    completionRate: number
    responseMinutes: number
    returnCustomerRate: number
  }
  topProducts: {
    id: number
    name: string
    image: string | null
    orders: number
    revenue: number
    rating: number
  }[]
  topCustomers: {
    name: string
    avatar: string | null
    orders: number
    spent: number
  }[]
  recentReviews: {
    id: number
    customer: string
    avatar: string | null
    product: string
    rating: number
    comment: string
    createdAt: string
  }[]
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)

export function StatisticsSectionNew() {
  const [data, setData] = useState<StatisticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadStatistics() {
      try {
        const response = await fetch("/api/seller/statistics")
        const json = await response.json()
        if (!response.ok)
          throw new Error(json.error ?? "Không thể lấy thống kê")
        setData(json.data)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      } finally {
        setIsLoading(false)
      }
    }
    const timeoutId = window.setTimeout(() => void loadStatistics(), 0)
    return () => window.clearTimeout(timeoutId)
  }, [])

  if (isLoading) return <Skeleton className="h-[640px] rounded-xl" />
  if (!data) {
    return (
      <Card className="border-border/60 p-6 text-center text-sm text-muted-foreground">
        Chưa có dữ liệu thống kê.
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          icon={Star}
          label="Đánh giá trung bình"
          value={data.kpis.averageRating}
          note={`${data.kpis.reviewCount} đánh giá`}
        />
        <Kpi
          icon={TrendingUp}
          label="Tỉ lệ hoàn thành"
          value={`${data.kpis.completionRate}%`}
          note="Đơn hoàn tất"
        />
        <Kpi
          icon={Clock}
          label="Thời gian phản hồi"
          value={`${data.kpis.responseMinutes} phút`}
          note="Trung bình"
        />
        <Kpi
          icon={Users}
          label="Khách quay lại"
          value={`${data.kpis.returnCustomerRate}%`}
          note="Theo dữ liệu đơn hàng"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary/10 p-2">
                <Package className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle>Sản phẩm hiệu quả</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Xếp theo doanh thu từ order items.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topProducts.length === 0 ? (
              <EmptyText text="Chưa có sản phẩm phát sinh doanh thu." />
            ) : (
              data.topProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 rounded-lg border border-border/60 p-4"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-muted">
                    {product.image && (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{product.name}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="secondary">{product.orders} lượt</Badge>
                      <span className="flex items-center gap-1 text-xs">
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        {product.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <p className="font-semibold text-primary">
                    {formatCurrency(product.revenue)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-muted p-2">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <CardTitle>Khách hàng thân thiết</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Khách chi tiêu nhiều nhất.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topCustomers.length === 0 ? (
              <EmptyText text="Chưa có dữ liệu khách hàng." />
            ) : (
              data.topCustomers.map((customer, index) => (
                <div
                  key={customer.name}
                  className="flex items-center gap-4 rounded-lg border border-border/60 p-4"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold">
                    {index + 1}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={customer.avatar ?? undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {customer.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {customer.orders} đơn hàng
                    </p>
                  </div>
                  <p className="font-semibold text-primary">
                    {formatCurrency(customer.spent)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2">
              <ThumbsUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle>Đánh giá gần đây</CardTitle>
              <p className="text-sm text-muted-foreground">
                Phản hồi mới nhất từ khách hàng.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.recentReviews.length === 0 ? (
            <EmptyText text="Chưa có đánh giá nào." />
          ) : (
            data.recentReviews.map((review) => (
              <div
                key={review.id}
                className="rounded-lg border border-border/60 p-4"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.avatar ?? undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {review.customer.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold">{review.customer}</p>
                        <p className="text-xs text-muted-foreground">
                          {review.product}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: review.rating }).map(
                          (_, index) => (
                            <Star
                              key={index}
                              className="h-4 w-4 fill-primary text-primary"
                            />
                          )
                        )}
                      </div>
                    </div>
                    <p className="mt-2 text-sm">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Kpi({
  icon: Icon,
  label,
  note,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  note: string
  value: number | string
}) {
  return (
    <Card className="border-border/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <div className="rounded-full bg-muted p-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  )
}

function EmptyText({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
      {text}
    </div>
  )
}

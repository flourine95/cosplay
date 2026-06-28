"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { RecentReviewsCard } from "./recent-reviews-card"
import { StatisticsKpis } from "./statistics-kpis"
import { TopCustomersCard } from "./top-customers-card"
import { TopProductsCard } from "./top-products-card"
import type { StatisticsData, StatisticsResponse } from "./statistics-types"

export function SellerStatisticsClient() {
  const [data, setData] = useState<StatisticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadStatistics() {
      try {
        const response = await fetch("/api/seller/statistics")
        const json = (await response.json()) as StatisticsResponse & {
          error?: string
        }
        if (!response.ok) {
          throw new Error(json.error ?? "Không thể lấy thống kê")
        }
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
    <div className="flex flex-col gap-6">
      <StatisticsKpis kpis={data.kpis} />
      <div className="grid gap-6 lg:grid-cols-2">
        <TopProductsCard products={data.topProducts} />
        <TopCustomersCard customers={data.topCustomers} />
      </div>
      <RecentReviewsCard reviews={data.recentReviews} />
    </div>
  )
}

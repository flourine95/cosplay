"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { RevenueModelCard } from "./revenue-model-card"
import { RevenueSummary } from "./revenue-summary"
import { MonthlyRevenueTable, RevenueTransactionTable } from "./revenue-tables"
import type { RevenueData, RevenueResponse } from "./revenue-types"

export function RevenueDashboardClient() {
  const [data, setData] = useState<RevenueData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadRevenue() {
      try {
        const response = await fetch("/api/seller/revenue")
        const json = (await response.json()) as RevenueResponse & {
          error?: string
        }
        if (!response.ok) {
          throw new Error(json.error ?? "Không thể lấy tài chính")
        }
        setData(json.data)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      } finally {
        setIsLoading(false)
      }
    }

    const timeoutId = window.setTimeout(() => void loadRevenue(), 0)
    return () => window.clearTimeout(timeoutId)
  }, [])

  if (isLoading) return <Skeleton className="h-[640px] rounded-xl" />
  if (!data) {
    return (
      <Card className="border-border/60 p-6 text-center text-sm text-muted-foreground">
        Chưa có dữ liệu tài chính.
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <RevenueSummary summary={data.summary} />
      <RevenueModelCard items={data.revenueByModel} />
      <div className="grid gap-6 lg:grid-cols-2">
        <MonthlyRevenueTable rows={data.monthlyRevenue} />
        <RevenueTransactionTable transactions={data.transactions} />
      </div>
      <Button variant="outline" disabled className="self-start">
        Yêu cầu rút tiền
      </Button>
    </div>
  )
}

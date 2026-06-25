"use client"

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
import { Clock, DollarSign, Wallet } from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

type RevenueData = {
  summary: {
    monthRevenue: number
    totalRevenue: number
    heldDeposits: number
    pendingPayments: number
    availableBalance: number
  }
  revenueByModel: {
    model: string
    amount: number
    orders: number
    percent: number
  }[]
  monthlyRevenue: { month: string; revenue: number; orders: number }[]
  transactions: {
    id: string
    description: string
    customer: string
    amount: number
    date: string
    status: string
  }[]
}

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

export function RevenueSectionNew() {
  const [data, setData] = useState<RevenueData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadRevenue() {
      try {
        const response = await fetch("/api/seller/revenue")
        const json = await response.json()
        if (!response.ok)
          throw new Error(json.error ?? "Không thể lấy tài chính")
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
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          icon={DollarSign}
          label="Doanh thu tháng"
          value={data.summary.monthRevenue}
        />
        <Metric
          icon={Wallet}
          label="Số dư khả dụng"
          value={data.summary.availableBalance}
        />
        <Metric
          icon={Clock}
          label="Tiền cọc đang giữ"
          value={data.summary.heldDeposits}
        />
        <Metric
          icon={Clock}
          label="Chờ thanh toán"
          value={data.summary.pendingPayments}
        />
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Doanh thu theo mô hình</CardTitle>
          <p className="text-sm text-muted-foreground">
            Tổng hợp từ đơn mua, thuê và đặt may trong DB.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.revenueByModel.map((item) => (
            <div key={item.model} className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{item.model}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.orders} đơn
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">
                    {formatCurrency(item.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.percent}%
                  </p>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Doanh thu theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              headers={["Tháng", "Doanh thu", "Đơn hàng"]}
              rows={data.monthlyRevenue.map((row) => [
                row.month,
                formatCurrency(row.revenue),
                `${row.orders} đơn`,
              ])}
            />
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Giao dịch gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mô tả</TableHead>
                    <TableHead className="text-right">Số tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        Chưa có giao dịch.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.transactions.map((txn) => (
                      <TableRow key={txn.id}>
                        <TableCell>
                          <p className="font-medium">{txn.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {txn.customer} · {formatDate(txn.date)}
                          </p>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-primary">
                          {formatCurrency(txn.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{txn.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button variant="outline" disabled>
        Yêu cầu rút tiền
      </Button>
    </div>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
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
        <div className="text-2xl font-bold">{formatCurrency(value)}</div>
      </CardContent>
    </Card>
  )
}

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="rounded-lg border border-border/60">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header) => (
              <TableHead key={header}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.join("|")}>
              {row.map((cell) => (
                <TableCell key={cell}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

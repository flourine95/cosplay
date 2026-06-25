"use client"

import { RentalStatus } from "@/app/generated/prisma/enums"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

type RentalCalendarItem = {
  id: number
  orderNumber: string
  customer: {
    name: string
    phone: string | null
  }
  product: {
    name: string
    slug: string
  }
  startDate: string
  endDate: string
  actualReturnDate: string | null
  totalDays: number
  rentalFee: number
  depositAmount: number
  status: RentalStatus
  statusLabel: string
}

const statusClasses: Record<RentalStatus, string> = {
  [RentalStatus.PENDING]: "bg-amber-500/10 text-amber-700",
  [RentalStatus.CONFIRMED]: "bg-sky-500/10 text-sky-700",
  [RentalStatus.DEPOSIT_PAID]: "bg-sky-500/10 text-sky-700",
  [RentalStatus.READY_FOR_PICKUP]: "bg-indigo-500/10 text-indigo-700",
  [RentalStatus.RENTED]: "bg-purple-500/10 text-purple-700",
  [RentalStatus.RETURNED]: "bg-emerald-500/10 text-emerald-700",
  [RentalStatus.DEPOSIT_REFUNDED]: "bg-emerald-500/10 text-emerald-700",
  [RentalStatus.COMPLETED]: "bg-emerald-500/10 text-emerald-700",
  [RentalStatus.CANCELLED]: "bg-rose-500/10 text-rose-700",
  [RentalStatus.OVERDUE]: "bg-rose-500/10 text-rose-700",
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
  }).format(new Date(value))

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate()

const isDateInRange = (date: Date, start: string, end: string) => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  startDate.setHours(0, 0, 0, 0)
  endDate.setHours(23, 59, 59, 999)
  return date >= startDate && date <= endDate
}

export function CalendarSectionNew() {
  const [items, setItems] = useState<RentalCalendarItem[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadCalendar() {
      try {
        const response = await fetch("/api/seller/rental-calendar")
        const json = await response.json()
        if (!response.ok)
          throw new Error(json.error ?? "Không thể lấy lịch thuê")
        setItems(json.data)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      } finally {
        setIsLoading(false)
      }
    }

    const timeoutId = window.setTimeout(() => {
      void loadCalendar()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [])

  const highlightedDays = useMemo(() => {
    const days: Date[] = []
    for (const item of items) {
      days.push(new Date(item.startDate))
      days.push(new Date(item.endDate))
    }
    return days
  }, [items])

  const visibleItems = useMemo(() => {
    if (!selectedDate) return items
    return items.filter((item) =>
      isDateInRange(selectedDate, item.startDate, item.endDate)
    )
  }, [items, selectedDate])

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <Skeleton className="h-[520px] rounded-xl" />
        <Skeleton className="h-[360px] rounded-xl" />
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Lịch trình giao/nhận</CardTitle>
          <p className="text-sm text-muted-foreground">
            Dữ liệu từ đơn thuê, chỉ hiển thị để theo dõi lịch vận hành
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {visibleItems.length === 0 ? (
              <div className="rounded-lg border border-border/60 p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Không có đơn thuê trong ngày đã chọn
                </p>
              </div>
            ) : (
              visibleItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border/60 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{item.product.name}</p>
                      <Badge
                        variant="secondary"
                        className={statusClasses[item.status]}
                      >
                        {item.statusLabel}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.customer.name} · {item.customer.phone ?? "-"} ·{" "}
                      {item.orderNumber}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Phí thuê {formatCurrency(item.rentalFee)} · Cọc{" "}
                      {formatCurrency(item.depositAmount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatDate(item.startDate)} - {formatDate(item.endDate)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.totalDays} ngày
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Lịch</CardTitle>
          <p className="text-sm text-muted-foreground">
            Chọn ngày để lọc đơn thuê
          </p>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{
              booked: (date) =>
                highlightedDays.some((day) => isSameDay(day, date)),
            }}
            modifiersClassNames={{
              booked:
                "bg-primary/10 text-primary font-semibold hover:bg-primary/20",
            }}
            className="rounded-md border"
          />
        </CardContent>
      </Card>
    </div>
  )
}

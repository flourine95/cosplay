"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { Skeleton } from "@/components/ui/skeleton"
import { CalendarOrderList } from "./calendar-order-list"
import { CalendarPickerCard } from "./calendar-picker-card"
import { isDateInRange } from "./calendar-utils"
import type {
  RentalCalendarItem,
  RentalCalendarResponse,
} from "./calendar-types"

const emptyItems: RentalCalendarItem[] = []

export function RentalCalendarClient() {
  const [items, setItems] = useState<RentalCalendarItem[]>(emptyItems)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadCalendar() {
      try {
        const response = await fetch("/api/seller/rental-calendar")
        const json = (await response.json()) as RentalCalendarResponse & {
          error?: string
        }
        if (!response.ok) {
          throw new Error(json.error ?? "Không thể lấy lịch thuê")
        }
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

  const bookedDays = useMemo(() => {
    const days: Date[] = []
    for (const item of items) {
      days.push(new Date(item.startDate), new Date(item.endDate))
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
      <CalendarOrderList items={visibleItems} />
      <CalendarPickerCard
        bookedDays={bookedDays}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
    </div>
  )
}

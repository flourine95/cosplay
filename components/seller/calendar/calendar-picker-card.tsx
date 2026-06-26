import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { isSameCalendarDay } from "./calendar-utils"

export function CalendarPickerCard({
  bookedDays,
  selectedDate,
  onSelectDate,
}: {
  bookedDays: Date[]
  selectedDate: Date | undefined
  onSelectDate: (date: Date | undefined) => void
}) {
  return (
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
          onSelect={onSelectDate}
          modifiers={{
            booked: (date) =>
              bookedDays.some((day) => isSameCalendarDay(day, date)),
          }}
          modifiersClassNames={{
            booked:
              "bg-primary/10 text-primary font-semibold hover:bg-primary/20",
          }}
          className="rounded-md border"
        />
      </CardContent>
    </Card>
  )
}

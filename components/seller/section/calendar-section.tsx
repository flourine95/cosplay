import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { rentalSchedules } from "../seller-data"

export function CalendarSectionNew() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Lịch trình giao/nhận</CardTitle>
          <p className="text-sm text-muted-foreground">
            Theo dõi lịch giao hàng, nhận trả và bảo trì
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rentalSchedules.map((schedule, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-border/60 p-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{schedule.title}</p>
                    <Badge variant="secondary">{schedule.type}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {schedule.customer} · {schedule.time}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{schedule.date}</p>
                  <Badge variant="secondary" className="mt-1">
                    {schedule.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Lịch</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar mode="single" className="rounded-md border" />
        </CardContent>
      </Card>
    </div>
  )
}

import { Users } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"
import { StatisticsEmpty } from "./statistics-empty"
import type { StatisticsData } from "./statistics-types"

export function TopCustomersCard({
  customers,
}: {
  customers: StatisticsData["topCustomers"]
}) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-muted p-2">
            <Users className="size-4 text-muted-foreground" />
          </div>
          <div>
            <CardTitle>Khách hàng thân thiết</CardTitle>
            <p className="text-sm text-muted-foreground">
              Khách chi tiêu nhiều nhất.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {customers.length === 0 ? (
          <StatisticsEmpty text="Chưa có dữ liệu khách hàng." />
        ) : (
          customers.map((customer, index) => (
            <div
              key={customer.name}
              className="flex items-center gap-4 rounded-lg border border-border/60 p-4"
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-bold">
                {index + 1}
              </div>
              <Avatar className="size-10">
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
  )
}

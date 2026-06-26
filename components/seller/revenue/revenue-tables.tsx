import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "@/lib/format"
import { formatRevenueDate } from "./revenue-utils"
import type { RevenueData } from "./revenue-types"

export function MonthlyRevenueTable({
  rows,
}: {
  rows: RevenueData["monthlyRevenue"]
}) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>Doanh thu theo tháng</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tháng</TableHead>
                <TableHead>Doanh thu</TableHead>
                <TableHead>Đơn hàng</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.month}>
                  <TableCell>{row.month}</TableCell>
                  <TableCell>{formatCurrency(row.revenue)}</TableCell>
                  <TableCell>{row.orders} đơn</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export function RevenueTransactionTable({
  transactions,
}: {
  transactions: RevenueData["transactions"]
}) {
  return (
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
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    Chưa có giao dịch.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell>
                      <p className="font-medium">{txn.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {txn.customer} · {formatRevenueDate(txn.date)}
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
  )
}

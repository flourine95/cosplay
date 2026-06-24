"use client"

import { useState } from "react"
import { CheckCircle, Clock, Receipt } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type InvoiceRow = {
  id: string
  seller: string
  period: string
  revenue: number
  platformFee: number
  netAmount: number
  status: "PAID" | "PENDING"
  issuedAt: Date
}

interface InvoiceManagementProps {
  invoices: InvoiceRow[]
}

const formatCurrency = (value: number): string =>
  `${value.toLocaleString("vi-VN")}đ`

const formatDate = (value: Date): string =>
  new Intl.DateTimeFormat("vi-VN").format(value)

export default function InvoiceManagement({
  invoices,
}: InvoiceManagementProps) {
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredInvoices =
    filterStatus === "all"
      ? invoices
      : invoices.filter((invoice) => invoice.status === filterStatus)

  const paidCount = invoices.filter(
    (invoice) => invoice.status === "PAID"
  ).length
  const pendingCount = invoices.length - paidCount

  const stats = [
    { label: "Tổng hóa đơn", value: invoices.length, icon: Receipt },
    { label: "Đã thanh toán", value: paidCount, icon: CheckCircle },
    { label: "Chờ thanh toán", value: pendingCount, icon: Clock },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Quản lý hóa đơn</h1>
        <p className="text-sm text-muted-foreground">
          Theo dõi hóa đơn đối soát, phí nền tảng và số tiền cần trả seller.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="border-border/60">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div className="rounded-full bg-muted p-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex items-center gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[190px]">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="PAID">Đã thanh toán</SelectItem>
            <SelectItem value="PENDING">Chờ thanh toán</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {filteredInvoices.length} hóa đơn
        </span>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã hóa đơn</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Kỳ đối soát</TableHead>
                <TableHead>Doanh thu</TableHead>
                <TableHead>Phí nền tảng</TableHead>
                <TableHead>Thực trả</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày xuất</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Chưa có hóa đơn phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-semibold text-foreground">
                      {invoice.id}
                    </TableCell>
                    <TableCell>{invoice.seller}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {invoice.period}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {formatCurrency(invoice.revenue)}
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      {formatCurrency(invoice.platformFee)}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {formatCurrency(invoice.netAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          invoice.status === "PAID" ? "default" : "secondary"
                        }
                      >
                        {invoice.status === "PAID"
                          ? "Đã thanh toán"
                          : "Chờ thanh toán"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(invoice.issuedAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

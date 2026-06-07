"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Receipt,
  CheckCircle,
  Clock,
  Download,
  MoreHorizontal,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const stats = [
  { label: "Tổng hóa đơn", value: "2,456", icon: Receipt },
  { label: "Đã thanh toán", value: "2,398", icon: CheckCircle },
  { label: "Chờ thanh toán", value: "58", icon: Clock },
]

const invoices = [
  {
    id: "INV-001",
    seller: "Cosplay Wonderland",
    amount: "5.200.000đ",
    fee: "520.000đ",
    status: "Paid",
    date: "15/04/2026",
    period: "Tháng 3/2026",
  },
  {
    id: "INV-002",
    seller: "Kimono House",
    amount: "3.800.000đ",
    fee: "380.000đ",
    status: "Pending",
    date: "15/04/2026",
    period: "Tháng 3/2026",
  },
  {
    id: "INV-003",
    seller: "Props Master Tech",
    amount: "8.900.000đ",
    fee: "890.000đ",
    status: "Paid",
    date: "15/04/2026",
    period: "Tháng 3/2026",
  },
]

export default function InvoiceManagement() {
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredInvoices =
    filterStatus === "all"
      ? invoices
      : invoices.filter((i) => i.status.toLowerCase() === filterStatus)

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Quản lý Hóa đơn
          </h1>
          <p className="text-sm text-muted-foreground">
            Theo dõi hóa đơn và phí sàn từ sellers
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Xuất báo cáo
        </Button>
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
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="paid">Đã thanh toán</SelectItem>
            <SelectItem value="pending">Chờ thanh toán</SelectItem>
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
                <TableHead>Kỳ thanh toán</TableHead>
                <TableHead>Doanh thu</TableHead>
                <TableHead>Phí sàn (10%)</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày xuất</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-semibold text-foreground">
                    {invoice.id}
                  </TableCell>
                  <TableCell>{invoice.seller}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {invoice.period}
                  </TableCell>
                  <TableCell className="font-semibold text-foreground">
                    {invoice.amount}
                  </TableCell>
                  <TableCell className="font-semibold text-primary">
                    {invoice.fee}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        invoice.status === "Paid" ? "default" : "secondary"
                      }
                    >
                      {invoice.status === "Paid"
                        ? "Đã thanh toán"
                        : "Chờ thanh toán"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {invoice.date}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                        <DropdownMenuItem>Tải PDF</DropdownMenuItem>
                        {invoice.status === "Pending" && (
                          <DropdownMenuItem>
                            Xác nhận thanh toán
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

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
import { Percent, TrendingUp, DollarSign, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const stats = [
  { label: "Phí sàn hiện tại", value: "10%", icon: Percent },
  { label: "Tổng phí thu được", value: "45.2M", icon: DollarSign },
  { label: "Tăng trưởng", value: "+12.5%", icon: TrendingUp },
]

const feeHistory = [
  {
    id: "FEE-001",
    type: "Đơn thuê",
    rate: "10%",
    effectiveDate: "01/01/2026",
    status: "Active",
  },
  {
    id: "FEE-002",
    type: "Đơn đặt may",
    rate: "10%",
    effectiveDate: "01/01/2026",
    status: "Active",
  },
  {
    id: "FEE-003",
    type: "Đơn bán đứt",
    rate: "8%",
    effectiveDate: "01/01/2026",
    status: "Active",
  },
]

export default function FeeManagement() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Quản lý Phí sàn
          </h1>
          <p className="text-sm text-muted-foreground">
            Cấu hình và theo dõi phí sàn từ giao dịch
          </p>
        </div>
        <Button>Cập nhật phí sàn</Button>
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

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Cấu hình phí theo loại giao dịch</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loại giao dịch</TableHead>
                <TableHead>Tỷ lệ phí</TableHead>
                <TableHead>Ngày áp dụng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feeHistory.map((fee) => (
                <TableRow key={fee.id}>
                  <TableCell className="font-semibold text-foreground">
                    {fee.type}
                  </TableCell>
                  <TableCell className="text-lg font-bold text-primary">
                    {fee.rate}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {fee.effectiveDate}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">{fee.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Chỉnh sửa tỷ lệ</DropdownMenuItem>
                        <DropdownMenuItem>Xem lịch sử</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Thông tin phí sàn</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <p className="font-semibold text-foreground">
                Tổng phí thu được tháng này
              </p>
              <p className="text-sm text-muted-foreground">
                Từ tất cả các giao dịch
              </p>
            </div>
            <p className="text-2xl font-bold text-foreground">12.850.000đ</p>
          </div>
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <p className="font-semibold text-foreground">Số dư khả dụng</p>
              <p className="text-sm text-muted-foreground">
                Có thể rút về tài khoản
              </p>
            </div>
            <p className="text-2xl font-bold text-primary">45.200.000đ</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">
                Tăng trưởng so với tháng trước
              </p>
              <p className="text-sm text-muted-foreground">
                Phần trăm tăng/giảm
              </p>
            </div>
            <p className="text-2xl font-bold text-emerald-600">+12.5%</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

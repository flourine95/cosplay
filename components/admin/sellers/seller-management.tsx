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
  Store,
  TrendingUp,
  AlertCircle,
  UserPlus,
  MoreHorizontal,
  Star,
  CheckCircle,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { sellers } from "./seller.data"

// Stats
const stats = [
  { label: "Tổng seller", value: "156", icon: Store },
  { label: "Seller mới", value: "+12", icon: TrendingUp },
  { label: "Chờ duyệt", value: "8", icon: AlertCircle },
]

export default function SellerManagement() {
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredSellers =
    filterStatus === "all"
      ? sellers
      : sellers.filter((s) => s.status.toLowerCase() === filterStatus)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Seller</h1>
          <p className="text-sm text-muted-foreground">
            Xem danh sách, duyệt và quản lý các cửa hàng
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Thêm Seller mới
        </Button>
      </div>

      {/* Stats */}
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

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {filteredSellers.length} sellers
        </span>
      </div>

      {/* Table */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cửa hàng</TableHead>
                <TableHead>Chủ shop</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Đánh giá</TableHead>
                <TableHead className="text-center">Sản phẩm</TableHead>
                <TableHead>Doanh thu</TableHead>
                <TableHead>Ngày tham gia</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSellers.map((seller) => (
                <TableRow key={seller.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-semibold text-foreground">
                          {seller.shopName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {seller.id}
                        </p>
                      </div>
                      {seller.verified && (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">
                        {seller.owner}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {seller.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        seller.status === "Active"
                          ? "default"
                          : seller.status === "Pending"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {seller.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {seller.rating > 0 ? (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="font-semibold text-foreground">
                          {seller.rating}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Chưa có
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {seller.products}
                  </TableCell>
                  <TableCell className="font-semibold text-foreground">
                    {seller.revenue}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {seller.joinDate}
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
                        <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                        {seller.status === "Pending" && (
                          <DropdownMenuItem>Duyệt seller</DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive">
                          {seller.status === "Suspended"
                            ? "Mở khóa"
                            : "Tạm khóa"}
                        </DropdownMenuItem>
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

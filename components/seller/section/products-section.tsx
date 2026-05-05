"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Plus, ArrowUpDown, MoreHorizontal } from "lucide-react"
import { sellerProducts } from "../seller-data"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type SortType = "none" | "asc" | "desc"

export function ProductsSectionNew() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [sortField, setSortField] = useState<"name" | null>(null)
  const [sortType, setSortType] = useState<SortType>("none")
  const [deleteProduct, setDeleteProduct] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let result = [...sellerProducts]
    if (statusFilter) {
      result = result.filter((p) => p.status === statusFilter)
    }
    return result
  }, [statusFilter])

  const sorted = useMemo(() => {
    if (sortType === "none" || !sortField) return filtered
    const result = [...filtered]
    if (sortField === "name") {
      result.sort((a, b) =>
        sortType === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      )
    }
    return result
  }, [filtered, sortField, sortType])

  const toggleSort = (field: "name") => {
    if (sortField === field) {
      setSortType(
        sortType === "none" ? "asc" : sortType === "asc" ? "desc" : "none"
      )
    } else {
      setSortField(field)
      setSortType("asc")
    }
  }

  const uniqueStatuses = Array.from(
    new Set(sellerProducts.map((p) => p.status))
  )

  // Calculate stats
  const totalProducts = sellerProducts.length
  const activeProducts = sellerProducts.filter(
    (p) => p.status === "Hoạt động"
  ).length
  const totalStock = sellerProducts.reduce(
    (sum, p) => sum + (typeof p.stock === "number" ? p.stock : 0),
    0
  )
  const totalRented = sellerProducts.reduce((sum, p) => sum + p.rented, 0)

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng sản phẩm
            </CardTitle>
            <div className="rounded-full bg-muted p-2">
              <Plus className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {totalProducts}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {activeProducts} đang hoạt động
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tồn kho
            </CardTitle>
            <div className="rounded-full bg-muted p-2">
              <Plus className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {totalStock}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Sản phẩm có sẵn
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đang cho thuê
            </CardTitle>
            <div className="rounded-full bg-muted p-2">
              <Plus className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {totalRented}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Sản phẩm đang thuê
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tỷ lệ cho thuê
            </CardTitle>
            <div className="rounded-full bg-muted p-2">
              <Plus className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {totalStock > 0
                ? Math.round((totalRented / totalStock) * 100)
                : 0}
              %
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Hiệu suất cho thuê
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Danh sách sản phẩm</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Quản lý tồn kho, mô hình kinh doanh và trạng thái hiển thị
              </p>
            </div>
            <Button asChild>
              <Link href="/seller/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Thêm sản phẩm
              </Link>
            </Button>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2 pt-4">
            <Button
              variant={statusFilter === null ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(null)}
            >
              Tất cả ({sellerProducts.length})
            </Button>
            {uniqueStatuses.map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status} (
                {sellerProducts.filter((p) => p.status === status).length})
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSort("name")}
                      className="h-8 gap-1"
                    >
                      Sản phẩm
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Phân loại</TableHead>
                  <TableHead className="text-center">Kho</TableHead>
                  <TableHead className="text-center">Đang thuê</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <p className="text-sm text-muted-foreground">
                        Không tìm thấy sản phẩm nào
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  sorted.map((product) => (
                    <TableRow key={product.sku}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-muted">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              SKU: {product.sku} · {product.category}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {product.businessTypes.map((type: string) => (
                            <Badge
                              key={type}
                              variant="secondary"
                              className="text-xs"
                            >
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold">{product.stock}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold text-primary">
                          {product.rented > 0 ? product.rented : "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">
                          {product.basePrice}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/products/${product.sku}`}>
                                Xem sản phẩm
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/seller/products/edit/${product.sku}`}
                              >
                                Chỉnh sửa
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteProduct(product.sku)}
                            >
                              Xóa sản phẩm
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteProduct}
        onOpenChange={() => setDeleteProduct(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa sản phẩm?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa sản phẩm này? Hành động này không thể hoàn
              tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                // Handle delete logic here
                console.log("Deleting product:", deleteProduct)
                setDeleteProduct(null)
              }}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

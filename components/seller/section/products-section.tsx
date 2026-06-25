"use client"

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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ProductStatus, ProductType } from "@/app/generated/prisma/enums"
import {
  ArrowUpDown,
  Boxes,
  MoreHorizontal,
  PackageCheck,
  Plus,
  Shirt,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import type React from "react"
import { toast } from "sonner"

type SortType = "none" | "asc" | "desc"

type Product = {
  id: number
  slug: string
  name: string
  sku: string | null
  categoryName: string
  type: ProductType
  businessTypes: string[]
  status: ProductStatus
  price: number
  image: string | null
  totalStock: number
  rented: number
  rental: { pricePerDay: number } | null
}

type ProductsResponse = {
  products: Product[]
  stats: {
    total: number
    active: number
    totalStock: number
    rented: number
  }
}

const emptyProducts: Product[] = []

const statusLabels: Record<ProductStatus, string> = {
  [ProductStatus.DRAFT]: "Nháp",
  [ProductStatus.ACTIVE]: "Hoạt động",
  [ProductStatus.OUT_OF_STOCK]: "Hết hàng",
  [ProductStatus.DISCONTINUED]: "Ngừng kinh doanh",
}

const statusClasses: Record<ProductStatus, string> = {
  [ProductStatus.DRAFT]: "bg-slate-100 text-slate-700",
  [ProductStatus.ACTIVE]: "bg-emerald-500/10 text-emerald-700",
  [ProductStatus.OUT_OF_STOCK]: "bg-amber-500/10 text-amber-700",
  [ProductStatus.DISCONTINUED]: "bg-rose-500/10 text-rose-700",
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)

function formatPrice(product: Product) {
  if (product.type === ProductType.RENTAL) {
    return product.rental
      ? `${formatCurrency(product.rental.pricePerDay)}/ngày`
      : "-"
  }
  if (product.type === ProductType.BOTH && product.rental) {
    return `${formatCurrency(product.price)} | ${formatCurrency(product.rental.pricePerDay)}/ngày`
  }
  return formatCurrency(product.price)
}

export function ProductsSectionNew() {
  const [statusFilter, setStatusFilter] = useState<ProductStatus | null>(null)
  const [sortField, setSortField] = useState<"name" | null>(null)
  const [sortType, setSortType] = useState<SortType>("none")
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)
  const [data, setData] = useState<ProductsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  async function loadProducts() {
    try {
      const response = await fetch("/api/seller/products")
      const json = await response.json()
      if (!response.ok) {
        throw new Error(json.error ?? "Không thể lấy danh sách sản phẩm")
      }
      setData(json.data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadProducts()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [])

  const products = data?.products ?? emptyProducts
  const stats = data?.stats ?? {
    total: 0,
    active: 0,
    totalStock: 0,
    rented: 0,
  }

  const filtered = useMemo(() => {
    if (!statusFilter) return products
    return products.filter((product) => product.status === statusFilter)
  }, [products, statusFilter])

  const sorted = useMemo(() => {
    if (sortType === "none" || !sortField) return filtered
    const result = [...filtered]
    result.sort((a, b) =>
      sortType === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    )
    return result
  }, [filtered, sortField, sortType])

  const uniqueStatuses = Array.from(
    new Set(products.map((product) => product.status))
  )

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

  async function confirmDelete() {
    if (!deleteProduct) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/seller/products/${deleteProduct.id}`, {
        method: "DELETE",
      })
      const json = await response.json()
      if (!response.ok) throw new Error(json.error ?? "Không thể xóa sản phẩm")

      toast.success(json.message ?? "Đã xóa sản phẩm")
      setDeleteProduct(null)
      await loadProducts()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xóa")
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Shirt}
          label="Tổng sản phẩm"
          note={`${stats.active} đang hoạt động`}
          value={stats.total}
        />
        <StatCard
          icon={Boxes}
          label="Tồn kho"
          note="Tổng tồn theo size"
          value={stats.totalStock}
        />
        <StatCard
          icon={PackageCheck}
          label="Đang cho thuê"
          note="Đồ đang ở ngoài"
          value={stats.rented}
        />
        <StatCard
          icon={ArrowUpDown}
          label="Tỷ lệ cho thuê"
          note="Trên tổng tồn kho"
          value={
            stats.totalStock > 0
              ? `${Math.round((stats.rented / stats.totalStock) * 100)}%`
              : "0%"
          }
        />
      </div>

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

          <div className="flex flex-wrap gap-2 pt-4">
            <Button
              variant={statusFilter === null ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(null)}
            >
              Tất cả ({products.length})
            </Button>
            {uniqueStatuses.map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {statusLabels[status]} (
                {products.filter((product) => product.status === status).length}
                )
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
                  <TableHead className="w-[50px]" />
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
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-muted">
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <Shirt className="absolute inset-3 h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              SKU: {product.sku || "-"} · {product.categoryName}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {product.businessTypes.map((type) => (
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
                        <span className="font-semibold">
                          {product.totalStock}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold text-primary">
                          {product.rented > 0 ? product.rented : "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">
                          {formatPrice(product)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={statusClasses[product.status]}
                        >
                          {statusLabels[product.status]}
                        </Badge>
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
                              <Link href={`/products/${product.slug}`}>
                                Xem sản phẩm
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/seller/products/edit/${product.id}`}
                              >
                                Chỉnh sửa
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteProduct(product)}
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

      <AlertDialog
        open={!!deleteProduct}
        onOpenChange={(open) => {
          if (!open) setDeleteProduct(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa sản phẩm?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa sản phẩm này? Nếu sản phẩm đã có đơn hàng, hệ
              thống sẽ chuyển sang trạng thái ngừng kinh doanh.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={confirmDelete}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  note,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  note: string
  value: number | string
}) {
  return (
    <Card className="border-border/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <div className="rounded-full bg-muted p-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  )
}

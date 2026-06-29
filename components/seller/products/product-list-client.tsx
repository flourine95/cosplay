"use client"

import Link from "next/link"
import { AlertCircle, Plus, Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { ProductStatus, ProductType } from "@/app/generated/prisma/enums"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import {
  productStatusLabels,
  productTypeLabels,
  sellerProductRoutes,
} from "./product-constants"
import { ProductDeleteDialog } from "./product-delete-dialog"
import { ProductStats } from "./product-stats"
import { ProductTable } from "./product-table"
import type {
  ProductSortField,
  ProductStatusFilter,
  ProductTypeFilter,
  SellerProductListItem,
  SellerProductsResponse,
  SortDirection,
} from "./product-types"

const emptyProducts: SellerProductListItem[] = []
const emptyStats: SellerProductsResponse["stats"] = {
  total: 0,
  active: 0,
  totalStock: 0,
  rented: 0,
}
const emptyProfileCompletion = {
  isComplete: true,
  missingFields: [] as string[],
}

const statusFilters: Array<{ label: string; value: ProductStatusFilter }> = [
  { label: "Tất cả", value: "all" },
  {
    label: productStatusLabels[ProductStatus.ACTIVE],
    value: ProductStatus.ACTIVE,
  },
  {
    label: productStatusLabels[ProductStatus.DRAFT],
    value: ProductStatus.DRAFT,
  },
  {
    label: productStatusLabels[ProductStatus.OUT_OF_STOCK],
    value: ProductStatus.OUT_OF_STOCK,
  },
]

const typeFilters: Array<{ label: string; value: ProductTypeFilter }> = [
  { label: "Mọi mô hình", value: "all" },
  { label: productTypeLabels[ProductType.SALE], value: ProductType.SALE },
  { label: productTypeLabels[ProductType.RENTAL], value: ProductType.RENTAL },
  { label: productTypeLabels[ProductType.BOTH], value: ProductType.BOTH },
]

export function ProductListClient() {
  const [data, setData] = useState<SellerProductsResponse | null>(null)
  const [deleteProduct, setDeleteProduct] =
    useState<SellerProductListItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [sortField, setSortField] = useState<ProductSortField>("name")
  const [statusFilter, setStatusFilter] = useState<ProductStatusFilter>("all")
  const [typeFilter, setTypeFilter] = useState<ProductTypeFilter>("all")

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
  const stats = data?.stats ?? emptyStats
  const profileCompletion = data?.profileCompletion ?? emptyProfileCompletion
  const normalizedQuery = query.trim().toLowerCase()

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesQuery =
        !normalizedQuery ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.categoryName.toLowerCase().includes(normalizedQuery) ||
        product.sku?.toLowerCase().includes(normalizedQuery)

      const matchesStatus =
        statusFilter === "all" || product.status === statusFilter
      const matchesType = typeFilter === "all" || product.type === typeFilter

      return matchesQuery && matchesStatus && matchesType
    })
  }, [normalizedQuery, products, statusFilter, typeFilter])

  const sortedProducts = useMemo(() => {
    const result = [...filteredProducts]
    result.sort((a, b) => {
      const statusPriority = (status: ProductStatus) =>
        status === ProductStatus.ACTIVE ? 0 : 1
      const statusDiff = statusPriority(a.status) - statusPriority(b.status)
      if (statusDiff !== 0) return statusDiff

      const direction = sortDirection === "asc" ? 1 : -1
      if (sortField === "stock") {
        return (a.totalStock - b.totalStock) * direction
      }
      if (sortField === "rented") {
        return (a.rented - b.rented) * direction
      }
      return a.name.localeCompare(b.name, "vi") * direction
    })
    return result
  }, [filteredProducts, sortDirection, sortField])

  const hasFilters =
    query.trim().length > 0 || statusFilter !== "all" || typeFilter !== "all"

  function handleClearFilters() {
    setQuery("")
    setStatusFilter("all")
    setTypeFilter("all")
  }

  function handleSort(field: ProductSortField) {
    if (sortField === field) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"))
      return
    }

    setSortField(field)
    setSortDirection("asc")
  }

  async function handleConfirmDelete() {
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
    return <ProductListSkeleton />
  }

  return (
    <div className="flex flex-col gap-6">
      <ProductStats products={products} stats={stats} />

      {!profileCompletion.isComplete && (
        <Card className="border-amber-300 bg-amber-50 text-amber-950">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">
                  Cần cập nhật đầy đủ hồ sơ seller trước khi đăng bán.
                </p>
                <p className="mt-1 text-sm">
                  Còn thiếu: {profileCompletion.missingFields.join(", ")}.
                </p>
              </div>
            </div>
            <Button asChild variant="outline" className="shrink-0 bg-white">
              <Link href="/seller/profile">Cập nhật hồ sơ</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/80 bg-card">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle>Kho sản phẩm</CardTitle>
              <CardDescription>
                Theo dõi ảnh, tồn kho, mô hình bán/thuê và listing cần xử lý.
              </CardDescription>
            </div>
            {profileCompletion.isComplete ? (
              <Button asChild>
                <Link href={sellerProductRoutes.new}>
                  <Plus data-icon="inline-start" />
                  Thêm sản phẩm
                </Link>
              </Button>
            ) : (
              <Button
                type="button"
                disabled
                title="Cập nhật hồ sơ seller trước khi thêm sản phẩm"
              >
                <Plus data-icon="inline-start" />
                Thêm sản phẩm
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ProductToolbar
            query={query}
            statusFilter={statusFilter}
            typeFilter={typeFilter}
            onClearFilters={handleClearFilters}
            onQueryChange={setQuery}
            onStatusFilterChange={setStatusFilter}
            onTypeFilterChange={setTypeFilter}
          />
          <ProductTable
            products={sortedProducts}
            hasFilters={hasFilters}
            sortField={sortField}
            sortDirection={sortDirection}
            onClearFilters={handleClearFilters}
            onDeleteProduct={setDeleteProduct}
            onSort={handleSort}
          />
        </CardContent>
      </Card>

      <ProductDeleteDialog
        product={deleteProduct}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onOpenChange={(open) => {
          if (!open) setDeleteProduct(null)
        }}
      />
    </div>
  )
}

function ProductToolbar({
  onClearFilters,
  onQueryChange,
  onStatusFilterChange,
  onTypeFilterChange,
  query,
  statusFilter,
  typeFilter,
}: {
  query: string
  statusFilter: ProductStatusFilter
  typeFilter: ProductTypeFilter
  onClearFilters: () => void
  onQueryChange: (value: string) => void
  onStatusFilterChange: (value: ProductStatusFilter) => void
  onTypeFilterChange: (value: ProductTypeFilter) => void
}) {
  const hasFilters =
    query.trim().length > 0 || statusFilter !== "all" || typeFilter !== "all"

  return (
    <div className="rounded-xl border border-border/70 bg-muted/25 p-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="relative w-full xl:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Tìm theo tên, SKU hoặc danh mục"
            className="bg-background pl-8"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <FilterGroup
            ariaLabel="Lọc theo trạng thái"
            value={statusFilter}
            options={statusFilters}
            onValueChange={(value) => {
              if (value) onStatusFilterChange(value as ProductStatusFilter)
            }}
          />
          <FilterGroup
            ariaLabel="Lọc theo mô hình kinh doanh"
            value={typeFilter}
            options={typeFilters}
            onValueChange={(value) => {
              if (value) onTypeFilterChange(value as ProductTypeFilter)
            }}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={onClearFilters}
          disabled={!hasFilters}
          className="self-start lg:self-auto"
        >
          Xóa lọc
        </Button>
      </div>
    </div>
  )
}

function FilterGroup<T extends string>({
  ariaLabel,
  onValueChange,
  options,
  value,
}: {
  ariaLabel: string
  value: T
  options: Array<{ label: string; value: T }>
  onValueChange: (value: string) => void
}) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={onValueChange}
      variant="outline"
      size="sm"
      className="max-w-full flex-wrap bg-background"
      aria-label={ariaLabel}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          className={cn(
            option.value === value && "bg-primary text-primary-foreground"
          )}
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

function ProductListSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  )
}

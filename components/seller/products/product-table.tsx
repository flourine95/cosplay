"use client"

import Image from "next/image"
import Link from "next/link"
import {
  ArrowUpDown,
  CalendarClock,
  Edit,
  MoreHorizontal,
  PackageX,
  SearchX,
  Shirt,
  Trash2,
} from "lucide-react"

import { ProductStatus, ProductType } from "@/app/generated/prisma/enums"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "@/lib/format"
import {
  productStatusLabels,
  productTypeLabels,
  sellerProductRoutes,
} from "./product-constants"
import type {
  ProductSortField,
  SellerProductListItem,
  SortDirection,
} from "./product-types"

type ProductTableProps = {
  products: SellerProductListItem[]
  hasFilters: boolean
  sortField: ProductSortField
  sortDirection: SortDirection
  onClearFilters: () => void
  onDeleteProduct: (product: SellerProductListItem) => void
  onSort: (field: ProductSortField) => void
}

export function ProductTable({
  hasFilters,
  onClearFilters,
  onDeleteProduct,
  onSort,
  products,
  sortDirection,
  sortField,
}: ProductTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border/60">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortButton
                active={sortField === "name"}
                direction={sortDirection}
                onClick={() => onSort("name")}
              >
                Sản phẩm
              </SortButton>
            </TableHead>
            <TableHead>Mô hình</TableHead>
            <TableHead>
              <SortButton
                active={sortField === "stock"}
                direction={sortDirection}
                onClick={() => onSort("stock")}
              >
                Kho
              </SortButton>
            </TableHead>
            <TableHead>
              <SortButton
                active={sortField === "rented"}
                direction={sortDirection}
                onClick={() => onSort("rented")}
              >
                Thuê
              </SortButton>
            </TableHead>
            <TableHead>Giá hiển thị</TableHead>
            <TableHead>Cần xử lý</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="w-[120px] text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8}>
                <ProductEmptyState
                  hasFilters={hasFilters}
                  onClearFilters={onClearFilters}
                />
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="min-w-[280px]">
                  <ProductIdentity product={product} />
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {product.businessTypes.map((type) => (
                      <Badge key={type} variant="secondary">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <StockSignal product={product} />
                </TableCell>
                <TableCell>
                  <RentalSignal product={product} />
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium">
                    {formatProductPrice(product)}
                  </span>
                </TableCell>
                <TableCell>
                  <ActionSignal product={product} />
                </TableCell>
                <TableCell>
                  <StatusBadge product={product} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/seller/products/edit/${product.id}`}>
                        <Edit data-icon="inline-start" />
                        Sửa
                      </Link>
                    </Button>
                    <ProductRowMenu
                      product={product}
                      onDeleteProduct={onDeleteProduct}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function ProductIdentity({ product }: { product: SellerProductListItem }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : (
          <Shirt className="absolute inset-3 size-6 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">{product.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          SKU: {product.sku || "-"} · {product.categoryName}
        </p>
      </div>
    </div>
  )
}

function ProductRowMenu({
  onDeleteProduct,
  product,
}: {
  product: SellerProductListItem
  onDeleteProduct: (product: SellerProductListItem) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Mở menu sản phẩm">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={`/products/${product.slug}`}>Xem trang khách</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/seller/calendar?product=${product.id}`}>
              Xem lịch thuê
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => onDeleteProduct(product)}
        >
          <Trash2 data-icon="inline-start" />
          Xóa sản phẩm
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ProductEmptyState({
  hasFilters,
  onClearFilters,
}: {
  hasFilters: boolean
  onClearFilters: () => void
}) {
  return (
    <Empty className="min-h-64 border-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {hasFilters ? <SearchX /> : <PackageX />}
        </EmptyMedia>
        <EmptyTitle>
          {hasFilters ? "Không có sản phẩm khớp bộ lọc" : "Chưa có sản phẩm"}
        </EmptyTitle>
        <EmptyDescription>
          {hasFilters
            ? "Xóa bộ lọc để xem lại toàn bộ kho sản phẩm của shop."
            : "Tạo sản phẩm đầu tiên với ảnh, size, tồn kho và cấu hình bán hoặc thuê."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {hasFilters ? (
          <Button type="button" variant="outline" onClick={onClearFilters}>
            Xóa bộ lọc
          </Button>
        ) : (
          <Button asChild>
            <Link href={sellerProductRoutes.new}>Thêm sản phẩm đầu tiên</Link>
          </Button>
        )}
      </EmptyContent>
    </Empty>
  )
}

function SortButton({
  active,
  children,
  direction,
  onClick,
}: {
  active: boolean
  children: React.ReactNode
  direction: SortDirection
  onClick: () => void
}) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} className="h-7 px-1.5">
      {children}
      <ArrowUpDown data-icon="inline-end" />
      {active && <span className="sr-only">Đang sắp xếp {direction}</span>}
    </Button>
  )
}

function StockSignal({ product }: { product: SellerProductListItem }) {
  if (product.totalStock === 0) {
    return <Badge variant="destructive">Hết hàng</Badge>
  }

  if (product.totalStock <= 2) {
    return <Badge variant="secondary">Còn {product.totalStock}</Badge>
  }

  return <span className="text-sm font-medium">{product.totalStock}</span>
}

function RentalSignal({ product }: { product: SellerProductListItem }) {
  if (product.type === ProductType.SALE) {
    return <span className="text-sm text-muted-foreground">Không thuê</span>
  }

  if (product.rented > 0) {
    return (
      <Badge variant="secondary">
        <CalendarClock data-icon="inline-start" />
        {product.rented} đang thuê
      </Badge>
    )
  }

  return <span className="text-sm text-muted-foreground">Đang trống</span>
}

function ActionSignal({ product }: { product: SellerProductListItem }) {
  if (!product.image) {
    return <Badge variant="outline">Thiếu ảnh</Badge>
  }

  if (product.status === ProductStatus.DRAFT) {
    return <Badge variant="outline">Cần xuất bản</Badge>
  }

  if (product.totalStock === 0) {
    return <Badge variant="outline">Cập nhật kho</Badge>
  }

  if (product.type !== ProductType.SALE && !product.rental) {
    return <Badge variant="outline">Thiếu cấu hình thuê</Badge>
  }

  return <span className="text-sm text-muted-foreground">Ổn định</span>
}

function StatusBadge({ product }: { product: SellerProductListItem }) {
  const variant =
    product.status === ProductStatus.ACTIVE
      ? "secondary"
      : product.status === ProductStatus.DISCONTINUED
        ? "destructive"
        : "outline"

  return <Badge variant={variant}>{productStatusLabels[product.status]}</Badge>
}

function formatProductPrice(product: SellerProductListItem) {
  if (product.type === ProductType.RENTAL) {
    return product.rental
      ? `${formatCurrency(product.rental.pricePerDay)}/ngày`
      : "-"
  }

  if (product.type === ProductType.BOTH && product.rental) {
    return `${formatCurrency(product.price)} · ${formatCurrency(
      product.rental.pricePerDay
    )}/ngày`
  }

  return productTypeLabels[product.type] === productTypeLabels[ProductType.SALE]
    ? formatCurrency(product.price)
    : "-"
}

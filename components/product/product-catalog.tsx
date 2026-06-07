"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Search,
  Star,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/products"

type SortOption = "popular" | "price-asc" | "price-desc" | "rating" | "newest"
type ServiceFilter = "all" | "buy" | "rent"

const ITEMS_PER_PAGE = 12

const sortLabels: Record<SortOption, string> = {
  popular: "Phổ biến nhất",
  newest: "Mới nhất",
  "price-asc": "Giá tăng dần",
  "price-desc": "Giá giảm dần",
  rating: "Đánh giá cao nhất",
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price)
}

// ── Sidebar filter panel ──────────────────────────────────────────────────────

function FilterSidebar({
  categories,
  selectedCategories,
  onCategoryToggle,
  serviceFilter,
  onServiceFilter,
  priceMin,
  priceMax,
  onPriceMinChange,
  onPriceMax,
  onReset,
  resultCount,
}: {
  categories: string[]
  selectedCategories: string[]
  onCategoryToggle: (c: string) => void
  serviceFilter: ServiceFilter
  onServiceFilter: (s: ServiceFilter) => void
  priceMin: number
  priceMax: number
  onPriceMinChange: (v: number) => void
  onPriceMax: (v: number) => void
  onReset: () => void
  resultCount: number
}) {
  const hasFilters =
    selectedCategories.length > 0 ||
    serviceFilter !== "all" ||
    priceMax < 2000000 ||
    priceMin > 200000

  return (
    <div className="flex flex-col gap-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Bộ lọc</span>
        {hasFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-3" />
            Xóa tất cả
          </button>
        )}
      </div>

      {/* Service type */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Hình thức
        </p>
        <div className="flex flex-col gap-0.5">
          {(
            [
              { value: "all", label: "Tất cả" },
              { value: "buy", label: "Mua ngay" },
              { value: "rent", label: "Thuê trang phục" },
            ] as { value: ServiceFilter; label: string }[]
          ).map((opt) => {
            const active = serviceFilter === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => onServiceFilter(opt.value)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    active
                      ? "border-primary bg-primary"
                      : "border-border bg-background"
                  )}
                >
                  {active && (
                    <span className="size-1.5 rounded-full bg-white" />
                  )}
                </span>
                <span
                  className={cn(
                    "text-sm",
                    active
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {opt.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border/60" />

      {/* Categories */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Danh mục
        </p>
        <div className="flex flex-col gap-0.5">
          {categories.map((cat) => {
            const active = selectedCategories.includes(cat)
            return (
              <button
                key={cat}
                onClick={() => onCategoryToggle(cat)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded border-2 transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background"
                  )}
                >
                  {active && (
                    <svg
                      width="9"
                      height="9"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  )}
                </span>
                <span
                  className={cn(
                    "text-sm",
                    active
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {cat}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border/60" />

      {/* Price range */}
      {/* Price range */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Khoảng giá
          </p>
          <span className="text-xs font-medium text-foreground">
            {Math.round(priceMin / 1000)}K –{" "}
            {priceMax >= 2000000 ? "2.000K" : `${Math.round(priceMax / 1000)}K`}
          </span>
        </div>
        <Slider
          min={200000}
          max={2000000}
          step={50000}
          value={[priceMin, priceMax]}
          onValueChange={([min, max]) => {
            onPriceMinChange(min ?? priceMin)
            onPriceMax(max ?? priceMax)
          }}
          className="w-full"
        />
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>200K</span>
          <span>2.000K</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border/60" />

      {/* Result count */}
      <p className="text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{resultCount}</span> sản
        phẩm
      </p>
    </div>
  )
}

// ── Product card ──────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col gap-2.5"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted">
        <Image
          src={product.images[0] ?? ""}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/65 via-black/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="w-full p-3">
            <div className="flex gap-1.5">
              <Link
                href={`/products/${product.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 rounded-full bg-primary py-2 text-center text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Mua ngay
              </Link>
              {product.canRent && (
                <Link
                  href={`/products/${product.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 rounded-full bg-white/20 py-2 text-center text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                >
                  Thuê
                </Link>
              )}
            </div>
          </div>
        </div>

        {product.badge && (
          <span className="absolute top-2.5 left-2.5 rounded-full border border-border/40 bg-background/90 px-2 py-0.5 text-[11px] font-semibold text-foreground backdrop-blur-sm">
            {product.badge}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-0.5">
        <p className="text-xs text-muted-foreground">{product.series}</p>
        <h3 className="text-sm leading-snug font-semibold text-foreground transition-colors group-hover:text-primary">
          {product.name}
        </h3>
        <div className="mt-0.5 flex items-center gap-1">
          <Star className="size-3 fill-amber-400 text-amber-400" />
          <span className="text-xs text-muted-foreground">
            {product.rating}{" "}
            <span className="text-muted-foreground/60">
              ({product.reviewCount})
            </span>
          </span>
        </div>
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <span className="text-sm font-bold text-foreground">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
        {product.canRent && product.rentPrice && (
          <p className="text-xs font-medium text-primary">
            Thuê từ {formatPrice(product.rentPrice)}/ngày
          </p>
        )}
      </div>
    </Link>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────

function Pagination({
  page,
  total,
  perPage,
  onChange,
}: {
  page: number
  total: number
  perPage: number
  onChange: (p: number) => void
}) {
  const totalPages = Math.ceil(total / perPage)
  if (totalPages <= 1) return null

  const pages: (number | "…")[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push("…")
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    )
      pages.push(i)
    if (page < totalPages - 2) pages.push("…")
    pages.push(totalPages)
  }

  return (
    <nav
      className="mt-10 flex items-center justify-center gap-1"
      aria-label="Phân trang"
    >
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:pointer-events-none disabled:opacity-35"
        aria-label="Trang trước"
      >
        <ChevronLeft className="size-4" />
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`ellipsis-${i}`}
            className="flex size-9 items-center justify-center text-sm text-muted-foreground"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={cn(
              "flex size-9 items-center justify-center rounded-lg border text-sm transition-colors",
              page === p
                ? "border-primary bg-primary font-bold text-primary-foreground"
                : "border-border font-medium text-foreground hover:border-foreground/30 hover:bg-muted"
            )}
            aria-current={page === p ? "page" : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:pointer-events-none disabled:opacity-35"
        aria-label="Trang sau"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  )
}

// ── Main catalog ──────────────────────────────────────────────────────────────

export function ProductCatalog({
  products,
  categories,
}: {
  products: Product[]
  categories: string[]
}) {
  const [query, setQuery] = useState("")
  const [serviceFilter, setServiceFilter] = useState<ServiceFilter>("all")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceMin, setPriceMin] = useState(200000)
  const [priceMax, setPriceMax] = useState(2000000)
  const [sort, setSort] = useState<SortOption>("popular")
  const [sortOpen, setSortOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  const goToPage = (p: number) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const toggleCategory = (cat: string) => {
    setPage(1)
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const resetFilters = () => {
    setSelectedCategories([])
    setServiceFilter("all")
    setPriceMin(200000)
    setPriceMax(2000000)
    setQuery("")
    setPage(1)
  }

  const filtered = useMemo(() => {
    let result = [...products]

    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.series.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
    }
    if (serviceFilter === "buy") result = result.filter((p) => p.price > 0)
    if (serviceFilter === "rent") result = result.filter((p) => p.canRent)
    if (selectedCategories.length > 0)
      result = result.filter((p) => selectedCategories.includes(p.category))
    result = result.filter((p) => p.price >= priceMin && p.price <= priceMax)

    switch (sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        result.sort((a, b) => b.price - a.price)
        break
      case "rating":
        result.sort((a, b) => b.rating - a.rating)
        break
      default:
        result.sort((a, b) => b.reviewCount - a.reviewCount)
    }

    return result
  }, [
    products,
    query,
    serviceFilter,
    selectedCategories,
    priceMin,
    priceMax,
    sort,
  ])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  const activeFilterCount =
    selectedCategories.length +
    (serviceFilter !== "all" ? 1 : 0) +
    (priceMax < 2000000 || priceMin > 200000 ? 1 : 0) +
    (query.trim() ? 1 : 0)

  const sidebarProps = {
    categories,
    selectedCategories,
    onCategoryToggle: toggleCategory,
    serviceFilter,
    onServiceFilter: (s: ServiceFilter) => {
      setServiceFilter(s)
      setPage(1)
    },
    priceMin,
    priceMax,
    onPriceMinChange: (v: number) => {
      setPriceMin(v)
      setPage(1)
    },
    onPriceMax: (v: number) => {
      setPriceMax(v)
      setPage(1)
    },
    onReset: resetFilters,
    resultCount: filtered.length,
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
      {/* ── Page header ── */}
      <div className="mb-8">
        <h1 className="text-[clamp(1.75rem,3.5vw,2.25rem)] font-extrabold tracking-tight text-foreground">
          Trang phục Cosplay
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Mua hoặc thuê trang phục chất lượng cao từ cộng đồng cosplay Việt Nam
        </p>
      </div>

      <div className="flex gap-8">
        {/* ── Sidebar — desktop ── */}
        <aside className="hidden w-52 shrink-0 lg:block">
          <div className="sticky top-24">
            <FilterSidebar {...sidebarProps} />
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="min-w-0 flex-1">
          {/* Search + toolbar */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm theo tên, series, nhân vật..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(1)
                }}
                className="h-10 w-full rounded-full border border-border bg-background pr-9 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("")
                    setPage(1)
                  }}
                  className="absolute top-1/2 right-3 flex size-4 -translate-y-1/2 items-center justify-center rounded-full bg-muted-foreground/20 text-muted-foreground transition-colors hover:bg-muted-foreground/30"
                  aria-label="Xóa tìm kiếm"
                >
                  <X className="size-2.5" />
                </button>
              )}
            </div>

            {/* Mobile filter button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted lg:hidden"
            >
              <SlidersHorizontal className="size-4" />
              Bộ lọc
              {activeFilterCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort */}
            <div className="relative shrink-0">
              <button
                onClick={() => setSortOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                {sortLabels[sort]}
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform",
                    sortOpen && "rotate-180"
                  )}
                />
              </button>
              {sortOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setSortOpen(false)}
                  />
                  <div className="absolute top-full right-0 z-20 mt-1.5 w-48 overflow-hidden rounded-xl border border-border bg-background shadow-lg">
                    {(Object.keys(sortLabels) as SortOption[]).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setSort(opt)
                          setSortOpen(false)
                          setPage(1)
                        }}
                        className={cn(
                          "w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted",
                          sort === opt
                            ? "font-semibold text-primary"
                            : "text-foreground"
                        )}
                      >
                        {sortLabels[opt]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Results count */}
          <p className="mb-5 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {filtered.length}
            </span>{" "}
            sản phẩm
            {totalPages > 1 && (
              <span>
                {" "}
                · Trang {page}/{totalPages}
              </span>
            )}
          </p>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-24 text-center">
              <p className="text-lg font-semibold text-foreground">
                Không tìm thấy sản phẩm
              </p>
              <p className="max-w-[28ch] text-sm text-muted-foreground">
                Thử thay đổi từ khóa hoặc bộ lọc để xem thêm kết quả.
              </p>
              <Button
                variant="outline"
                className="mt-2 rounded-full"
                onClick={resetFilters}
              >
                Xóa bộ lọc
              </Button>
            </div>
          )}

          {/* Product grid */}
          {paginated.length > 0 && (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">
              {paginated.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          <Pagination
            page={page}
            total={filtered.length}
            perPage={ITEMS_PER_PAGE}
            onChange={goToPage}
          />
        </div>
      </div>

      {/* Mobile filter sheet */}
      <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
        <SheetContent side="left" className="w-72 overflow-y-auto">
          <SheetTitle className="sr-only">Bộ lọc</SheetTitle>
          <div className="pt-2">
            <FilterSidebar {...sidebarProps} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

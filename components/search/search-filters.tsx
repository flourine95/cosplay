"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { categories } from "@/lib/products"

export function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get("category") || "all"
  const currentSort = searchParams.get("sort") || "relevant"
  const currentMinPrice = searchParams.get("minPrice") || ""
  const currentMaxPrice = searchParams.get("maxPrice") || ""

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    router.push(`/search?${params.toString()}`)
  }

  const handleResetFilters = () => {
    const query = searchParams.get("q")
    router.push(`/search?q=${query}`)
  }

  const hasActiveFilters =
    currentCategory !== "all" ||
    currentSort !== "relevant" ||
    currentMinPrice ||
    currentMaxPrice

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Sort */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground">
            Sắp xếp theo
          </label>
          <Select
            value={currentSort}
            onValueChange={(val) => updateFilter("sort", val)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevant">Liên quan nhất</SelectItem>
              <SelectItem value="price-asc">Giá: Thấp đến Cao</SelectItem>
              <SelectItem value="price-desc">Giá: Cao đến Thấp</SelectItem>
              <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
              <SelectItem value="newest">Mới nhất</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Category */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground">
            Danh mục
          </label>
          <Select
            value={currentCategory}
            onValueChange={(val) => updateFilter("category", val)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Price range - simplified to preset options */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground">
            Khoảng giá
          </label>
          <div className="space-y-2">
            {[
              { label: "Dưới 700.000₫", min: 0, max: 700000 },
              { label: "700.000₫ - 1.000.000₫", min: 700000, max: 1000000 },
              { label: "1.000.000₫ - 1.500.000₫", min: 1000000, max: 1500000 },
              { label: "Trên 1.500.000₫", min: 1500000, max: 99999999 },
            ].map((range) => (
              <button
                key={range.label}
                onClick={() => {
                  updateFilter("minPrice", range.min.toString())
                  updateFilter("maxPrice", range.max.toString())
                }}
                className={`w-full rounded-lg px-3 py-2 text-left transition-colors ${
                  currentMinPrice === range.min.toString() &&
                  currentMaxPrice === range.max.toString()
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reset button */}
        {hasActiveFilters && (
          <>
            <Separator />
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResetFilters}
            >
              Xóa tất cả bộ lọc
            </Button>
          </>
        )}
      </div>
    </Card>
  )
}

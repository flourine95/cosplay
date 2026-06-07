"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/products"

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price)
}

interface SearchResultsProps {
  products: Product[]
  query: string
}

export function SearchResults({ products, query }: SearchResultsProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg bg-muted/50 py-16">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">
            Không tìm thấy sản phẩm
          </p>
          <p className="text-sm text-muted-foreground">
            Không có kết quả tìm kiếm cho &quot;{query}&quot;
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <Link
          key={product.slug}
          href={`/products/${product.slug}`}
          className="group flex flex-col gap-3"
        >
          {/* Image with hover overlay */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
            <Image
              src={product.images[0] ?? ""}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />

            {/* Hover overlay with actions */}
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="flex flex-col gap-2 p-4">
                <Link href={`/products/${product.slug}`}>
                  <Button className="w-full rounded-full" size="sm">
                    <ShoppingCart className="mr-2 size-4" />
                    Xem chi tiết
                  </Button>
                </Link>
                <button
                  aria-label="Thêm vào yêu thích"
                  className="flex items-center justify-center gap-1.5 py-1 text-xs text-white/70 transition-colors hover:text-white"
                >
                  <Heart className="size-3.5" />
                  Lưu vào yêu thích
                </button>
              </div>
            </div>

            {/* Badge */}
            {product.badge && (
              <div className="absolute top-3 left-3">
                <Badge className="border-0 bg-card text-foreground shadow-sm">
                  {product.badge}
                </Badge>
              </div>
            )}
          </div>

          {/* Info below image */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-muted-foreground">
                  {product.series}
                </p>
                <h3 className="mt-0.5 line-clamp-2 font-semibold text-foreground">
                  {product.name}
                </h3>
              </div>
              <span className="shrink-0 pt-0.5 text-xs font-medium text-muted-foreground">
                ★ {product.rating}
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-base font-bold text-foreground">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            {product.canRent && product.rentPrice && (
              <p className="mt-0.5 text-xs text-primary">
                Thuê từ {formatPrice(product.rentPrice)}/ngày
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}

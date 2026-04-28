"use client"

import { useState } from "react"
import {
  ShoppingCart,
  Heart,
  Star,
  Truck,
  RotateCcw,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useCart } from "@/lib/cart-context"
import { toast } from "sonner"
import type { Product } from "@/lib/products"

type Mode = "buy" | "rent"

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price)
}

export function ProductInfo({ product }: { product: Product }) {
  const [mode, setMode] = useState<Mode>("buy")
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [rentDays, setRentDays] = useState(3)
  const { addItem } = useCart()

  const currentPrice =
    mode === "buy" ? product.price : (product.rentPrice ?? 0) * rentDays

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Vui lòng chọn size")
      return
    }

    addItem({
      productSlug: product.slug,
      productName: product.name,
      price: currentPrice,
      quantity: 1,
      size: selectedSize,
      type: mode,
      rentDays: mode === "rent" ? rentDays : undefined,
      image: product.images[0],
    })

    toast.success(
      mode === "buy"
        ? `${product.name} đã được thêm vào giỏ hàng`
        : `Đã đặt thuê ${product.name} trong ${rentDays} ngày`
    )

    // Reset form after adding
    setSelectedSize(null)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {product.series}
          </span>
          {product.badge && (
            <Badge className="border-0 bg-primary text-primary-foreground">
              {product.badge}
            </Badge>
          )}
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
          {product.name}
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5" aria-label={`${product.rating} sao`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "size-4",
                  i < Math.floor(product.rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-border"
                )}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-foreground">
            {product.rating}
          </span>
          <span className="text-sm text-muted-foreground">
            ({product.reviewCount} đánh giá)
          </span>
        </div>
      </div>

      <Separator />

      {/* Mode toggle — Mua / Thuê */}
      {product.canRent && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground">Hình thức</p>
          <div className="flex gap-2">
            <button
              onClick={() => setMode("buy")}
              className={cn(
                "flex-1 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all",
                mode === "buy"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50"
              )}
            >
              <div className="text-base font-bold">
                {formatPrice(product.price)}
              </div>
              <div className="text-xs font-normal opacity-70">
                Mua trực tiếp
              </div>
            </button>
            <button
              onClick={() => setMode("rent")}
              className={cn(
                "flex-1 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all",
                mode === "rent"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50"
              )}
            >
              <div className="text-base font-bold">
                {formatPrice(product.rentPrice ?? 0)}/ngày
              </div>
              <div className="text-xs font-normal opacity-70">
                Thuê trang phục
              </div>
            </button>
          </div>

          {/* Rent days selector */}
          {mode === "rent" && (
            <div className="flex flex-col gap-2 rounded-xl bg-muted/50 p-4">
              <p className="text-sm font-medium text-foreground">
                Số ngày thuê
              </p>
              <div className="flex gap-2">
                {[1, 3, 7, 14].map((d) => (
                  <button
                    key={d}
                    onClick={() => setRentDays(d)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-sm font-medium transition-all",
                      rentDays === d
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    {d} ngày
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Đặt cọc 30% ({formatPrice(currentPrice * 0.3)}) — thanh toán
                phần còn lại khi nhận
              </p>
            </div>
          )}
        </div>
      )}

      {/* Price display when no rent */}
      {!product.canRent && (
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-extrabold text-foreground">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-lg text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
          {product.originalPrice && (
            <Badge variant="secondary" className="text-xs">
              -{Math.round((1 - product.price / product.originalPrice) * 100)}%
            </Badge>
          )}
        </div>
      )}

      {/* Price summary for buy mode with original */}
      {product.canRent && mode === "buy" && product.originalPrice && (
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-extrabold text-foreground">
            {formatPrice(product.price)}
          </span>
          <span className="text-base text-muted-foreground line-through">
            {formatPrice(product.originalPrice)}
          </span>
          <Badge variant="secondary" className="text-xs">
            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
          </Badge>
        </div>
      )}

      {/* Size selector */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Chọn size</p>
          <button className="text-xs text-primary underline-offset-2 hover:underline">
            Hướng dẫn chọn size
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={cn(
                "min-w-[3rem] rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                selectedSize === size
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/50"
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-2">
        <Button
          size="lg"
          className="w-full rounded-full"
          onClick={handleAddToCart}
        >
          <ShoppingCart data-icon="inline-start" />
          {mode === "buy" ? "Thêm vào giỏ hàng" : `Đặt thuê ${rentDays} ngày`}
        </Button>
        <Button size="lg" variant="outline" className="w-full rounded-full">
          <Heart data-icon="inline-start" />
          Lưu vào yêu thích
        </Button>
      </div>

      {/* Trust signals */}
      <div className="flex flex-col gap-2 rounded-xl bg-muted/40 p-4">
        {[
          { icon: Truck, text: "Giao hàng toàn quốc 2–5 ngày" },
          { icon: RotateCcw, text: "Đổi trả 7 ngày nếu lỗi sản xuất" },
          { icon: Shield, text: "Hàng chính hãng, may thủ công" },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-3">
            <Icon className="size-4 shrink-0 text-primary" />
            <span className="text-sm text-muted-foreground">{text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

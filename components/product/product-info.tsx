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
import { formatPrice } from "@/lib/utils"
import { useCart } from "@/hooks/use-cart"
import { toast } from "sonner"
import type { Product } from "@/lib/products"

type Mode = "buy" | "rent"

export function ProductInfo({ product }: { product: Product }) {
  const [mode, setMode] = useState<Mode>("buy")
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [rentDays, setRentDays] = useState(3)
  const [sizeError, setSizeError] = useState(false)
  const [wishlist, setWishlist] = useState(false)
  const { addItem } = useCart()

  const currentPrice =
    mode === "buy" ? product.price : (product.rentPrice ?? 0) * rentDays

  const handleAddToCart = async () => {
    if (!selectedSize) {
      setSizeError(true)
      // Scroll size selector into view
      document.getElementById("size-selector")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
      return
    }

    setSizeError(false)
    const success = await addItem(
      product.slug,
      selectedSize,
      mode,
      mode === "rent" ? rentDays : undefined,
      1
    )

    if (success) {
      setSelectedSize(null)
      setSizeError(false)
    }
  }

  const handleWishlist = () => {
    setWishlist((v) => !v)
    toast.success(wishlist ? "Đã bỏ khỏi yêu thích" : "Đã lưu vào yêu thích")
  }

  // Discount percentage helper
  const discountPct = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null

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
        <div
          className="flex items-center gap-2"
          role="group"
          aria-label={`Đánh giá: ${product.rating} trên 5 sao`}
        >
          <div className="flex gap-0.5" aria-hidden="true">
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
          <p className="text-sm font-medium text-foreground" id="mode-label">
            Hình thức
          </p>
          <div
            className="flex gap-2"
            role="radiogroup"
            aria-labelledby="mode-label"
          >
            {(["buy", "rent"] as Mode[]).map((m) => (
              <button
                key={m}
                role="radio"
                aria-checked={mode === m}
                onClick={() => {
                  setMode(m)
                  setSelectedSize(null)
                  setSizeError(false)
                }}
                className={cn(
                  "flex-1 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all",
                  mode === m
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                )}
              >
                <div className="text-base font-bold">
                  {m === "buy"
                    ? formatPrice(product.price)
                    : `${formatPrice(product.rentPrice ?? 0)}/ngày`}
                </div>
                <div className="text-xs font-normal opacity-70">
                  {m === "buy" ? "Mua trực tiếp" : "Thuê trang phục"}
                </div>
              </button>
            ))}
          </div>

          {/* Rent days selector */}
          {mode === "rent" && (
            <div className="flex flex-col gap-2 rounded-xl bg-muted/50 p-4">
              <p className="text-sm font-medium text-foreground">
                Số ngày thuê
              </p>
              <div
                className="flex gap-2"
                role="radiogroup"
                aria-label="Số ngày thuê"
              >
                {[1, 3, 7, 14].map((d) => (
                  <button
                    key={d}
                    role="radio"
                    aria-checked={rentDays === d}
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

      {/* Price display */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-extrabold text-foreground">
          {formatPrice(mode === "rent" ? currentPrice : product.price)}
        </span>
        {mode === "buy" && product.originalPrice && (
          <>
            <span className="text-lg text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
            {discountPct && (
              <Badge variant="secondary" className="text-xs">
                -{discountPct}%
              </Badge>
            )}
          </>
        )}
        {mode === "rent" && (
          <span className="text-sm text-muted-foreground">
            ({rentDays} ngày × {formatPrice(product.rentPrice ?? 0)})
          </span>
        )}
      </div>

      {/* Size selector */}
      <div className="flex flex-col gap-3" id="size-selector">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">
            Chọn size
            {sizeError && (
              <span className="ml-2 text-xs font-normal text-destructive">
                — Vui lòng chọn size trước khi tiếp tục
              </span>
            )}
          </p>
          <a
            href="/size-guide"
            className="text-xs text-primary underline-offset-2 hover:underline"
          >
            Hướng dẫn chọn size
          </a>
        </div>
        <div
          className="flex flex-wrap gap-2"
          role="radiogroup"
          aria-label="Chọn size"
          aria-required="true"
        >
          {product.sizes.map((size) => (
            <button
              key={size}
              role="radio"
              aria-checked={selectedSize === size}
              onClick={() => {
                setSelectedSize(size)
                setSizeError(false)
              }}
              className={cn(
                "min-w-[3rem] rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                selectedSize === size
                  ? "border-primary bg-primary text-primary-foreground"
                  : sizeError
                    ? "border-destructive/50 bg-card text-foreground hover:border-primary/50"
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
          <ShoppingCart className="mr-2 size-4" />
          {mode === "buy" ? "Thêm vào giỏ hàng" : `Đặt thuê ${rentDays} ngày`}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className={cn(
            "w-full rounded-full transition-colors",
            wishlist && "border-primary/40 bg-primary/5 text-primary"
          )}
          onClick={handleWishlist}
          aria-pressed={wishlist}
          aria-label={wishlist ? "Bỏ khỏi yêu thích" : "Lưu vào yêu thích"}
        >
          <Heart
            className={cn(
              "mr-2 size-4 transition-colors",
              wishlist && "fill-primary text-primary"
            )}
          />
          {wishlist ? "Đã lưu" : "Lưu vào yêu thích"}
        </Button>
      </div>

      {/* Trust signals */}
      <div className="flex flex-col gap-2 rounded-xl bg-muted/50 p-4">
        {[
          { icon: Truck, text: "Giao hàng toàn quốc 2–5 ngày" },
          { icon: RotateCcw, text: "Đổi trả 7 ngày nếu lỗi sản xuất" },
          { icon: Shield, text: "Hàng chính hãng, may thủ công" },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-3">
            <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="text-sm text-muted-foreground">{text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

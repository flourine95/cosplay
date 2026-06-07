"use client"

import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import type { CartItem } from "@/hooks/use-cart"

interface CartItemsProps {
  items: CartItem[]
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
}

// Format price function based on user requirement: toLocaleString('vi-VN') + "₫"
const formatCartPrice = (price: number) => {
  return `${price.toLocaleString("vi-VN")}₫`
}

export function CartItems({
  items,
  updateQuantity,
  removeItem,
}: CartItemsProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl bg-muted/50 py-16">
        <ShoppingCart className="size-10 text-muted-foreground/40" />
        <div className="text-center">
          <p className="text-base font-semibold text-foreground">
            Giỏ hàng trống
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Thêm sản phẩm để bắt đầu mua sắm
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/">Khám phá sản phẩm</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {items.map((item) => (
        <div key={item.id} className="flex gap-4 py-5 first:pt-0 last:pb-0">
          {/* Product image */}
          <Link
            href={`/products/${item.productSlug}`}
            className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted"
          >
            <Image
              src={item.image}
              alt={`Trang phục ${item.name}`}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              sizes="96px"
            />
          </Link>

          {/* Product details */}
          <div className="flex flex-1 flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-1">
                <Link
                  href={`/products/${item.productSlug}`}
                  className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
                >
                  {item.name}
                </Link>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-xs font-normal">
                    Size {item.size}
                  </Badge>
                  <Badge variant="secondary" className="text-xs font-normal">
                    {item.type === "Mua"
                      ? "Mua"
                      : `Thuê ${item.rentDays || 3} ngày`}
                  </Badge>
                </div>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Xóa ${item.name} khỏi giỏ hàng`}
              >
                <Trash2 className="size-4" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              {/* Price */}
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">
                  {formatCartPrice(item.price * item.quantity)}
                </span>
                {item.quantity > 1 && (
                  <span className="text-xs text-muted-foreground">
                    {formatCartPrice(item.price)} × {item.quantity}
                  </span>
                )}
              </div>

              {/* Quantity controls */}
              <div className="flex items-center gap-1 rounded-full border border-border px-1 py-1">
                <button
                  onClick={() => {
                    if (item.quantity > 1) {
                      updateQuantity(item.id, item.quantity - 1)
                    }
                  }}
                  disabled={item.quantity <= 1}
                  className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                  aria-label={`Giảm số lượng ${item.name}`}
                >
                  <Minus className="size-3" />
                </button>
                <span className="w-7 text-center text-sm font-medium tabular-nums">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label={`Tăng số lượng ${item.name}`}
                >
                  <Plus className="size-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

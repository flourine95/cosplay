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

  // Group items by seller
  const groupedItems = items.reduce<
    Record<string, { shopName: string; items: CartItem[] }>
  >((acc, item) => {
    const sId = item.sellerId || "default"
    const sName = item.shopName || "Cosplay.vn Store"
    if (!acc[sId]) {
      acc[sId] = { shopName: sName, items: [] }
    }
    acc[sId].items.push(item)
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(groupedItems).map(([sellerId, group]) => (
        <div
          key={sellerId}
          className="rounded-xl border border-border bg-background p-6 shadow-sm"
        >
          {/* Seller Header */}
          <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Cửa hàng:
            </span>
            <span className="text-sm font-bold text-primary">
              {group.shopName}
            </span>
          </div>

          {/* Grouped Items List */}
          <div className="flex flex-col divide-y divide-border/50">
            {group.items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 py-4 first:pt-0 last:pb-0"
              >
                {/* Product image */}
                <Link
                  href={`/products/${item.productSlug}`}
                  className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted"
                >
                  <Image
                    src={item.image}
                    alt={`Trang phục ${item.name}`}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    sizes="80px"
                  />
                </Link>

                {/* Product details */}
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-0.5">
                      <Link
                        href={`/products/${item.productSlug}`}
                        className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
                      >
                        {item.name}
                      </Link>
                      <div className="mt-0.5 flex flex-wrap gap-1.5">
                        <Badge
                          variant="outline"
                          className="px-1.5 py-0 text-[10px] font-normal"
                        >
                          Size {item.size}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="px-1.5 py-0 text-[10px] font-normal"
                        >
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
                    <div className="flex items-center gap-1 rounded-full border border-border px-1 py-0.5">
                      <button
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        }}
                        disabled={item.quantity <= 1}
                        className="flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                        aria-label={`Giảm số lượng ${item.name}`}
                      >
                        <Minus className="size-2.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-medium tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label={`Tăng số lượng ${item.name}`}
                      >
                        <Plus className="size-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

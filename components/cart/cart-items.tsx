"use client"

import { useCart } from "@/lib/cart-context"
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price)
}

export function CartItems() {
  const { items, removeItem, updateQuantity } = useCart()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg bg-muted/50 py-12">
        <ShoppingCart className="size-12 text-muted-foreground/50" />
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">
            Giỏ hàng trống
          </p>
          <p className="text-sm text-muted-foreground">
            Thêm các sản phẩm để bắt đầu mua sắm
          </p>
        </div>
        <Link href="/products">
          <Button>Tiếp tục mua sắm</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card
          key={`${item.productSlug}-${item.size}-${item.type}`}
          className="p-4"
        >
          <div className="flex gap-4">
            {/* Product image */}
            <div className="relative size-24 shrink-0 bg-muted">
              <Image
                src={item.image}
                alt={item.productName}
                fill
                className="object-cover"
              />
            </div>

            {/* Product details */}
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-start justify-between">
                <div>
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="font-semibold hover:underline"
                  >
                    {item.productName}
                  </Link>
                  <div className="mt-1 flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      Size: {item.size}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {item.type === "buy"
                        ? "Mua"
                        : `Thuê ${item.rentDays} ngày`}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    removeItem(item.productSlug, item.size, item.type)
                  }
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Giá: {formatPrice(item.price)}
                  </p>
                  <p className="font-semibold">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      updateQuantity(
                        item.productSlug,
                        item.size,
                        item.type,
                        item.quantity - 1
                      )
                    }
                    className="size-8"
                  >
                    <Minus className="size-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      updateQuantity(
                        item.productSlug,
                        item.size,
                        item.type,
                        item.quantity + 1
                      )
                    }
                    className="size-8"
                  >
                    <Plus className="size-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

"use client"

import { useCart } from "@/lib/cart-context"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price)
}

export function CheckoutOrderSummary() {
  const { items } = useCart()

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">
        Sản phẩm trong đơn hàng
      </h2>

      {items.map((item) => (
        <Card
          key={`${item.productSlug}-${item.size}-${item.type}`}
          className="p-4"
        >
          <div className="flex gap-4">
            {/* Product image */}
            <div className="relative size-20 shrink-0 bg-muted">
              <Image
                src={item.image}
                alt={item.productName}
                fill
                className="rounded object-cover"
              />
            </div>

            {/* Product details */}
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">
                {item.productName}
              </h3>
              <div className="mt-1 flex gap-2">
                <Badge variant="outline" className="text-xs">
                  Size: {item.size}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {item.type === "buy" ? "Mua" : `Thuê ${item.rentDays} ngày`}
                </Badge>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {formatPrice(item.price)} × {item.quantity}
                </span>
                <span className="font-semibold text-foreground">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

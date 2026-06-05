"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import type { CartItem } from "@/hooks/use-cart"

interface CheckoutOrderSummaryProps {
  items: CartItem[]
  totalPrice: number
  shippingCost: number
  finalTotal: number
}

// Format price function based on user requirement: toLocaleString('vi-VN') + "₫"
const formatCartPrice = (price: number) => {
  return `${price.toLocaleString("vi-VN")}₫`
}

export function CheckoutOrderSummary({
  items,
  totalPrice,
  shippingCost,
  finalTotal,
}: CheckoutOrderSummaryProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">
          Sản phẩm trong đơn hàng
        </h2>

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Không có sản phẩm nào</p>
        ) : (
          items.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex gap-4">
                {/* Product image */}
                <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>

                {/* Product details */}
                <div className="flex-1">
                  <h3 className="line-clamp-1 text-sm font-semibold text-foreground">
                    {item.name}
                  </h3>
                  <div className="mt-1 flex gap-1.5">
                    <Badge
                      variant="outline"
                      className="px-1.5 py-0 text-[10px] font-normal"
                    >
                      Size: {item.size}
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
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {formatCartPrice(item.price)} × {item.quantity}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCartPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Totals panel */}
      <Card className="p-5">
        <h3 className="mb-4 text-sm font-bold text-foreground">
          Tóm tắt thanh toán
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Tạm tính ({items.reduce((acc, i) => acc + i.quantity, 0)} sản
              phẩm)
            </span>
            <span className="font-semibold tabular-nums">
              {formatCartPrice(totalPrice)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Phí vận chuyển</span>
            <span className="font-semibold tabular-nums">
              {items.length > 0 ? formatCartPrice(shippingCost) : "—"}
            </span>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex justify-between text-base font-bold text-foreground">
          <span>Tổng cộng</span>
          <span className="text-primary tabular-nums">
            {formatCartPrice(finalTotal)}
          </span>
        </div>
      </Card>
    </div>
  )
}

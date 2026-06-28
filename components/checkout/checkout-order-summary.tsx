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
          Object.entries(
            items.reduce<
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
          ).map(([sellerId, group]) => (
            <div
              key={sellerId}
              className="space-y-3 rounded-xl border border-border bg-background p-4 shadow-sm"
            >
              {/* Seller Header */}
              <div className="mb-2 flex items-center gap-1.5 border-b border-border/50 pb-2">
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                  Cửa hàng:
                </span>
                <span className="text-xs font-bold text-primary">
                  {group.shopName}
                </span>
              </div>

              {/* Group items */}
              <div className="space-y-3">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 py-1 first:pt-0 last:pb-0"
                  >
                    {/* Product image */}
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>

                    {/* Product details */}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-xs font-semibold text-foreground">
                        {item.name}
                      </h3>
                      <div className="mt-0.5 flex gap-1">
                        <Badge
                          variant="outline"
                          className="px-1 py-0 text-[9px] font-normal"
                        >
                          Size: {item.size}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="px-1 py-0 text-[9px] font-normal"
                        >
                          {item.type === "Mua"
                            ? "Mua"
                            : `Thuê ${item.rentDays || 3} ngày`}
                        </Badge>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {formatCartPrice(item.price)} × {item.quantity}
                        </span>
                        <span className="font-semibold text-foreground">
                          {formatCartPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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

"use client"

import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price)
}

export function CartSummary() {
  const { items, totalPrice, totalItems, clearCart } = useCart()

  const shippingCost = totalItems > 0 ? 35000 : 0
  const tax = Math.round(totalPrice * 0.1)
  const finalTotal = totalPrice + shippingCost + tax

  return (
    <Card className="sticky top-20 h-fit p-6 md:col-span-1">
      <h3 className="text-lg font-semibold text-foreground">
        Tóm tắt đơn hàng
      </h3>
      <Separator className="my-4" />

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Subtotal ({totalItems} sản phẩm)
          </span>
          <span className="font-medium">{formatPrice(totalPrice)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Phí vận chuyển</span>
          <span className="font-medium">{formatPrice(shippingCost)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Thuế (10%)</span>
          <span className="font-medium">{formatPrice(tax)}</span>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex justify-between text-lg font-bold">
        <span>Tổng cộng</span>
        <span className="text-primary">{formatPrice(finalTotal)}</span>
      </div>

      <Link href={items.length > 0 ? "/checkout" : "#"} className="block">
        <Button
          className="mt-6 w-full rounded-full"
          size="lg"
          disabled={items.length === 0}
        >
          Tiến hành thanh toán
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </Link>

      <Link href="/products" className="block">
        <Button variant="outline" className="mt-2 w-full rounded-full">
          Tiếp tục mua sắm
        </Button>
      </Link>

      {items.length > 0 && (
        <Button
          variant="ghost"
          className="mt-2 w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={clearCart}
        >
          Xóa toàn bộ giỏ hàng
        </Button>
      )}

      <div className="mt-6 space-y-2 rounded-lg bg-green-50 p-4 text-xs text-green-800">
        <p className="font-medium">✓ Giao hàng 2–5 ngày toàn quốc</p>
        <p className="font-medium">✓ Hàng chính hãng, may thủ công</p>
        <p className="font-medium">✓ Đổi trả 7 ngày nếu lỗi sản xuất</p>
      </div>
    </Card>
  )
}

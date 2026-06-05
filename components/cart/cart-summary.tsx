"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, Truck, RotateCcw, Shield } from "lucide-react"
import Link from "next/link"
import type { CartItem } from "@/hooks/use-cart"

interface CartSummaryProps {
  items: CartItem[]
  totalPrice: number
  totalItems: number
  clearCart: () => Promise<void>
}

// Format price function based on user requirement: toLocaleString('vi-VN') + "₫"
const formatCartPrice = (price: number) => {
  return `${price.toLocaleString("vi-VN")}₫`
}

export function CartSummary({
  items,
  totalPrice,
  totalItems,
  clearCart,
}: CartSummaryProps) {
  const shippingCost = totalItems > 0 ? 35000 : 0
  const finalTotal = totalPrice + shippingCost

  const handleClearCart = async () => {
    const confirmClear = window.confirm(
      "Bạn có chắc chắn muốn xóa toàn bộ sản phẩm trong giỏ hàng không?"
    )
    if (confirmClear) {
      await clearCart()
    }
  }

  return (
    <div className="sticky top-20 flex flex-col gap-0 rounded-xl border border-border bg-background p-6">
      <h3 className="text-base font-semibold text-foreground">
        Tóm tắt đơn hàng
      </h3>

      <Separator className="my-4" />

      <div className="flex flex-col gap-2.5 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Tạm tính ({totalItems} sản phẩm)
          </span>
          <span className="font-medium tabular-nums">
            {formatCartPrice(totalPrice)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Phí vận chuyển</span>
          <span className="font-medium tabular-nums">
            {totalItems > 0 ? formatCartPrice(shippingCost) : "—"}
          </span>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex justify-between">
        <span className="font-semibold text-foreground">Tổng cộng</span>
        <span className="text-lg font-bold text-foreground tabular-nums">
          {formatCartPrice(finalTotal)}
        </span>
      </div>

      <Button
        asChild={items.length > 0}
        className="mt-5 w-full rounded-full"
        size="lg"
        disabled={items.length === 0}
      >
        {items.length > 0 ? (
          <Link
            href="/checkout"
            className="flex items-center justify-center gap-2"
          >
            Tiến hành thanh toán
            <ArrowRight className="size-4 shrink-0" />
          </Link>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Tiến hành thanh toán
            <ArrowRight className="size-4 shrink-0" />
          </span>
        )}
      </Button>

      <Button asChild variant="outline" className="mt-2 w-full rounded-full">
        <Link href="/">Tiếp tục mua sắm</Link>
      </Button>

      {items.length > 0 && (
        <button
          onClick={handleClearCart}
          className="mt-2 w-full py-2 text-xs text-muted-foreground transition-colors hover:text-destructive"
        >
          Xóa toàn bộ giỏ hàng
        </button>
      )}

      {/* Trust signals */}
      <div className="mt-5 flex flex-col gap-2 border-t border-border/60 pt-5">
        {[
          { icon: Truck, text: "Giao hàng 2–5 ngày toàn quốc" },
          { icon: Shield, text: "Hàng chính hãng, may thủ công" },
          { icon: RotateCcw, text: "Đổi trả 7 ngày nếu lỗi sản xuất" },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-2.5">
            <Icon
              className="size-3.5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span className="text-xs text-muted-foreground">{text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

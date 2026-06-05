"use client"

import { useEffect } from "react"
import { Navbar } from "@/components/home/navbar"
import { AnnouncementBar } from "@/components/home/announcement-bar"
import { Footer } from "@/components/home/footer"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { CartItems } from "@/components/cart/cart-items"
import { CartSummary } from "@/components/cart/cart-summary"
import Link from "next/link"
import { useCart } from "@/hooks/use-cart"
import { Loader2, ShoppingCart, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CartPage() {
  const {
    items,
    isLoading,
    error,
    updateQuantity,
    removeItem,
    clearCart,
    totalPrice,
    totalItems,
  } = useCart()

  useEffect(() => {
    document.title = "Giỏ hàng - Cosplay.vn"
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Trang chủ</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Giỏ hàng</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Page title */}
          <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Giỏ hàng của bạn
          </h1>

          {/* Loading, Error and Empty states */}
          {isLoading ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
              <Loader2 className="size-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Đang tải giỏ hàng...
              </p>
            </div>
          ) : error ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 rounded-xl bg-destructive/5 p-8 text-center">
              <AlertCircle className="size-10 text-destructive" />
              <h2 className="text-lg font-semibold text-foreground">
                Không thể tải giỏ hàng
              </h2>
              <p className="max-w-md text-sm text-muted-foreground">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-2 rounded-full"
              >
                Thử lại
              </Button>
            </div>
          ) : items.length === 0 ? (
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
              <Button asChild className="rounded-full">
                <Link href="/">Khám phá sản phẩm</Link>
              </Button>
            </div>
          ) : (
            /* Main content */
            <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-4">
              <div className="md:col-span-2 lg:col-span-3">
                <CartItems
                  items={items}
                  updateQuantity={updateQuantity}
                  removeItem={removeItem}
                />
              </div>
              <CartSummary
                items={items}
                totalPrice={totalPrice}
                totalItems={totalItems}
                clearCart={clearCart}
              />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

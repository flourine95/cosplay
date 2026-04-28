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

export const metadata = {
  title: "Giỏ hàng - Cosplay.vn",
  description: "Xem và quản lý giỏ hàng của bạn",
}

export default function CartPage() {
  return (
    <main className="min-h-screen">
      <AnnouncementBar />
      <Navbar />

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

        {/* Main content */}
        <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-4">
          {/* Cart items */}
          <div className="md:col-span-2 lg:col-span-3">
            <CartItems />
          </div>

          {/* Cart summary */}
          <CartSummary />
        </div>
      </div>

      <Footer />
    </main>
  )
}

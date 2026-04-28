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
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { CheckoutOrderSummary } from "@/components/checkout/checkout-order-summary"
import Link from "next/link"

export const metadata = {
  title: "Thanh toán - Cosplay.vn",
  description: "Hoàn tất thanh toán đơn hàng của bạn",
}

export default function CheckoutPage() {
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
              <BreadcrumbLink asChild>
                <Link href="/cart">Giỏ hàng</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Thanh toán</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page title */}
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Hoàn tất thanh toán
        </h1>

        {/* Main content */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Checkout form */}
          <div className="md:col-span-2">
            <CheckoutForm />
          </div>

          {/* Order summary sidebar */}
          <div className="sticky top-20 h-fit">
            <CheckoutOrderSummary />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

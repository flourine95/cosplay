"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Navbar } from "@/components/home/navbar"
import { AnnouncementBar } from "@/components/home/announcement-bar"
import { Footer } from "@/components/home/footer"

const paymentMethods = {
  cod: "Thanh toán khi nhận hàng (COD)",
  bank: "Chuyển khoản ngân hàng",
  ewallet: "Ví điện tử",
  card: "Thẻ tín dụng / Debit card",
}

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId") || "ORD-UNKNOWN"
  const method =
    (searchParams.get("method") as keyof typeof paymentMethods) || "cod"
  const paymentMethod = paymentMethods[method] || "Không xác định"

  return (
    <main className="min-h-screen">
      <AnnouncementBar />
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
        {/* Success message */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex justify-center">
            <CheckCircle className="size-16 text-green-500" />
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Đơn hàng đã được đặt thành công!
          </h1>
          <p className="text-lg text-muted-foreground">
            Cảm ơn bạn đã tin tưởng Cosplay.vn
          </p>
        </div>

        {/* Order details */}
        <Card className="mb-8 space-y-6 p-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Thông tin đơn hàng
            </h2>
            <Separator className="mt-3" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
              <span className="text-muted-foreground">Mã đơn hàng</span>
              <span className="font-mono font-bold text-foreground">
                {orderId}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
              <span className="text-muted-foreground">
                Phương thức thanh toán
              </span>
              <span className="font-semibold text-foreground">
                {paymentMethod}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
              <span className="text-muted-foreground">Trạng thái</span>
              <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                Chờ xác nhận
              </span>
            </div>
          </div>
        </Card>

        {/* Next steps */}
        <Card className="mb-8 space-y-4 p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Các bước tiếp theo
          </h2>
          <Separator />

          <ol className="space-y-3">
            <li className="flex gap-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                1
              </span>
              <div>
                <p className="font-semibold text-foreground">
                  Chúng tôi sẽ xác nhận đơn hàng
                </p>
                <p className="text-sm text-muted-foreground">
                  Bạn sẽ nhận email xác nhận trong vòng 2 giờ
                </p>
              </div>
            </li>

            <li className="flex gap-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                2
              </span>
              <div>
                <p className="font-semibold text-foreground">
                  Chuẩn bị hàng và vận chuyển
                </p>
                <p className="text-sm text-muted-foreground">
                  Dự kiến giao hàng trong 2–5 ngày làm việc
                </p>
              </div>
            </li>

            <li className="flex gap-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                3
              </span>
              <div>
                <p className="font-semibold text-foreground">
                  Nhận và thanh toán
                </p>
                <p className="text-sm text-muted-foreground">
                  {method === "cod"
                    ? "Thanh toán khi nhận hàng tại cửa nhà"
                    : "Theo phương thức thanh toán của bạn"}
                </p>
              </div>
            </li>
          </ol>
        </Card>

        {/* Contact support */}
        <Card className="mb-8 space-y-4 p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Liên hệ hỗ trợ
          </h2>
          <Separator />

          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi:
            </p>
            <div className="space-y-1">
              <p className="font-medium text-foreground">
                📧 Email: support@cosplay.vn
              </p>
              <p className="font-medium text-foreground">
                📱 Hotline: 1900 0000
              </p>
              <p className="font-medium text-foreground">
                💬 Chat: Mon - Sat, 9AM - 6PM
              </p>
            </div>
          </div>
        </Card>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button variant="outline" className="w-full rounded-full sm:w-auto">
              Về trang chủ
            </Button>
          </Link>
          <Link href="/products">
            <Button className="w-full rounded-full sm:w-auto">
              Tiếp tục mua sắm
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  )
}

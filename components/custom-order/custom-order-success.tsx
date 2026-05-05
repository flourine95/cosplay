"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  CheckCircle2,
  Clock,
  Mail,
  ArrowRight,
  Home,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Navbar } from "@/components/home/navbar"
import { Footer } from "@/components/home/footer"
import Link from "next/link"

const nextSteps = [
  {
    id: 1,
    label: "Maker xem xét yêu cầu",
    time: "Trong 24 giờ",
    icon: Clock,
  },
  {
    id: 2,
    label: "Bạn nhận báo giá qua email",
    time: "Sau khi Maker xem xét",
    icon: Mail,
  },
  {
    id: 3,
    label: "Duyệt giá & đặt cọc 30-50%",
    time: "Khi đồng ý báo giá",
    icon: Sparkles,
  },
  {
    id: 4,
    label: "Maker tiến hành gia công",
    time: "3-6 tuần",
    icon: CheckCircle2,
  },
]

export function CustomOrderSuccess() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("id") || "40912"
  const projectName = searchParams.get("name") || "Yêu cầu đặt may"
  const [countdown, setCountdown] = useState(30)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setIsAnimating(true), 100)
  }, [])

  useEffect(() => {
    if (isPaused) return

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push(`/custom-order/${orderId}`)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [orderId, router, isPaused])

  const handleViewProgress = () => {
    router.push(`/custom-order/${orderId}`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Success Icon with Animation */}
          <div className="mb-8 flex justify-center">
            <div
              className={`relative transition-all duration-700 ${
                isAnimating ? "scale-100 opacity-100" : "scale-50 opacity-0"
              }`}
            >
              <div className="absolute inset-0 animate-ping rounded-full bg-green-500/20" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-green-500">
                <CheckCircle2 className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>

          {/* Main Card */}
          <Card
            className={`border-border/60 shadow-lg transition-all delay-200 duration-700 ${
              isAnimating
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <CardHeader className="space-y-4 text-center">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                Yêu cầu đã được gửi thành công!
              </h1>
              <p className="text-sm text-muted-foreground">
                Chúng tôi đã nhận được yêu cầu đặt may của bạn và sẽ kết nối với
                Maker phù hợp nhất.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Order Info */}
              <div className="rounded-xl bg-muted/40 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      Mã yêu cầu
                    </p>
                    <p className="mt-1 text-lg font-bold text-foreground">
                      #CM-{orderId}
                    </p>
                  </div>
                  <Badge className="bg-green-500 text-white hover:bg-green-600">
                    Đã gửi
                  </Badge>
                </div>
                <Separator className="my-3" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Tên dự án
                  </p>
                  <p className="mt-1 font-semibold text-foreground">
                    {decodeURIComponent(projectName)}
                  </p>
                </div>
              </div>

              {/* Email Notification */}
              <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-background p-4">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Email xác nhận đã được gửi
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Kiểm tra hộp thư để xem chi tiết yêu cầu và theo dõi cập
                    nhật từ Maker.
                  </p>
                </div>
              </div>

              {/* Next Steps */}
              <div>
                <h2 className="mb-4 text-base font-bold text-foreground">
                  📋 Điều gì sẽ xảy ra tiếp theo?
                </h2>
                <div className="space-y-3">
                  {nextSteps.map((step, index) => {
                    const Icon = step.icon
                    return (
                      <div
                        key={step.id}
                        className={`flex items-start gap-3 transition-all duration-500 ${
                          isAnimating
                            ? "translate-x-0 opacity-100"
                            : "-translate-x-4 opacity-0"
                        }`}
                        style={{ transitionDelay: `${400 + index * 100}ms` }}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 pt-0.5">
                          <p className="text-sm font-semibold text-foreground">
                            {step.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {step.time}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Auto Redirect Notice */}
              <div className="rounded-lg bg-primary/5 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    {isPaused ? (
                      "Đã tạm dừng tự động chuyển trang"
                    ) : (
                      <>
                        Tự động chuyển sau{" "}
                        <span className="font-bold text-primary">
                          {countdown}
                        </span>{" "}
                        giây
                      </>
                    )}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 shrink-0 text-xs"
                    onClick={() => setIsPaused(!isPaused)}
                  >
                    {isPaused ? "Tiếp tục" : "Tạm dừng"}
                  </Button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 border-t pt-6">
              <Button
                size="lg"
                className="w-full rounded-full font-semibold"
                onClick={handleViewProgress}
              >
                Xem chi tiết tiến độ
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                asChild
              >
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Quay về trang chủ
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Help Text */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Có thắc mắc?{" "}
            <Link href="#" className="font-medium text-primary hover:underline">
              Liên hệ hỗ trợ
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}

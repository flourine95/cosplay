"use client"

import { useState } from "react"
import { format, differenceInDays } from "date-fns"
import {
  Calendar as CalendarIcon,
  Info,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Star,
  Package,
  Clock,
  CheckCircle,
  MessageCircle,
} from "lucide-react"
import { DateRange } from "react-day-picker"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/home/navbar"
import { Footer } from "@/components/home/footer"
import Link from "next/link"
import Image from "next/image"

const PRICE_PER_DAY = 150000
const SECURITY_DEPOSIT = 500000

const disabledDates = [
  new Date(2026, 4, 10),
  new Date(2026, 4, 11),
  new Date(2026, 4, 12),
  new Date(2026, 4, 18),
  new Date(2026, 4, 19),
]

const policies = [
  { Icon: Package, text: "Giao hàng toàn quốc qua đơn vị vận chuyển uy tín" },
  { Icon: Clock, text: "Nhận đồ trước ngày thuê ít nhất 1 ngày" },
  { Icon: CheckCircle, text: "Trả đồ trong 24h sau ngày kết thúc" },
  { Icon: ShieldCheck, text: "Cọc hoàn trả 100% khi đồ nguyên vẹn, trong 24h" },
]

export function RentalBooking() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  })

  const rentalDays = (() => {
    if (date?.from && date?.to) return differenceInDays(date.to, date.from) + 1
    if (date?.from) return 1
    return 0
  })()

  const totalRentalFee = rentalDays * PRICE_PER_DAY
  const totalPayment = totalRentalFee + SECURITY_DEPOSIT
  const canBook = !!(date?.from && date?.to)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="border-b border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-4 md:px-6">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-foreground">
              Trang chủ
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link
              href="/rental"
              className="transition-colors hover:text-foreground"
            >
              Thuê đồ
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-foreground">Đặt lịch thuê</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            {/* Thông tin sản phẩm */}
            <Card className="overflow-hidden border-border/60 shadow-sm">
              <div className="flex gap-4 p-4">
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-muted">
                  <Image
                    src="https://images.unsplash.com/photo-1635805737707-575885ab0820?w=200&h=200&fit=crop"
                    alt="Yae Miko Cosplay"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <Badge className="mb-2 border-0 bg-primary/10 text-xs text-primary">
                    Thuê đồ
                  </Badge>
                  <h1 className="text-lg leading-tight font-extrabold tracking-tight">
                    Genshin Impact – Yae Miko
                  </h1>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Size M • Bao gồm tai + đuôi cáo
                  </p>
                  <div className="mt-1.5 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-3.5 w-3.5 ${s <= 4 ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
                      />
                    ))}
                    <span className="ml-1 text-xs text-muted-foreground">
                      (24 đánh giá)
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-xl font-extrabold text-primary">
                      {PRICE_PER_DAY.toLocaleString()} đ
                    </span>
                    <span className="text-xs text-muted-foreground">
                      / ngày
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Shop:{" "}
                    <span className="cursor-pointer font-medium text-primary hover:underline">
                      WibuStore
                    </span>
                  </p>
                </div>
              </div>
            </Card>

            {/* Lịch */}
            <Card className="border-t-4 border-border/60 border-t-primary shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Chọn ngày thuê
                </CardTitle>
                <CardDescription>
                  Ngày bôi xám đã được khách khác đặt hoặc shop đang bảo trì.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-6">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={new Date(2026, 4, 1)}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                  disabled={[...disabledDates, { before: new Date() }]}
                  className="rounded-xl border bg-card shadow-inner"
                />
              </CardContent>
              <CardFooter className="border-t pt-3 pb-4">
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="size-3 rounded-sm bg-primary" />
                    <span>Ngày bạn chọn</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-3 rounded-sm border border-border bg-muted" />
                    <span>Ngày đã có người thuê</span>
                  </div>
                </div>
              </CardFooter>
            </Card>

            {/* Chính sách */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Chính sách thuê đồ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {policies.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <p.Icon className="h-4 w-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{p.text}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm dark:border-yellow-900 dark:bg-yellow-900/20">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
                  <div className="text-yellow-800 dark:text-yellow-200">
                    <p className="mb-0.5 font-semibold">
                      Chính sách xử lý vi phạm
                    </p>
                    <p className="text-xs">
                      Rách, bẩn cứng đầu hoặc trả trễ bị trừ tiền cọc theo{" "}
                      <a href="#" className="font-bold underline">
                        Bảng quy định phạt
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bill sidebar */}
          <div className="lg:col-span-2">
            <Card className="sticky top-20 border-border/60 shadow-xl">
              <CardHeader className="rounded-t-xl bg-muted/20 pb-4">
                <CardTitle className="text-base">Chi tiết thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                <div className="space-y-2">
                  {[
                    {
                      label: "Ngày nhận:",
                      value: date?.from ? format(date.from, "dd/MM/yyyy") : "—",
                    },
                    {
                      label: "Ngày trả:",
                      value: date?.to ? format(date.to, "dd/MM/yyyy") : "—",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-lg bg-muted p-3"
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarIcon className="h-4 w-4 text-primary" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <span className="text-sm font-semibold">
                        {item.value}
                      </span>
                    </div>
                  ))}
                  {rentalDays > 0 && (
                    <p className="text-center text-xs font-semibold text-primary">
                      ✓ Tổng {rentalDays} ngày thuê
                    </p>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Tiền thuê ({PRICE_PER_DAY.toLocaleString()}đ ×{" "}
                      {rentalDays} ngày)
                    </span>
                    <span className="font-semibold">
                      {totalRentalFee.toLocaleString()} đ
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      Tiền cọc (Deposit)
                      <Info className="h-3.5 w-3.5 cursor-help text-primary" />
                    </span>
                    <span className="font-semibold">
                      {SECURITY_DEPOSIT.toLocaleString()} đ
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="flex items-end justify-between">
                  <span className="font-semibold">Tổng thanh toán:</span>
                  <span className="text-2xl font-extrabold text-primary">
                    {totalPayment.toLocaleString()} đ
                  </span>
                </div>

                <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-xs text-green-700 dark:border-green-900 dark:bg-green-950/20 dark:text-green-400">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    Tiền cọc được hệ thống giữ an toàn và{" "}
                    <strong>hoàn trả 100%</strong> trong 24h sau khi Seller xác
                    nhận đồ nguyên vẹn.
                  </p>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-2 pt-0">
                <Button
                  size="lg"
                  className="h-12 w-full rounded-xl text-base font-semibold"
                  disabled={!canBook}
                >
                  {canBook
                    ? `Xác nhận & Thanh toán ${totalPayment.toLocaleString()} đ`
                    : "Vui lòng chọn ngày thuê"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full gap-1.5 text-muted-foreground"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Hỏi shop trước khi đặt
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

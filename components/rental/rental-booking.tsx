"use client"

import { useState } from "react"
import { differenceInDays, format } from "date-fns"
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  CheckCircle,
  ChevronRight,
  Clock,
  Info,
  MessageCircle,
  Package,
  ShieldCheck,
  Star,
} from "lucide-react"
import type { DateRange } from "react-day-picker"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Footer } from "@/components/home/footer"
import { Navbar } from "@/components/home/navbar"

export interface SerializedRentalItem {
  id: number
  productId: number
  productSlug: string
  pricePerDay: number
  depositAmount: number
  minDays: number
  maxDays: number | null
  condition: string
  product: {
    name: string
    image: string
    shopName: string
    description: string
  }
}

export interface RentalBookingProps {
  rentalItem: SerializedRentalItem
  existingBookings: Array<{ from: string; to: string }>
}

const policies = [
  { Icon: Package, text: "Giao hang toan quoc qua don vi van chuyen uy tin" },
  { Icon: Clock, text: "Nhan do truoc ngay thue it nhat 1 ngay" },
  { Icon: CheckCircle, text: "Tra do trong 24h sau ngay ket thuc" },
  {
    Icon: ShieldCheck,
    text: "Admin giu coc va hoan sau khi shop xac nhan do nguyen ven",
  },
]

export function RentalBooking({
  existingBookings,
  rentalItem,
}: RentalBookingProps) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  })
  const [shipping, setShipping] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    note: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const rentalDays = (() => {
    if (date?.from && date?.to) return differenceInDays(date.to, date.from) + 1
    if (date?.from) return 1
    return 0
  })()

  const totalRentalFee = rentalDays * rentalItem.pricePerDay
  const totalPayment = totalRentalFee + rentalItem.depositAmount
  const isWithinMinDays = rentalDays === 0 || rentalDays >= rentalItem.minDays
  const isWithinMaxDays =
    rentalDays === 0 || !rentalItem.maxDays || rentalDays <= rentalItem.maxDays
  const hasShippingAddress = Boolean(
    shipping.name.trim() &&
    shipping.phone.trim() &&
    shipping.address.trim() &&
    shipping.city.trim() &&
    shipping.district.trim() &&
    shipping.ward.trim()
  )
  const canBook = Boolean(
    date?.from &&
    date?.to &&
    isWithinMinDays &&
    isWithinMaxDays &&
    hasShippingAddress
  )

  const disabledRanges = [
    { before: new Date() },
    ...existingBookings.map((booking) => ({
      from: new Date(booking.from),
      to: new Date(booking.to),
    })),
  ]

  const updateShipping = (field: keyof typeof shipping, value: string) => {
    setShipping((current) => ({ ...current, [field]: value }))
  }

  async function handleBook() {
    if (!date?.from || !date?.to) return

    if (!isWithinMinDays) {
      toast.error(`Thoi gian thue toi thieu la ${rentalItem.minDays} ngay`)
      return
    }

    if (!isWithinMaxDays && rentalItem.maxDays) {
      toast.error(`Thoi gian thue toi da la ${rentalItem.maxDays} ngay`)
      return
    }

    if (!hasShippingAddress) {
      toast.error("Vui long nhap day du dia chi giao hang")
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch("/api/rental/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rentalItemId: rentalItem.id,
          startDate: date.from.toISOString(),
          endDate: date.to.toISOString(),
          shippingName: shipping.name,
          shippingPhone: shipping.phone,
          shippingAddress: shipping.address,
          shippingCity: shipping.city,
          shippingDistrict: shipping.district,
          shippingWard: shipping.ward,
          shippingNote: shipping.note,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Vui long dang nhap de dat thue")
          router.push(`/login?redirect=/rental/${rentalItem.id}`)
          return
        }
        throw new Error(data.error || "Khong the dat thue do")
      }

      toast.success("Dat lich thue cosplay thanh cong")
      router.push(`/rental/management?orderId=${data.order.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Da xay ra loi")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="border-b border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-4 md:px-6">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-foreground">
              Trang chu
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link
              href="/products"
              className="transition-colors hover:text-foreground"
            >
              San pham
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-foreground">Dat lich thue</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            <Card className="overflow-hidden border-border/60 shadow-sm">
              <div className="flex gap-4 p-4">
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-muted">
                  <Image
                    src={rentalItem.product.image}
                    alt={rentalItem.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <Badge className="mb-2 border-0 bg-primary/10 text-xs text-primary">
                    Thue do
                  </Badge>
                  <h1 className="text-lg leading-tight font-extrabold tracking-tight">
                    {rentalItem.product.name}
                  </h1>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Tinh trang do: {rentalItem.condition}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3.5 w-3.5 ${
                          star <= 4
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-xs text-muted-foreground">
                      (24 danh gia)
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-xl font-extrabold text-primary">
                      {rentalItem.pricePerDay.toLocaleString()} d
                    </span>
                    <span className="text-xs text-muted-foreground">
                      / ngay
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Shop:{" "}
                    <span className="font-medium text-primary">
                      {rentalItem.product.shopName}
                    </span>
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-t-4 border-border/60 border-t-primary shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Chon ngay thue
                </CardTitle>
                <CardDescription>
                  Ngay bi khoa da co khach khac dat hoac shop dang bao tri.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-6">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={new Date()}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                  disabled={disabledRanges}
                  className="rounded-xl border bg-card shadow-inner"
                />
              </CardContent>
              <CardFooter className="border-t pt-3 pb-4">
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="size-3 rounded-sm bg-primary" />
                    <span>Ngay ban chon</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-3 rounded-sm border border-border bg-muted" />
                    <span>Ngay da co nguoi thue</span>
                  </div>
                </div>
              </CardFooter>
            </Card>

            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Dia chi giao hang</CardTitle>
                <CardDescription>
                  Shop se giao do den dia chi nay truoc ngay thue.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    value={shipping.name}
                    onChange={(event) =>
                      updateShipping("name", event.target.value)
                    }
                    placeholder="Ten nguoi nhan *"
                  />
                  <Input
                    value={shipping.phone}
                    onChange={(event) =>
                      updateShipping("phone", event.target.value)
                    }
                    placeholder="So dien thoai *"
                  />
                </div>
                <Input
                  value={shipping.address}
                  onChange={(event) =>
                    updateShipping("address", event.target.value)
                  }
                  placeholder="Dia chi chi tiet *"
                />
                <div className="grid gap-3 md:grid-cols-3">
                  <Input
                    value={shipping.city}
                    onChange={(event) =>
                      updateShipping("city", event.target.value)
                    }
                    placeholder="Tinh/Thanh pho *"
                  />
                  <Input
                    value={shipping.district}
                    onChange={(event) =>
                      updateShipping("district", event.target.value)
                    }
                    placeholder="Quan/Huyen *"
                  />
                  <Input
                    value={shipping.ward}
                    onChange={(event) =>
                      updateShipping("ward", event.target.value)
                    }
                    placeholder="Phuong/Xa *"
                  />
                </div>
                <Textarea
                  value={shipping.note}
                  onChange={(event) =>
                    updateShipping("note", event.target.value)
                  }
                  placeholder="Ghi chu giao hang (tuy chon)"
                  className="min-h-20 resize-none"
                />
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Chinh sach thue do
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {policies.map((policy) => (
                  <div
                    key={policy.text}
                    className="flex items-center gap-3 text-sm"
                  >
                    <policy.Icon className="h-4 w-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{policy.text}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm dark:border-yellow-900 dark:bg-yellow-900/20">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
                  <div className="text-yellow-800 dark:text-yellow-200">
                    <p className="mb-0.5 font-semibold">
                      Chinh sach xu ly vi pham
                    </p>
                    <p className="text-xs">
                      Rach, ban nang, mat phu kien hoac tra tre se bi tru coc
                      theo ket qua kiem tra cua shop va admin.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="sticky top-20 border-border/60 shadow-xl">
              <CardHeader className="rounded-t-xl bg-muted/20 pb-4">
                <CardTitle className="text-base">Chi tiet thanh toan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                <div className="space-y-2">
                  {[
                    {
                      label: "Ngay nhan:",
                      value: date?.from ? format(date.from, "dd/MM/yyyy") : "-",
                    },
                    {
                      label: "Ngay tra:",
                      value: date?.to ? format(date.to, "dd/MM/yyyy") : "-",
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
                      Tong {rentalDays} ngay thue
                    </p>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Tien thue ({rentalItem.pricePerDay.toLocaleString()}d x{" "}
                      {rentalDays} ngay)
                    </span>
                    <span className="font-semibold">
                      {totalRentalFee.toLocaleString()} d
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      Tien coc
                      <Info className="h-3.5 w-3.5 text-primary" />
                    </span>
                    <span className="font-semibold">
                      {rentalItem.depositAmount.toLocaleString()} d
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="flex items-end justify-between">
                  <span className="font-semibold">Tong thanh toan:</span>
                  <span className="text-2xl font-extrabold text-primary">
                    {totalPayment.toLocaleString()} d
                  </span>
                </div>

                <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-xs text-green-700 dark:border-green-900 dark:bg-green-950/20 dark:text-green-400">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    Tien coc do admin giu va chi hoan sau khi shop xac nhan do
                    da duoc tra ve dung tinh trang.
                  </p>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-2 pt-0">
                <Button
                  size="lg"
                  className="h-12 w-full rounded-xl text-base font-semibold"
                  disabled={!canBook || isSubmitting}
                  onClick={handleBook}
                >
                  {isSubmitting
                    ? "Dang xu ly dat lich..."
                    : canBook
                      ? `Xac nhan & thanh toan ${totalPayment.toLocaleString()} d`
                      : "Chon ngay va nhap dia chi"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full gap-1.5 text-muted-foreground"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Hoi shop truoc khi dat
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

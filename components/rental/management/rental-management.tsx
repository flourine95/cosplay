"use client"

import React, { useState } from "react"
import {
  Search,
  CalendarDays,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  ShieldCheck,
  ChevronRight,
  Package,
  Clock,
  RotateCcw,
  MessageCircle,
  Star,
  Plus,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Navbar } from "@/components/home/navbar"
import { Footer } from "@/components/home/footer"
import Link from "next/link"
import Image from "next/image"

type RentalStatus = "active" | "pending" | "returning" | "completed"

interface RentalItemType {
  id: string
  status: RentalStatus
  itemName: string
  shopName: string
  startDate: string
  endDate: string
  daysLeft: number | null
  totalPrice: number
  deposit: number
  image: string
}

const statusConfig: Record<
  RentalStatus,
  { label: string; badgeCls: string; Icon: React.ElementType }
> = {
  active: {
    label: "Đang giữ đồ (Sắp đến hạn)",
    badgeCls: "bg-red-500 text-white",
    Icon: AlertCircle,
  },
  pending: {
    label: "Chờ Shop giao đồ",
    badgeCls:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    Icon: Clock,
  },
  returning: {
    label: "Đang hoàn trả & Chờ hoàn cọc",
    badgeCls:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    Icon: RotateCcw,
  },
  completed: {
    label: "Đã hoàn tất",
    badgeCls:
      "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    Icon: CheckCircle,
  },
}

function RentalCard({ rental }: { rental: RentalItemType }) {
  const cfg = statusConfig[rental.status]
  const [returnNote, setReturnNote] = useState("")

  return (
    <Card className="overflow-hidden border-border/60 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-44 w-full shrink-0 overflow-hidden bg-muted sm:h-auto sm:w-44">
          <Image
            src={rental.image}
            alt={rental.itemName}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-2 left-2 sm:hidden">
            <Badge
              className={`flex items-center gap-1 text-xs ${cfg.badgeCls}`}
            >
              <cfg.Icon className="h-3 w-3" />
              {cfg.label}
            </Badge>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between p-5">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-xs font-semibold">
                  {rental.id}
                </span>
                <span className="text-xs text-muted-foreground">
                  Shop:{" "}
                  <span className="cursor-pointer font-medium text-primary hover:underline">
                    {rental.shopName}
                  </span>
                </span>
              </div>
              <h3 className="line-clamp-2 text-base leading-tight font-bold">
                {rental.itemName}
              </h3>
            </div>
            <div className="ml-3 hidden shrink-0 sm:block">
              <Badge
                className={`flex items-center gap-1 text-xs ${cfg.badgeCls}`}
              >
                <cfg.Icon className="h-3 w-3" />
                {cfg.label}
              </Badge>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl bg-muted/30 p-3 sm:grid-cols-2">
            <div className="flex items-start gap-2">
              <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Thời gian thuê
                </p>
                <p className="text-sm font-semibold">
                  {rental.startDate} → {rental.endDate}
                </p>
                {rental.daysLeft !== null && (
                  <p className="mt-0.5 text-xs font-medium text-red-600">
                    ⚠ Còn {rental.daysLeft} ngày để trả!
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
              <div>
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Tiền cọc đang giữ
                </p>
                <p className="text-sm font-semibold text-orange-600">
                  {rental.deposit.toLocaleString()} đ
                </p>
                {rental.status === "completed" && (
                  <p className="mt-0.5 text-xs font-medium text-green-600">
                    ✓ Đã hoàn cọc
                  </p>
                )}
              </div>
            </div>
          </div>

          {rental.status === "active" && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Hạn chót trả đồ:{" "}
              <strong className="ml-1">28/05/2026 – 20:00</strong>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p className="text-base font-bold">
              Phí thuê:{" "}
              <span className="text-primary">
                {rental.totalPrice.toLocaleString()} đ
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              {rental.status === "active" && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-foreground text-background hover:bg-foreground/80"
                    >
                      <Package className="mr-1.5 h-3.5 w-3.5" />
                      Báo cáo trả đồ
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Báo cáo trả đồ</DialogTitle>
                      <DialogDescription>
                        Mô tả tình trạng đồ khi trả để tránh tranh chấp.
                      </DialogDescription>
                    </DialogHeader>
                    <Textarea
                      value={returnNote}
                      onChange={(e) => setReturnNote(e.target.value)}
                      placeholder="VD: Đồ còn nguyên vẹn, đã giặt khô sạch sẽ. Hộp đựng kiếm nguyên xi..."
                      className="min-h-[80px] resize-none"
                    />
                    <DialogFooter>
                      <Button variant="ghost">Hủy</Button>
                      <Button>Xác nhận đã trả đồ</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              {rental.status === "completed" && (
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  Đánh giá
                </Button>
              )}
              {(rental.status === "active" || rental.status === "pending") && (
                <Button size="sm" variant="outline" className="gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5" />
                  Nhắn tin Shop
                </Button>
              )}
              <Button
                asChild
                size="sm"
                variant="ghost"
                className="gap-1.5 text-muted-foreground"
              >
                <Link href={`/rental/${rental.id}`}>
                  <ExternalLink className="h-3.5 w-3.5" />
                  Chi tiết
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export function RentalManagement() {
  const [search, setSearch] = useState("")
  const [rentals, setRentals] = useState<RentalItemType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  React.useEffect(() => {
    async function fetchRentals() {
      try {
        setIsLoading(true)
        setError(null)
        const res = await fetch("/api/rental/bookings")
        if (!res.ok) {
          throw new Error(
            "Không thể kết nối đến hệ thống để tải danh sách đơn thuê"
          )
        }
        const data = await res.json()
        setRentals(data.rentals || [])
      } catch (err) {
        setError((err as Error).message || "Đã xảy ra lỗi")
      } finally {
        setIsLoading(false)
      }
    }
    fetchRentals()
  }, [])

  const counts = {
    all: rentals.length,
    active: rentals.filter((r) => r.status === "active").length,
    pending: rentals.filter((r) => r.status === "pending").length,
    returning: rentals.filter((r) => r.status === "returning").length,
    completed: rentals.filter((r) => r.status === "completed").length,
  }

  const filtered = rentals.filter(
    (r) =>
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.itemName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="border-b border-border/60 bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 py-6 md:px-6">
          <div className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-foreground">
              Trang chủ
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-foreground">
              Quản lý đơn thuê
            </span>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Quản lý Đơn <span className="text-primary">Thuê Đồ</span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Theo dõi lịch thuê, hạn trả đồ và tình trạng tiền cọc.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo mã hoặc tên đồ..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                label: "Đang mượn",
                count: counts.active,
                color: "text-red-600",
              },
              {
                label: "Chờ giao",
                count: counts.pending,
                color: "text-amber-600",
              },
              {
                label: "Đang trả",
                count: counts.returning,
                color: "text-blue-600",
              },
              {
                label: "Đã xong",
                count: counts.completed,
                color: "text-green-600",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border/60 bg-background p-3 text-center"
              >
                <p className={`text-2xl font-extrabold ${s.color}`}>
                  {s.count}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        {isLoading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
            <span className="animate-pulse text-sm text-muted-foreground">
              Đang tải lịch sử đặt thuê...
            </span>
          </div>
        ) : error ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm font-semibold text-destructive">{error}</p>
          </div>
        ) : (
          <Tabs defaultValue="all">
            <TabsList className="mb-6 flex w-full overflow-x-auto sm:inline-flex sm:w-auto">
              <TabsTrigger value="all">Tất cả ({counts.all})</TabsTrigger>
              <TabsTrigger value="active">
                Đang mượn ({counts.active})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Chờ giao ({counts.pending})
              </TabsTrigger>
              <TabsTrigger value="returning">
                Đang trả ({counts.returning})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Xong ({counts.completed})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {filtered.length === 0 ? (
                <p className="py-16 text-center text-muted-foreground">
                  Không tìm thấy đơn thuê nào.
                </p>
              ) : (
                filtered.map((r) => <RentalCard key={r.id} rental={r} />)
              )}
            </TabsContent>
            {(
              ["active", "pending", "returning", "completed"] as RentalStatus[]
            ).map((status) => (
              <TabsContent key={status} value={status} className="space-y-4">
                {filtered
                  .filter((r) => r.status === status)
                  .map((r) => (
                    <RentalCard key={r.id} rental={r} />
                  ))}
              </TabsContent>
            ))}
          </Tabs>
        )}

        <Separator className="my-8" />
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:flex-row">
          <div>
            <p className="text-lg font-bold">Muốn thuê thêm trang phục?</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Khám phá hàng trăm bộ cosplay đang có sẵn.
            </p>
          </div>
          <Button asChild className="shrink-0 rounded-full px-6">
            <Link href="/rental">
              <Plus className="mr-1.5 h-4 w-4" />
              Xem catalog thuê đồ
            </Link>
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  )
}

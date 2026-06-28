"use client"

import type React from "react"
import Link from "next/link"
import {
  Calendar,
  ChevronRight,
  Edit3,
  Mail,
  Package,
  Phone,
  Ruler,
  Scissors,
  Settings,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Footer } from "@/components/home/footer"
import { Navbar } from "@/components/home/navbar"

type ProfileOverviewProps = {
  user: {
    name: string
    email: string
    phone: string | null
    avatar: string | null
    joinDate: string
    stats: {
      orders: number
      measurements: number
      customOrders: number
    }
  }
}

const quickLinks = [
  {
    href: "/profile/edit",
    icon: Edit3,
    title: "Chỉnh sửa thông tin",
    description: "Cập nhật thông tin cá nhân của bạn",
    color: "text-primary",
  },
  {
    href: "/profile/measurements",
    icon: Ruler,
    title: "Quản lý số đo",
    description: "Lưu và chỉnh sửa số đo cơ thể",
    color: "text-primary",
  },
  {
    href: "/profile/orders",
    icon: Package,
    title: "Lịch sử đơn hàng",
    description: "Xem đơn mua, thuê và hoàn tiền",
    color: "text-primary",
  },
  {
    href: "/profile/custom-orders",
    icon: Scissors,
    title: "Đặt may của tôi",
    description: "Nhận báo giá, xem tiến độ và nhắn tin với seller",
    color: "text-primary",
  },
  {
    href: "/change-password",
    icon: Settings,
    title: "Đổi mật khẩu",
    description: "Thay đổi mật khẩu tài khoản",
    color: "text-muted-foreground",
  },
]

export function ProfileOverview({ user }: ProfileOverviewProps) {
  const joinDate = new Date(user.joinDate).toLocaleDateString("vi-VN")

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <div className="border-b border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-5 md:px-6">
          <Breadcrumb className="mb-3">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Thông tin cá nhân</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <h1 className="text-2xl font-extrabold tracking-tight">
            Thông tin cá nhân
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý tài khoản, đơn hàng và các yêu cầu đặt may của bạn.
          </p>
        </div>
      </div>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="border-border/60 lg:col-span-1">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">Hồ sơ</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    asChild
                  >
                    <Link href="/profile/edit">
                      <Edit3 className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback className="bg-primary/10 text-lg font-bold text-primary">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="mt-3 text-lg font-bold">{user.name}</h2>
                  <Badge variant="secondary" className="mt-2 gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    Hoạt động
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <Info icon={Mail} label="Email" value={user.email} />
                  <Info
                    icon={Phone}
                    label="Số điện thoại"
                    value={user.phone ?? "Chưa cập nhật"}
                  />
                  <Info icon={Calendar} label="Tham gia" value={joinDate} />
                </div>

                <Separator />

                <div className="grid grid-cols-3 gap-4 text-center">
                  <Stat label="Đơn hàng" value={user.stats.orders} />
                  <Stat label="Số đo" value={user.stats.measurements} />
                  <Stat label="Đặt may" value={user.stats.customOrders} />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4 lg:col-span-2">
              <h2 className="text-lg font-bold">Quản lý tài khoản</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {quickLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <Link key={link.href} href={link.href}>
                      <Card className="group border-border/60 transition-all hover:border-primary/50 hover:shadow-sm">
                        <CardContent className="flex items-start gap-4 p-5">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <Icon className={`h-6 w-6 ${link.color}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold group-hover:text-primary">
                              {link.title}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {link.description}
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

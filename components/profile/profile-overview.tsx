"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  User,
  Edit3,
  Ruler,
  Package,
  MapPin,
  Mail,
  Phone,
  Calendar,
  ChevronRight,
  Settings,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Navbar } from "@/components/home/navbar"
import { Footer } from "@/components/home/footer"
import { getDefaultAddress, parseSavedAddresses } from "@/lib/profile"

type ProfileResponse = {
  user: {
    name: string
    email: string
    phone: string | null
    avatar: string | null
    createdAt: string
    status: string
    savedAddresses: unknown
  }
  stats: {
    orders: number
    measurements: number
    addresses: number
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
    description: "Xem các đơn hàng đã đặt",
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

export function ProfileOverview() {
  const [data, setData] = useState<ProfileResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadProfile = async () => {
      try {
        const res = await fetch("/api/profile")
        const json = await res.json()
        if (!mounted) return

        if (res.ok) {
          setData(json)
        } else {
          setData(null)
        }
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    loadProfile()

    return () => {
      mounted = false
    }
  }, [])

  const profile = useMemo(() => {
    if (!data) return null

    const savedAddresses = parseSavedAddresses(data.user.savedAddresses)
    const defaultAddress = getDefaultAddress(data.user.savedAddresses)

    return {
      name: data.user.name,
      email: data.user.email,
      phone: data.user.phone || "Chưa cập nhật",
      avatar: data.user.avatar,
      address:
        defaultAddress?.address ||
        savedAddresses[0]?.address ||
        "Chưa cập nhật",
      joinDate: new Intl.DateTimeFormat("vi-VN").format(
        new Date(data.user.createdAt)
      ),
      status:
        data.user.status === "ACTIVE"
          ? "Hoạt động"
          : data.user.status === "SUSPENDED"
            ? "Tạm khóa"
            : data.user.status === "INACTIVE"
              ? "Không hoạt động"
              : "Chờ xác minh",
      stats: data.stats,
    }
  }, [data])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1">
          <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-24 text-sm text-muted-foreground md:px-6">
            Đang tải hồ sơ...
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 px-4 py-24 text-center md:px-6">
            <h1 className="text-2xl font-extrabold tracking-tight">
              Chưa đăng nhập
            </h1>
            <p className="max-w-md text-sm text-muted-foreground">
              Vui lòng đăng nhập để xem và quản lý hồ sơ cá nhân của bạn.
            </p>
            <Button asChild>
              <Link href="/login">Đăng nhập</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

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
            Quản lý thông tin tài khoản và số đo của bạn
          </p>
        </div>
      </div>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Profile Card */}
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
                    <AvatarImage src={profile.avatar || undefined} />
                    <AvatarFallback className="bg-primary/10 text-lg font-bold text-primary">
                      {profile.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="mt-3 text-lg font-bold">{profile.name}</h2>
                  <Badge variant="secondary" className="mt-2 gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    {profile.status}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium">{profile.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">
                        Số điện thoại
                      </p>
                      <p className="font-medium">{profile.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Địa chỉ</p>
                      <p className="font-medium">{profile.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Tham gia</p>
                      <p className="font-medium">{profile.joinDate}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {profile.stats.orders}
                    </p>
                    <p className="text-xs text-muted-foreground">Đơn hàng</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {profile.stats.measurements}
                    </p>
                    <p className="text-xs text-muted-foreground">Số đo</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {profile.stats.addresses}
                    </p>
                    <p className="text-xs text-muted-foreground">Địa chỉ</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <div className="space-y-4 lg:col-span-2">
              <h2 className="text-lg font-bold">Quản lý tài khoản</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {quickLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <Link key={link.href} href={link.href}>
                      <Card className="group border-border/60 transition-all hover:border-primary/50 hover:shadow-sm">
                        <CardContent className="flex items-start gap-4 p-5">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
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

              {/* Recent Activity */}
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-base">Hoạt động gần đây</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        action: "Đặt may mới",
                        detail: "Genshin Impact – Raiden Shogun",
                        time: "2 giờ trước",
                        icon: Package,
                      },
                      {
                        action: "Cập nhật số đo",
                        detail: "Số đo mặc định",
                        time: "1 ngày trước",
                        icon: Ruler,
                      },
                      {
                        action: "Chỉnh sửa thông tin",
                        detail: "Cập nhật thông tin hồ sơ",
                        time: "3 ngày trước",
                        icon: User,
                      },
                    ].map((activity, i) => {
                      const Icon = activity.icon
                      return (
                        <div key={i} className="flex items-start gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {activity.action}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {activity.detail}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {activity.time}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

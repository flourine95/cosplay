"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Menu } from "lucide-react"
import { useState } from "react"
import { sellerNavItems } from "./seller-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

// NavLinks component extracted outside to avoid creating during render
function NavLinks({
  pathname,
  onLinkClick,
}: {
  pathname: string
  onLinkClick?: () => void
}) {
  return (
    <nav className="space-y-1">
      {sellerNavItems.map((item) => {
        const active = pathname === item.href
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onLinkClick}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export function SellerShellNew({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Seller Mode Indicator - Top border with stronger color */}
      <div className="h-1 bg-primary" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-4 md:px-6">
          {/* Mobile menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-full flex-col">
                <div className="border-b border-border/60 p-6">
                  <Link
                    href="/seller"
                    className="flex items-center gap-2.5"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-xl font-extrabold tracking-tight text-primary">
                        cosplay
                      </span>
                      <span className="text-xl font-extrabold tracking-tight text-foreground">
                        .vn
                      </span>
                    </div>
                    <div className="h-4 w-px bg-border" />
                    <span className="text-xs font-semibold text-muted-foreground">
                      Seller
                    </span>
                  </Link>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <NavLinks
                    pathname={pathname}
                    onLinkClick={() => setMobileMenuOpen(false)}
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/seller" className="flex items-center gap-2.5">
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl font-extrabold tracking-tight text-primary">
                cosplay
              </span>
              <span className="text-xl font-extrabold tracking-tight text-foreground">
                .vn
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <span className="text-xs font-semibold text-muted-foreground">
              Seller
            </span>
          </Link>

          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-[10px]"
                  >
                    3
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto">
                  <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                    <p className="text-sm font-semibold">
                      Đơn hàng mới #ORD-001
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Bạn có đơn hàng mới cần xử lý
                    </p>
                    <p className="text-xs text-muted-foreground">
                      2 phút trước
                    </p>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                    <p className="text-sm font-semibold">Yêu cầu đặt may mới</p>
                    <p className="text-xs text-muted-foreground">
                      Khách hàng gửi yêu cầu đặt may
                    </p>
                    <p className="text-xs text-muted-foreground">1 giờ trước</p>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                    <p className="text-sm font-semibold">
                      Đơn thuê sắp hết hạn
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Đơn #RENT-123 cần nhận lại hôm nay
                    </p>
                    <p className="text-xs text-muted-foreground">3 giờ trước</p>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center text-xs font-medium text-primary">
                  Xem tất cả thông báo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src="https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=400&fit=crop" />
                    <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                      S
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium sm:inline-block">
                    cosplay.vn
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Thông tin cửa hàng</DropdownMenuItem>
                <DropdownMenuItem>Cài đặt</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 border-r border-border/60 bg-muted/30 lg:block">
          <div className="sticky top-16 p-4">
            <NavLinks pathname={pathname} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}

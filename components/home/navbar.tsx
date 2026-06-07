"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ShoppingCart,
  Search,
  Menu,
  User,
  LogOut,
  Settings,
  Package,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/stores/auth-store"

const navLinks = [
  { label: "Mua ngay", href: "/products" },
  { label: "Đặt may", href: "/custom-order" },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { totalItems } = useCart()
  const { user, logout, isLoading } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-foreground">
            cosplay<span className="text-primary">.vn</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Tìm kiếm"
            className="hidden md:flex"
            asChild
          >
            <Link href="/search">
              <Search />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Giỏ hàng"
            asChild
          >
            <Link href="/cart">
              <ShoppingCart />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 size-4 justify-center border-0 bg-primary p-0 text-[11px]">
                  {totalItems > 99 ? "99+" : totalItems}
                </Badge>
              )}
            </Link>
          </Button>

          {/* Auth area */}
          {!isLoading &&
            (user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden rounded-full md:flex"
                    aria-label="Tài khoản"
                  >
                    <Avatar className="size-8">
                      <AvatarImage src={user.avatar ?? undefined} />
                      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold text-foreground">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 size-4" />
                      Hồ sơ
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile/orders">
                      <Package className="mr-2 size-4" />
                      Đơn hàng
                    </Link>
                  </DropdownMenuItem>
                  {(user.role === "SELLER" || user.role === "ADMIN") && (
                    <DropdownMenuItem asChild>
                      <Link href="/seller">
                        <Settings className="mr-2 size-4" />
                        Seller Center
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === "ADMIN" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <Settings className="mr-2 size-4" />
                        Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => logout()}
                  >
                    <LogOut className="mr-2 size-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                className="hidden rounded-full md:flex"
                size="sm"
                asChild
              >
                <Link href="/login">Đăng nhập</Link>
              </Button>
            ))}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Mở menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu />
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <div className="flex items-center gap-2 pb-4">
            <span className="text-lg font-bold text-foreground">
              cosplay<span className="text-primary">.vn</span>
            </span>
          </div>
          <Separator />
          <nav className="flex flex-col gap-1 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/search"
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Tìm kiếm
            </Link>
            <Link
              href="/cart"
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Giỏ hàng {totalItems > 0 && `(${totalItems})`}
            </Link>
            {user && (
              <>
                <Separator className="my-2" />
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  Hồ sơ
                </Link>
                <Link
                  href="/profile/orders"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  Đơn hàng
                </Link>
                {(user.role === "SELLER" || user.role === "ADMIN") && (
                  <Link
                    href="/seller"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    Seller Center
                  </Link>
                )}
              </>
            )}
          </nav>
          <div className="mt-4">
            {user ? (
              <Button
                variant="outline"
                className="w-full rounded-full"
                onClick={() => {
                  logout()
                  setMobileOpen(false)
                }}
              >
                <LogOut className="mr-2 size-4" />
                Đăng xuất
              </Button>
            ) : (
              <Button variant="outline" className="w-full rounded-full" asChild>
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  Đăng nhập
                </Link>
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}

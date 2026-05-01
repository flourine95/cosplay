"use client"

import { useState } from "react"
import Link from "next/link"
import { ShoppingCart, Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/cart-context"

const navLinks = [
  { label: "Mua ngay", href: "/products" },
  { label: "Thuê trang phục", href: "/products?service=rent" },
  { label: "Đặt may", href: "#custom" },
  { label: "Bộ sưu tập", href: "/products" },
  { label: "Blog", href: "#blog" },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { totalItems } = useCart()

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
          <Link href="/search" className="hidden md:flex">
            <Button variant="ghost" size="icon" aria-label="Tìm kiếm">
              <Search />
            </Button>
          </Link>
          <Link href="/cart">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Giỏ hàng"
            >
              <ShoppingCart />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 size-4 justify-center border-0 bg-primary p-0 text-[10px]">
                  {totalItems > 99 ? "99+" : totalItems}
                </Badge>
              )}
            </Button>
          </Link>
          <Button
            variant="outline"
            className="hidden rounded-full md:flex"
            size="sm"
          >
            <Link href="/login">Đăng nhập</Link>
          </Button>
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
          </nav>
          <div className="mt-4">
            <Button variant="outline" className="w-full rounded-full">
              <Link href="/login">Đăng nhập</Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}

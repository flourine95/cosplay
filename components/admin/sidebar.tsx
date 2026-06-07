"use client"

import {
  LayoutDashboard,
  Users,
  Store,
  ShoppingCart,
  Receipt,
  Grid,
  Percent,
  DollarSign,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const menuItems = [
  { label: "Tổng quan", icon: LayoutDashboard, href: "/admin" },
  { label: "Quản lý User", icon: Users, href: "/admin/users" },
  { label: "Quản lý Seller", icon: Store, href: "/admin/sellers" },
  { label: "Quản lý đơn hàng", icon: ShoppingCart, href: "/admin/orders" },
  { label: "Quản lý hóa đơn", icon: Receipt, href: "/admin/invoices" },
  { label: "Quản lý danh mục", icon: Grid, href: "/admin/categories" },
  { label: "Quản lý phí sàn", icon: Percent, href: "/admin/fees" },
  { label: "Quản lý doanh thu", icon: DollarSign, href: "/admin/revenue" },
  { label: "Thống kê", icon: BarChart3, href: "/admin/stats" },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 border-r border-border/60 bg-muted/30 lg:block">
      <div className="sticky top-16 p-4">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

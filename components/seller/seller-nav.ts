import {
  BarChart3,
  CalendarDays,
  DollarSign,
  FileText,
  Gauge,
  MessageSquare,
  Package,
  Scissors,
  ShoppingBag,
} from "lucide-react"

export const sellerNavItems = [
  { title: "Tổng quan", href: "/seller", icon: Gauge },
  { title: "Quản lý sản phẩm", href: "/seller/products", icon: Package },
  { title: "Đơn mua & Thuê", href: "/seller/orders", icon: ShoppingBag },
  { title: "Tin nhắn", href: "/seller/messages", icon: MessageSquare },
  { title: "Lịch trình thuê", href: "/seller/calendar", icon: CalendarDays },
  { title: "Quản lý đặt may", href: "/seller/tailoring", icon: Scissors },
  { title: "Báo giá", href: "/seller/quotes", icon: FileText },
  { title: "Quản lý tài chính", href: "/seller/revenue", icon: DollarSign },
  { title: "Thống kê", href: "/seller/statistics", icon: BarChart3 },
]

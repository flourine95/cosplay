import {
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  DollarSign,
  FileText,
  Gauge,
  MessageSquare,
  Package,
  Scissors,
  ShoppingBag,
  UserCircle,
} from "lucide-react"

export const sellerNavItems = [
  { title: "Tổng quan", href: "/seller", icon: Gauge },
  { title: "Hồ sơ seller", href: "/seller/profile", icon: UserCircle },
  { title: "Quản lý sản phẩm", href: "/seller/products", icon: Package },
  { title: "Đơn mua & thuê", href: "/seller/orders", icon: ShoppingBag },
  { title: "Quản lý đơn thuê", href: "/seller/rentals", icon: CalendarDays },
  { title: "Tin nhắn", href: "/seller/messages", icon: MessageSquare },
  { title: "Lịch trình thuê", href: "/seller/calendar", icon: CalendarDays },
  {
    title: "Nhận đặt may",
    href: "/seller/tailoring/requests",
    icon: ClipboardCheck,
  },
  { title: "Quản lý đặt may", href: "/seller/tailoring", icon: Scissors },
  { title: "Báo giá", href: "/seller/quotes", icon: FileText },
  { title: "Quản lý tài chính", href: "/seller/revenue", icon: DollarSign },
  { title: "Thống kê", href: "/seller/statistics", icon: BarChart3 },
]

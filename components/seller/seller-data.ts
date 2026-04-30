import {
  BarChart3,
  Bell,
  CalendarDays,
  ClipboardList,
  DollarSign,
  FileText,
  Gauge,
  Package,
  Search,
  Settings,
  ShoppingBag,
  Star,
  Truck,
  Wallet,
} from "lucide-react"

export const sellerNavItems = [
  { title: "Dashboard seller", href: "/seller", icon: Gauge },
  { title: "Quản lý sản phẩm", href: "/seller/products", icon: Package },
  { title: "Tiếp nhận đơn hàng", href: "/seller/orders", icon: ClipboardList },
  { title: "Báo giá đơn hàng", href: "/seller/quotes", icon: FileText },
  { title: "Quản lý lịch thuê", href: "/seller/calendar", icon: CalendarDays },
  { title: "Quản lý doanh thu", href: "/seller/revenue", icon: DollarSign },
  { title: "Thống kê seller", href: "/seller/statistics", icon: BarChart3 },
]

export const sellerTopStats = [
  {
    label: "Đơn đã giao",
    value: "26.450",
    icon: ShoppingBag,
    color: "bg-sky-500",
    sub: "+12.5%",
  },
  {
    label: "Đánh giá hài lòng",
    value: "95%",
    icon: Star,
    color: "bg-teal-500",
    sub: "4.8/5",
  },
  {
    label: "Số dư hiện tại",
    value: "128.560.800đ",
    icon: Wallet,
    color: "bg-amber-400",
    sub: "+8.2M",
  },
]

export const sellerKpis = [
  { label: "Đơn mới", value: "18", note: "4 đơn cần xác nhận", tone: "hot" },
  { label: "Đang thuê", value: "42", note: "8 đơn sắp trả", tone: "info" },
  {
    label: "Doanh thu tháng",
    value: "128.5M",
    note: "+12% so với tháng trước",
    tone: "success",
  },
  {
    label: "Tỉ lệ báo giá",
    value: "96%",
    note: "Trung bình 18 phút",
    tone: "warning",
  },
]

export const sellerProducts = [
  {
    name: "Đầm công chúa ",
    sku: "SP-001",
    category: "Váy Ngắn",
    stock: 12,
    rented: 8,
    status: "Đang cho thuê",
    price: 120000,
    priceLabel: "120.000đ/ngày",
  },
  {
    name: "Đầm cổ áo polo",
    sku: "SP-002",
    category: "Váy dài",
    stock: 5,
    rented: 2,
    status: "Còn hàng",
    price: 180000,
    priceLabel: "180.000đ/ngày",
  },
  {
    name: "Đầm dáng ôm",
    sku: "SP-003",
    category: "Bộ đồ hầu gái",
    stock: 20,
    rented: 14,
    status: "Bảo trì",
    price: 90000,
    priceLabel: "90.000đ/ngày",
  },
  {
    name: "Đầm đuôi cá",
    sku: "SP-004",
    category: "Đầm",
    stock: 9,
    rented: 3,
    status: "Còn hàng",
    price: 150000,
    priceLabel: "150.000đ/ngày",
  },
  {
    name: "váy cosplay",
    sku: "SP-005",
    category: "Váy cưới",
    stock: 7,
    rented: 4,
    status: "Đang cho thuê",
    price: 210000,
    priceLabel: "210.000đ/ngày",
  },
]

export const sellerOrders = [
  {
    id: "DH-1024",
    customer: "Nguyễn Minh Anh",
    phone: "0901 222 333",
    item: "Đầm công chúa ",
    date: "29/04/2026",
    totalAmount: 360000,
    total: "360.000đ",
    status: "Chờ xác nhận",
    avatar: "A",
  },
  {
    id: "DH-1025",
    customer: "Trần Quốc Huy",
    phone: "0918 444 555",
    item: "Đầm cổ áo polo",
    date: "30/04/2026",
    totalAmount: 630000,
    total: "630.000đ",
    status: "Đã báo giá",
    avatar: "H",
  },
  {
    id: "DH-1026",
    customer: "Lê Bảo Ngọc",
    phone: "0932 666 777",
    item: "Đầm dáng ôm",
    date: "01/05/2026",
    totalAmount: 540000,
    total: "540.000đ",
    status: "Đang giao",
    avatar: "N",
  },
  {
    id: "DH-1027",
    customer: "Phạm Gia Hân",
    phone: "0987 888 999",
    item: "Đầm đuôi cá",
    date: "02/05/2026",
    totalAmount: 300000,
    total: "300.000đ",
    status: "Đặt cọc",
    avatar: "G",
  },
  {
    id: "DH-1028",
    customer: "Hoàng Nam",
    phone: "0905 555 222",
    item: "váy cosplay",
    date: "03/05/2026",
    totalAmount: 840000,
    total: "840.000đ",
    status: "Đang thuê",
    avatar: "N",
  },
]

export const orderDetails = [
  { name: "Đầm công chúa", desc: "Thuê 3 ngày · ", qty: "2 món" },
  { name: "Đầm đuôi cá", desc: "Giao tại công ty", qty: "1 bộ" },
  { name: "váy cosplay", desc: "Kèm phụ kiện", qty: "1 món" },
  { name: "Đầm cổ áo polo", desc: "Yêu cầu đặt cọc", qty: "1 món" },
]

export const rentalSchedules = [
  {
    date: "29/04/2026",
    title: "Đầm công chúa",
    time: "09:00",
    customer: "Nguyễn Minh Anh",
    type: "Giao hàng",
    status: "Đang giao",
  },
  {
    date: "30/04/2026",
    title: "váy cosplay",
    time: "15:30",
    customer: "Trần Quốc Huy",
    type: "Nhận trả",
    status: "Theo dõi",
  },
  {
    date: "02/05/2026",
    title: "Đầm đuôi cá",
    time: "10:00",
    customer: "Kho nội bộ",
    type: "Bảo trì",
    status: "Bảo trì",
  },
  {
    date: "03/05/2026",
    title: "Đầm cổ áo polo",
    time: "08:15",
    customer: "Hoàng Nam",
    type: "Giao hàng",
    status: "Chờ xác nhận",
  },
]
export const quotes = [
  {
    id: 1,
    code: "BG001",
    customerName: "Nguyễn Văn A",
    productName: "Váy dạ hội đỏ",
    rentalDays: 3,
    deposit: 500000,
    total: 1100000,
    status: "Chờ xác nhận",
  },
  {
    id: 2,
    code: "BG002",
    customerName: "Trần Thị B",
    productName: "Bộ vest nam",
    rentalDays: 2,
    deposit: 300000,
    total: 700000,
    status: "Đã chốt",
  },
]

export const revenueRows = [
  {
    label: "Doanh thu thuê",
    value: "98.2M",
    change: "+10.4%",
    note: "Từ 68 đơn hoàn tất",
  },
  {
    label: "Phí vận chuyển",
    value: "12.4M",
    change: "+3.1%",
    note: "Giao/nhận trong tháng",
  },
  {
    label: "Tiền cọc giữ",
    value: "17.9M",
    change: "-2.0%",
    note: "Đang giữ theo hợp đồng",
  },
]

export const statisticRows = [
  {
    label: "Sản phẩm được thuê nhiều",
    value: "váy cosplay",
    note: "18 lượt thuê",
  },
  {
    label: "Khách hàng quay lại",
    value: "34%",
    note: "+5% so với tháng trước",
  },
  { label: "Đơn bị huỷ", value: "3.2%", note: "Cần kiểm tra lý do huỷ" },
  {
    label: "Thời gian xử lý trung bình",
    value: "18 phút",
    note: "Từ lúc nhận đơn đến báo giá",
  },
]

export const quickActions = [Search, Bell, Settings, Truck]

// Utility functions for date parsing and sorting
export function parseDateString(dateStr: string): Date {
  const [day, month, year] = dateStr.split("/").map(Number)
  return new Date(year, month - 1, day)
}

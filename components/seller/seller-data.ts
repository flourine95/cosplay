import {
  BarChart3,
  Bell,
  CalendarDays,
  DollarSign,
  Gauge,
  MessageSquare,
  Package,
  Scissors,
  Search,
  Settings,
  ShoppingBag,
  Star,
  Truck,
  Wallet,
} from "lucide-react"
import { TailoringOrder } from "./section/tailoring-section"

export const sellerNavItems = [
  { title: "Tổng quan", href: "/seller", icon: Gauge },
  { title: "Quản lý sản phẩm", href: "/seller/products", icon: Package },
  { title: "Đơn mua & Thuê", href: "/seller/orders", icon: ShoppingBag },
  { title: "Tin nhắn", href: "/seller/messages", icon: MessageSquare },
  { title: "Lịch trình thuê", href: "/seller/calendar", icon: CalendarDays },
  { title: "Quản lý đặt may", href: "/seller/tailoring", icon: Scissors },
  { title: "Quản lý tài chính", href: "/seller/revenue", icon: DollarSign },
  { title: "Thống kê", href: "/seller/statistics", icon: BarChart3 },
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
    color: "bg-primary",
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
    name: "Đầm công chúa Dạ Hội",
    sku: "SP-001",
    category: "Váy Dạ Hội",
    businessTypes: ["Bán", "Thuê"], // Hỗ trợ cả 2
    stock: 12,
    rented: 8,
    status: "Hoạt động",
    basePrice: "Bán: 850k | Thuê: 120k/ngày",
    image:
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=400&fit=crop",
  },
  {
    name: "Set Hầu gái phong cách Nhật",
    sku: "SP-003",
    category: "Maid",
    businessTypes: ["Thuê"], // Chỉ cho thuê
    stock: 20,
    rented: 14,
    status: "Bảo trì",
    basePrice: "Thuê: 90k/ngày",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop",
  },
  {
    name: "Áo Cosplay Chiến Binh (May theo số đo)",
    sku: "SP-005",
    category: "Armor/Giáp",
    businessTypes: ["May đo"], // Chỉ nhận may
    stock: "N/A", // Đồ may thì không có tồn kho cố định
    rented: 0,
    status: "Hoạt động",
    basePrice: "Từ 1.200.000đ",
    image:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=400&fit=crop",
  },
]

export const sellerOrders = [
  {
    id: "DH-1024",
    customer: "Nguyễn Minh Anh",
    phone: "0901 222 333",
    item: "Đầm công chúa Dạ Hội",
    orderType: "Thuê", // Loại đơn
    rentalDates: "29/04 - 01/05/2026", // Thời gian thuê
    deposit: "500.000đ", // Tiền cọc giữ đồ
    totalAmount: 360000,
    total: "360.000đ",
    status: "Chờ xác nhận",
    avatar: "A",
  },
  {
    id: "DH-1029",
    customer: "Trần Hữu Khang",
    phone: "0988 111 222",
    item: "Phụ kiện Tóc giả (Wig)",
    orderType: "Bán đứt", // Đơn mua đứt
    rentalDates: "N/A", // Mua đứt thì không có ngày thuê
    deposit: "0đ", // Mua đứt không có cọc
    totalAmount: 250000,
    total: "250.000đ",
    status: "Đang giao",
    avatar: "K",
  },
  {
    id: "DH-1028",
    customer: "Hoàng Nam",
    phone: "0905 555 222",
    item: "Set Hầu gái phong cách Nhật",
    orderType: "Thuê",
    rentalDates: "25/04 - 28/04/2026",
    deposit: "300.000đ",
    totalAmount: 270000,
    total: "270.000đ",
    status: "Đang thuê", // Trạng thái này sẽ kích hoạt nút "Nhận lại đồ"
    avatar: "N",
  },
  {
    id: "DH-1030",
    customer: "Lê Bảo Ngọc",
    phone: "0932 666 777",
    item: "Áo Cosplay Học Sinh",
    orderType: "Bán đứt",
    rentalDates: "N/A",
    deposit: "0đ",
    totalAmount: 540000,
    total: "540.000đ",
    status: "Hoàn tất",
    avatar: "N",
  },
]

export const orderDetails = [
  { name: "Đầm công chúa", desc: "Thuê 3 ngày · ", qty: "2 món" },
  { name: "Đầm đuôi cá", desc: "Giao tại công ty", qty: "1 bộ" },
  { name: "váy cosplay", desc: "Kèm phụ kiện", qty: "1 món" },
  { name: "Đầm cổ áo polo", desc: "Yêu cầu đặt cọc", qty: "1 món" },
]

export const tailoringOrders: TailoringOrder[] = [
  {
    id: "TAIL-001",
    customer: "Nguyễn Lan",
    item: "Áo Cosplay Venti (Genshin Impact)",
    note: "Dùng vải lụa mờ, giao trong 14 ngày. Cần làm phồng tay áo.",
    status: "Chờ báo giá", // Trạng thái 1
    measurements: {
      "Vòng ngực": "88 cm",
      "Vòng eo": "66 cm",
      "Vòng hông": "94 cm",
      "Chiều cao": "165 cm",
      "Rộng vai": "38 cm",
    },
    references: [
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=400&fit=crop",
    ],
    timeline: [
      { label: "Đã nhận yêu cầu", done: true },
      { label: "Đã cắt vải", done: false },
      { label: "Đang may ráp", done: false },
      { label: "Đính kết phụ kiện", done: false },
      { label: "Hoàn thiện", done: false },
    ],
    changeRequests: [],
  },
  {
    id: "TAIL-002",
    customer: "Trần Hữu Khang",
    item: "Giáp tay Iron Man",
    note: "In 3D, sơn tĩnh điện màu đỏ cherry.",
    status: "Đang gia công", // Trạng thái 2
    measurements: {
      "Vòng bắp tay": "32 cm",
      "Cổ tay": "18 cm",
      "Chiều dài tay": "55 cm",
    },
    references: [
      "https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=400&h=400&fit=crop",
    ],
    timeline: [
      { label: "Đã nhận yêu cầu", done: true },
      { label: "Đã in 3D xong base", done: true },
      { label: "Đang chà nhám & sơn", done: false },
      { label: "Phủ bóng hoàn thiện", done: false },
    ],
    changeRequests: [],
  },
  {
    id: "TAIL-003",
    customer: "Lê Bảo Ngọc",
    item: "Váy công chúa Lolita",
    note: "Váy xòe nhiều tầng, viền ren trắng.",
    status: "Yêu cầu chỉnh sửa", // Trạng thái 3
    measurements: {
      "Vòng ngực": "82 cm",
      "Vòng eo": "60 cm",
      "Chiều dài váy": "90 cm",
    },
    references: [
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop",
    ],
    timeline: [
      { label: "Đã nhận yêu cầu", done: true },
      { label: "Đã cắt vải", done: true },
      { label: "Đang may ráp", done: true },
      { label: "Gửi ảnh fitting", done: true },
    ],
    changeRequests: [
      {
        text: "Phần eo hơi rộng so với mình, shop bóp vào 2cm giúp mình nhé. Ren chân váy cho dài thêm 5cm được không ạ?",
        time: "2 giờ trước",
      },
    ],
  },
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

export const quickActions = [Search, Bell, Settings, Truck]

// Utility functions for date parsing and sorting
export function parseDateString(dateStr: string): Date {
  const parts = dateStr.split("/").map(Number)
  const day = parts[0] ?? 1
  const month = parts[1] ?? 1
  const year = parts[2] ?? 2000
  return new Date(year, month - 1, day)
}

export const financialStats = [
  {
    label: "Số dư có thể rút",
    value: "45.200.000đ",
    note: "Tiền doanh thu đã hoàn tất",
    color: "text-emerald-600",
    bg: "bg-emerald-100",
  },
  {
    label: "Chờ đối soát",
    value: "12.800.000đ",
    note: "Tiền từ đơn đang giao/chưa hoàn tất",
    color: "text-sky-600",
    bg: "bg-sky-100",
  },
  {
    label: "Tiền cọc đang giữ",
    value: "18.500.000đ",
    note: "Phải trả lại khách khi nhận đồ",
    color: "text-amber-600",
    bg: "bg-amber-100",
  },
]

export const transactionHistory = [
  {
    id: "GD-001",
    date: "30/04/2026 14:20",
    content: "Khách Nguyễn Lan thanh toán cọc may áo Venti",
    type: "in",
    amount: "+500.000đ",
    status: "Thành công",
  },
  {
    id: "GD-002",
    date: "29/04/2026 09:15",
    content: "Hoàn cọc đơn thuê DH-1028 cho Hoàng Nam",
    type: "out",
    amount: "-300.000đ",
    status: "Thành công",
  },
  {
    id: "GD-003",
    date: "28/04/2026 16:45",
    content: "Yêu cầu rút tiền về Vietcombank",
    type: "withdraw",
    amount: "-10.000.000đ",
    status: "Đang xử lý",
  },
  {
    id: "GD-004",
    date: "28/04/2026 10:00",
    content: "Thanh toán đơn mua đứt DH-1029",
    type: "in",
    amount: "+250.000đ",
    status: "Thành công",
  },
  {
    id: "GD-005",
    date: "27/04/2026 15:30",
    content: "Trừ cọc đơn thuê DH-1025 (Hư hỏng nhẹ)",
    type: "penalty",
    amount: "+50.000đ",
    status: "Thành công",
  },
]

export const topMetrics = [
  {
    label: "Tổng doanh thu tháng",
    value: "145.800.000đ",
    trend: "+12.5%",
    isUp: true,
  },
  {
    label: "Tổng đơn thành công",
    value: "342 đơn",
    trend: "+8.4%",
    isUp: true,
  },
  {
    label: "Tỷ lệ hủy/hoàn cọc lỗi",
    value: "2.1%",
    trend: "-0.5%",
    isUp: true,
  }, // Hủy giảm là tốt (isUp: true dùng để tô màu xanh)
]

export const revenueByModel = [
  {
    model: "Bán đứt",
    percent: 45,
    amount: "65.610.000đ",
    color: "bg-emerald-500",
    text: "text-emerald-700",
    bgLight: "bg-emerald-50",
  },
  {
    model: "Cho thuê",
    percent: 35,
    amount: "51.030.000đ",
    color: "bg-sky-500",
    text: "text-sky-700",
    bgLight: "bg-sky-50",
  },
  {
    model: "Đặt may đo",
    percent: 20,
    amount: "29.160.000đ",
    color: "bg-purple-500",
    text: "text-purple-700",
    bgLight: "bg-purple-50",
  },
]

export const topProducts = [
  {
    name: "Đầm công chúa Dạ Hội",
    type: "Thuê nhiều nhất",
    value: "45 lượt thuê",
    rev: "15.5M",
  },
  {
    name: "Áo Cosplay Venti",
    type: "May nhiều nhất",
    value: "8 đơn đặt",
    rev: "24.0M",
  },
  {
    name: "Phụ kiện Tóc giả (Wig)",
    type: "Bán chạy nhất",
    value: "124 cái",
    rev: "31.0M",
  },
]

// Messaging data
export interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: string
  isRead: boolean
  attachments?: { type: "image" | "file"; url: string; name?: string }[]
}

export interface Conversation {
  id: string
  customerId: string
  customerName: string
  customerAvatar?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  orderId?: string
  orderType?: string
  status: "active" | "archived"
}

export const conversations: Conversation[] = [
  {
    id: "CONV-001",
    customerId: "CUST-001",
    customerName: "Nguyễn Lan",
    customerAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    lastMessage: "Cho em hỏi áo Venti có thể giao trước ngày 15 không ạ?",
    lastMessageTime: "2 phút trước",
    unreadCount: 2,
    orderId: "TAIL-001",
    orderType: "Đặt may",
    status: "active",
  },
  {
    id: "CONV-002",
    customerId: "CUST-002",
    customerName: "Trần Hữu Khang",
    customerAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    lastMessage: "Shop ơi, giáp tay đã sơn xong chưa ạ?",
    lastMessageTime: "15 phút trước",
    unreadCount: 1,
    orderId: "TAIL-002",
    orderType: "Đặt may",
    status: "active",
  },
  {
    id: "CONV-003",
    customerId: "CUST-003",
    customerName: "Lê Bảo Ngọc",
    customerAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    lastMessage: "Váy đã vừa rồi ạ, cảm ơn shop nhiều!",
    lastMessageTime: "1 giờ trước",
    unreadCount: 0,
    orderId: "TAIL-003",
    orderType: "Đặt may",
    status: "active",
  },
  {
    id: "CONV-004",
    customerId: "CUST-004",
    customerName: "Nguyễn Minh Anh",
    customerAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
    lastMessage: "Em muốn thuê thêm 1 ngày nữa được không ạ?",
    lastMessageTime: "3 giờ trước",
    unreadCount: 0,
    orderId: "DH-1024",
    orderType: "Thuê",
    status: "active",
  },
  {
    id: "CONV-005",
    customerId: "CUST-005",
    customerName: "Hoàng Nam",
    customerAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    lastMessage: "Đồ em sẽ trả vào chiều mai nhé shop",
    lastMessageTime: "5 giờ trước",
    unreadCount: 0,
    orderId: "DH-1028",
    orderType: "Thuê",
    status: "active",
  },
]

export const messagesByConversation: Record<string, Message[]> = {
  "CONV-001": [
    {
      id: "MSG-001",
      senderId: "CUST-001",
      senderName: "Nguyễn Lan",
      senderAvatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      content: "Chào shop, em đã gửi yêu cầu đặt may áo Venti rồi ạ",
      timestamp: "10:30 AM",
      isRead: true,
    },
    {
      id: "MSG-002",
      senderId: "SELLER",
      senderName: "cosplay.vn",
      content:
        "Chào em! Shop đã nhận được yêu cầu rồi nhé. Shop sẽ báo giá trong vòng 2 giờ.",
      timestamp: "10:35 AM",
      isRead: true,
    },
    {
      id: "MSG-003",
      senderId: "SELLER",
      senderName: "cosplay.vn",
      content:
        "Em xem báo giá này nhé: Tổng 1.200.000đ, thời gian hoàn thành 14 ngày. Em đồng ý shop sẽ bắt đầu làm ngay.",
      timestamp: "12:15 PM",
      isRead: true,
    },
    {
      id: "MSG-004",
      senderId: "CUST-001",
      senderName: "Nguyễn Lan",
      senderAvatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      content: "Vâng em đồng ý ạ. Nhưng cho em hỏi thêm...",
      timestamp: "12:20 PM",
      isRead: true,
    },
    {
      id: "MSG-005",
      senderId: "CUST-001",
      senderName: "Nguyễn Lan",
      senderAvatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      content: "Cho em hỏi áo Venti có thể giao trước ngày 15 không ạ?",
      timestamp: "12:21 PM",
      isRead: false,
    },
  ],
  "CONV-002": [
    {
      id: "MSG-006",
      senderId: "CUST-002",
      senderName: "Trần Hữu Khang",
      senderAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      content: "Chào shop, giáp tay Iron Man của em đang ở bước nào rồi ạ?",
      timestamp: "9:00 AM",
      isRead: true,
    },
    {
      id: "MSG-007",
      senderId: "SELLER",
      senderName: "cosplay.vn",
      content:
        "Chào anh! Hiện tại shop đã in 3D xong và đang trong giai đoạn chà nhám để chuẩn bị sơn.",
      timestamp: "9:15 AM",
      isRead: true,
    },
    {
      id: "MSG-008",
      senderId: "SELLER",
      senderName: "cosplay.vn",
      content: "Dự kiến 2-3 ngày nữa sẽ hoàn thành phần sơn nhé anh.",
      timestamp: "9:16 AM",
      isRead: true,
      attachments: [
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=400&h=400&fit=crop",
          name: "progress-1.jpg",
        },
      ],
    },
    {
      id: "MSG-009",
      senderId: "CUST-002",
      senderName: "Trần Hữu Khang",
      senderAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      content: "Shop ơi, giáp tay đã sơn xong chưa ạ?",
      timestamp: "11:45 AM",
      isRead: false,
    },
  ],
  "CONV-003": [
    {
      id: "MSG-010",
      senderId: "CUST-003",
      senderName: "Lê Bảo Ngọc",
      senderAvatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      content:
        "Shop ơi, phần eo hơi rộng so với em, shop bóp vào 2cm giúp em nhé",
      timestamp: "8:30 AM",
      isRead: true,
    },
    {
      id: "MSG-011",
      senderId: "SELLER",
      senderName: "cosplay.vn",
      content:
        "Dạ được ạ, shop sẽ chỉnh lại phần eo. Em có muốn thay đổi gì thêm không?",
      timestamp: "8:45 AM",
      isRead: true,
    },
    {
      id: "MSG-012",
      senderId: "CUST-003",
      senderName: "Lê Bảo Ngọc",
      senderAvatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      content: "Váy đã vừa rồi ạ, cảm ơn shop nhiều!",
      timestamp: "11:00 AM",
      isRead: true,
    },
  ],
}

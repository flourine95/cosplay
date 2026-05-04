// ─── Recent Orders (Hero section) ───────────────────────────────────────────

export const recentOrders = [
  {
    name: "Nezuko Kamado",
    series: "Demon Slayer",
    type: "Đặt may",
    time: "2 phút",
  },
  { name: "Rem", series: "Re:Zero", type: "Thuê 3 ngày", time: "15 phút" },
  { name: "Hu Tao", series: "Genshin Impact", type: "Mua", time: "1 giờ" },
]

// ─── Services ────────────────────────────────────────────────────────────────

export const services = [
  {
    id: "buy",
    label: "01 — Mua",
    title: "Sở hữu ngay",
    desc: "Đa dạng size, giao hàng 2–5 ngày toàn quốc. Đổi trả 7 ngày nếu không vừa.",
    cta: "Mua ngay",
    href: "/products",
    image:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=800&fit=crop",
    detail: "Từ 350K",
  },
  {
    id: "rent",
    label: "02 — Thuê",
    title: "Thuê theo ngày",
    desc: "Phù hợp cho sự kiện, hội thi, chụp ảnh. Đặt cọc 30%, giao nhận tận nơi HCM & HN.",
    cta: "Xem để thuê",
    href: "/rental/1",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop",
    detail: "Từ 99K/ngày",
  },
  {
    id: "custom",
    label: "03 — Đặt may",
    title: "May theo số đo",
    desc: "Thợ chuyên nghiệp, theo đúng thiết kế bạn muốn. Cập nhật tiến độ qua Zalo.",
    cta: "Đặt may ngay",
    href: "/custom-order",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=800&fit=crop",
    detail: "7–14 ngày",
  },
]

// ─── Categories ──────────────────────────────────────────────────────────────

export const mobileCats = [
  {
    name: "Anime",
    count: "180+ bộ",
    href: "/products?category=anime",
    image:
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&h=400&fit=crop",
  },
  {
    name: "Game",
    count: "120+ bộ",
    href: "/products?category=game",
    image:
      "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&h=400&fit=crop",
  },
  {
    name: "Phim & Series",
    count: "90+ bộ",
    href: "/products?category=movie",
    image:
      "https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?w=600&h=400&fit=crop",
  },
  {
    name: "Fantasy & Original",
    count: "60+ bộ",
    href: "/products?category=fantasy",
    image:
      "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=600&h=400&fit=crop",
  },
]

// ─── Rental Items ─────────────────────────────────────────────────────────────

export const rentalItems = [
  {
    name: "Nezuko Kamado",
    series: "Demon Slayer",
    price: 150000,
    available: true,
    image:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=533&fit=crop",
  },
  {
    name: "Rem",
    series: "Re:Zero",
    price: 180000,
    available: true,
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=533&fit=crop",
  },
  {
    name: "Sailor Moon",
    series: "Sailor Moon",
    price: 120000,
    available: false,
    image:
      "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=533&fit=crop",
  },
  {
    name: "Batman",
    series: "DC Comics",
    price: 200000,
    available: true,
    image:
      "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=533&fit=crop",
  },
]

// ─── Custom Order Steps ───────────────────────────────────────────────────────

export const customOrderSteps = [
  {
    number: "01",
    title: "Gửi yêu cầu",
    desc: "Mô tả nhân vật, gửi ảnh tham khảo và số đo qua form hoặc Zalo.",
    time: null,
  },
  {
    number: "02",
    title: "Báo giá & xác nhận",
    desc: "Tư vấn báo giá trong 24h. Đặt cọc 50% để bắt đầu.",
    time: "24h",
  },
  {
    number: "03",
    title: "May & hoàn thiện",
    desc: "Thợ chuyên nghiệp thực hiện. Cập nhật tiến độ qua Zalo.",
    time: "7–14 ngày",
  },
  {
    number: "04",
    title: "Giao hàng",
    desc: "Đóng gói cẩn thận, giao toàn quốc. Thanh toán phần còn lại khi nhận.",
    time: null,
  },
]

// ─── Reviews ─────────────────────────────────────────────────────────────────

export const reviews = [
  {
    name: "Nguyễn Minh Anh",
    avatar: "https://i.pravatar.cc/80?img=1",
    initials: "MA",
    rating: 5,
    service: "Mua trực tiếp",
    comment:
      "Trang phục Nezuko chất lượng vượt mong đợi! Vải đẹp, đường may tỉ mỉ, giao hàng nhanh. Sẽ quay lại mua thêm.",
  },
  {
    name: "Trần Bảo Long",
    avatar: "https://i.pravatar.cc/80?img=3",
    initials: "BL",
    rating: 5,
    service: "Thuê trang phục",
    comment:
      "Thuê bộ Genshin Impact cho Anime Festival. Trang phục sạch sẽ, đẹp y hình. Giá thuê hợp lý.",
  },
  {
    name: "Lê Thị Hương",
    avatar: "https://i.pravatar.cc/80?img=5",
    initials: "TH",
    rating: 5,
    service: "Đặt may",
    comment:
      "Đặt may bộ original design theo ý tưởng của mình. Thợ may hiểu ý, làm đúng như mong muốn.",
  },
  {
    name: "Phạm Quốc Huy",
    avatar: "https://i.pravatar.cc/80?img=7",
    initials: "QH",
    rating: 4,
    service: "Mua trực tiếp",
    comment:
      "Mua bộ Demon Slayer cho con gái. Bé thích lắm! Chất liệu an toàn, shop tư vấn size rất nhiệt tình.",
  },
  {
    name: "Võ Thanh Tú",
    avatar: "https://i.pravatar.cc/80?img=9",
    initials: "TT",
    rating: 5,
    service: "Thuê trang phục",
    comment:
      "Lần đầu thuê cosplay, nhân viên hỗ trợ rất tận tình. Trang phục đẹp hơn ảnh nhiều.",
  },
]

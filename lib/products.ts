export type Review = {
  id: string
  productSlug: string
  userName: string
  userAvatar?: string
  rating: number
  title: string
  comment: string
  images?: string[]
  createdAt: Date
  verified: boolean
  helpful: number
}

export type Product = {
  slug: string
  name: string
  series: string
  category: string
  price: number
  originalPrice: number | null
  rentPrice: number | null
  canRent: boolean
  rating: number
  reviewCount: number
  badge: string | null
  images: string[]
  sizes: string[]
  description: string
  details: { label: string; value: string }[]
}

export const products: Product[] = [
  {
    slug: "nezuko-kamado",
    name: "Nezuko Kamado",
    series: "Demon Slayer",
    category: "Anime",
    price: 850000,
    originalPrice: 1200000,
    rentPrice: 150000,
    canRent: true,
    rating: 4.9,
    reviewCount: 128,
    badge: "Bán chạy",
    images: [
      "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=1000&fit=crop",
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    description:
      "Trang phục Nezuko Kamado từ bộ anime Demon Slayer. Được may từ vải cao cấp, đường may tỉ mỉ, màu sắc trung thực với nhân vật gốc.",
    details: [
      { label: "Chất liệu", value: "Vải lụa tổng hợp cao cấp" },
      { label: "Xuất xứ", value: "Sản xuất tại Việt Nam" },
      { label: "Bảo quản", value: "Giặt tay, không sấy" },
      { label: "Giao hàng", value: "2–5 ngày toàn quốc" },
      { label: "Đổi trả", value: "7 ngày nếu lỗi sản xuất" },
    ],
  },
  {
    slug: "rem-rezero",
    name: "Rem",
    series: "Re:Zero",
    category: "Anime",
    price: 920000,
    originalPrice: null,
    rentPrice: 180000,
    canRent: true,
    rating: 4.8,
    reviewCount: 95,
    badge: "Mới",
    images: [
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=1000&fit=crop",
    ],
    sizes: ["XS", "S", "M", "L"],
    description:
      "Trang phục Rem từ Re:Zero. Bộ đồng phục hầu gái xanh dương đặc trưng với chi tiết ren tinh xảo.",
    details: [
      { label: "Chất liệu", value: "Cotton pha polyester" },
      { label: "Xuất xứ", value: "Sản xuất tại Việt Nam" },
      { label: "Bảo quản", value: "Giặt máy nhẹ" },
      { label: "Giao hàng", value: "2–5 ngày toàn quốc" },
      { label: "Đổi trả", value: "7 ngày nếu lỗi sản xuất" },
    ],
  },
  {
    slug: "batman",
    name: "Batman",
    series: "DC Comics",
    category: "Phim & Series",
    price: 1100000,
    originalPrice: 1400000,
    rentPrice: null,
    canRent: false,
    rating: 5.0,
    reviewCount: 67,
    badge: "Hot",
    images: [
      "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?w=800&h=1000&fit=crop",
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description:
      "Trang phục Batman phiên bản Dark Knight. Chất liệu giả da cao cấp, có đệm cơ bắp, kèm áo choàng và mặt nạ.",
    details: [
      { label: "Chất liệu", value: "Giả da PU + foam đệm" },
      { label: "Xuất xứ", value: "Sản xuất tại Việt Nam" },
      { label: "Bảo quản", value: "Lau nhẹ, không giặt máy" },
      { label: "Giao hàng", value: "2–5 ngày toàn quốc" },
      { label: "Đổi trả", value: "7 ngày nếu lỗi sản xuất" },
    ],
  },
  {
    slug: "sailor-moon",
    name: "Sailor Moon",
    series: "Sailor Moon",
    category: "Anime",
    price: 750000,
    originalPrice: null,
    rentPrice: 120000,
    canRent: true,
    rating: 4.7,
    reviewCount: 203,
    badge: null,
    images: [
      "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=800&h=1000&fit=crop",
    ],
    sizes: ["XS", "S", "M", "L"],
    description:
      "Trang phục Sailor Moon cổ điển với váy xếp ly trắng, nơ đỏ và găng tay trắng.",
    details: [
      { label: "Chất liệu", value: "Vải thun co giãn 4 chiều" },
      { label: "Xuất xứ", value: "Sản xuất tại Việt Nam" },
      { label: "Bảo quản", value: "Giặt tay, phơi bóng mát" },
      { label: "Giao hàng", value: "2–5 ngày toàn quốc" },
      { label: "Đổi trả", value: "7 ngày nếu lỗi sản xuất" },
    ],
  },
  {
    slug: "genshin-hu-tao",
    name: "Hu Tao",
    series: "Genshin Impact",
    category: "Game",
    price: 980000,
    originalPrice: null,
    rentPrice: 160000,
    canRent: true,
    rating: 4.9,
    reviewCount: 87,
    badge: "Mới",
    images: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=1000&fit=crop",
    ],
    sizes: ["XS", "S", "M", "L"],
    description:
      "Trang phục Hu Tao từ Genshin Impact. Bộ trang phục đặc trưng với áo vest đen, mũ và gậy hoa mai.",
    details: [
      { label: "Chất liệu", value: "Vải dệt cao cấp" },
      { label: "Xuất xứ", value: "Sản xuất tại Việt Nam" },
      { label: "Bảo quản", value: "Giặt tay" },
      { label: "Giao hàng", value: "2–5 ngày toàn quốc" },
      { label: "Đổi trả", value: "7 ngày nếu lỗi sản xuất" },
    ],
  },
  {
    slug: "naruto-uzumaki",
    name: "Naruto Uzumaki",
    series: "Naruto",
    category: "Anime",
    price: 680000,
    originalPrice: 850000,
    rentPrice: 110000,
    canRent: true,
    rating: 4.6,
    reviewCount: 312,
    badge: null,
    images: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&h=1000&fit=crop",
    ],
    sizes: ["S", "M", "L", "XL"],
    description:
      "Trang phục Naruto Uzumaki phiên bản Shippuden. Áo khoác cam đặc trưng với logo xoáy.",
    details: [
      { label: "Chất liệu", value: "Cotton 100%" },
      { label: "Xuất xứ", value: "Sản xuất tại Việt Nam" },
      { label: "Bảo quản", value: "Giặt máy" },
      { label: "Giao hàng", value: "2–5 ngày toàn quốc" },
      { label: "Đổi trả", value: "7 ngày nếu lỗi sản xuất" },
    ],
  },
  {
    slug: "spiderman-classic",
    name: "Spider-Man Classic",
    series: "Marvel",
    category: "Phim & Series",
    price: 1250000,
    originalPrice: null,
    rentPrice: 200000,
    canRent: true,
    rating: 4.8,
    reviewCount: 54,
    badge: "Hot",
    images: [
      "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&h=1000&fit=crop",
    ],
    sizes: ["S", "M", "L", "XL"],
    description:
      "Trang phục Spider-Man phiên bản classic. Chất liệu spandex co giãn 4 chiều, in 3D chi tiết.",
    details: [
      { label: "Chất liệu", value: "Spandex co giãn 4 chiều" },
      { label: "Xuất xứ", value: "Sản xuất tại Việt Nam" },
      { label: "Bảo quản", value: "Giặt tay nhẹ" },
      { label: "Giao hàng", value: "2–5 ngày toàn quốc" },
      { label: "Đổi trả", value: "7 ngày nếu lỗi sản xuất" },
    ],
  },
  {
    slug: "link-zelda",
    name: "Link",
    series: "The Legend of Zelda",
    category: "Game",
    price: 1050000,
    originalPrice: 1300000,
    rentPrice: 170000,
    canRent: true,
    rating: 4.7,
    reviewCount: 41,
    badge: null,
    images: [
      "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=800&h=1000&fit=crop",
    ],
    sizes: ["S", "M", "L", "XL"],
    description:
      "Trang phục Link từ The Legend of Zelda: Breath of the Wild. Bao gồm áo tunic xanh, mũ và khiên.",
    details: [
      { label: "Chất liệu", value: "Vải canvas + da tổng hợp" },
      { label: "Xuất xứ", value: "Sản xuất tại Việt Nam" },
      { label: "Bảo quản", value: "Giặt tay" },
      { label: "Giao hàng", value: "2–5 ngày toàn quốc" },
      { label: "Đổi trả", value: "7 ngày nếu lỗi sản xuất" },
    ],
  },
  {
    slug: "luffy-gear5",
    name: "Luffy Gear 5",
    series: "One Piece",
    category: "Anime",
    price: 890000,
    originalPrice: null,
    rentPrice: 140000,
    canRent: true,
    rating: 4.8,
    reviewCount: 156,
    badge: "Hot",
    images: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&h=1000&fit=crop",
    ],
    sizes: ["S", "M", "L", "XL"],
    description:
      "Trang phục Luffy Gear 5 từ One Piece. Bộ đồ trắng đặc trưng với chi tiết tóc trắng.",
    details: [
      { label: "Chất liệu", value: "Vải thun co giãn" },
      { label: "Xuất xứ", value: "Sản xuất tại Việt Nam" },
      { label: "Bảo quản", value: "Giặt tay" },
      { label: "Giao hàng", value: "2–5 ngày toàn quốc" },
      { label: "Đổi trả", value: "7 ngày nếu lỗi sản xuất" },
    ],
  },
  {
    slug: "zoro-wano",
    name: "Roronoa Zoro (Wano)",
    series: "One Piece",
    category: "Anime",
    price: 950000,
    originalPrice: 1100000,
    rentPrice: 160000,
    canRent: true,
    rating: 4.7,
    reviewCount: 89,
    badge: null,
    images: [
      "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&h=1000&fit=crop",
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description:
      "Trang phục Zoro phiên bản Wano. Kimono xanh lá với kiếm katana.",
    details: [
      { label: "Chất liệu", value: "Vải lụa tổng hợp" },
      { label: "Xuất xứ", value: "Sản xuất tại Việt Nam" },
      { label: "Bảo quản", value: "Giặt tay" },
      { label: "Giao hàng", value: "2–5 ngày toàn quốc" },
      { label: "Đổi trả", value: "7 ngày nếu lỗi sản xuất" },
    ],
  },
  {
    slug: "tanjiro-kamado",
    name: "Tanjiro Kamado",
    series: "Demon Slayer",
    category: "Anime",
    price: 820000,
    originalPrice: null,
    rentPrice: 130000,
    canRent: true,
    rating: 4.9,
    reviewCount: 201,
    badge: "Bán chạy",
    images: [
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&h=1000&fit=crop",
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    description:
      "Trang phục Tanjiro Kamado từ Demon Slayer. Haori họa tiết ô vuông đặc trưng.",
    details: [
      { label: "Chất liệu", value: "Cotton pha polyester" },
      { label: "Xuất xứ", value: "Sản xuất tại Việt Nam" },
      { label: "Bảo quản", value: "Giặt máy nhẹ" },
      { label: "Giao hàng", value: "2–5 ngày toàn quốc" },
      { label: "Đổi trả", value: "7 ngày nếu lỗi sản xuất" },
    ],
  },
  {
    slug: "gojo-satoru",
    name: "Gojo Satoru",
    series: "Jujutsu Kaisen",
    category: "Anime",
    price: 780000,
    originalPrice: null,
    rentPrice: 120000,
    canRent: true,
    rating: 4.8,
    reviewCount: 174,
    badge: "Mới",
    images: [
      "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=800&h=1000&fit=crop",
    ],
    sizes: ["S", "M", "L", "XL"],
    description:
      "Trang phục Gojo Satoru từ Jujutsu Kaisen. Đồng phục học sinh với băng mắt trắng.",
    details: [
      { label: "Chất liệu", value: "Vải dệt cao cấp" },
      { label: "Xuất xứ", value: "Sản xuất tại Việt Nam" },
      { label: "Bảo quản", value: "Giặt tay" },
      { label: "Giao hàng", value: "2–5 ngày toàn quốc" },
      { label: "Đổi trả", value: "7 ngày nếu lỗi sản xuất" },
    ],
  },
  {
    slug: "wonder-woman",
    name: "Wonder Woman",
    series: "DC Comics",
    category: "Phim & Series",
    price: 1350000,
    originalPrice: 1600000,
    rentPrice: 220000,
    canRent: true,
    rating: 4.9,
    reviewCount: 63,
    badge: "Hot",
    images: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=1000&fit=crop",
    ],
    sizes: ["XS", "S", "M", "L"],
    description:
      "Trang phục Wonder Woman phiên bản điện ảnh. Giáp vàng, váy da và khiên.",
    details: [
      { label: "Chất liệu", value: "Giả da PU + vải thun" },
      { label: "Xuất xứ", value: "Sản xuất tại Việt Nam" },
      { label: "Bảo quản", value: "Lau nhẹ" },
      { label: "Giao hàng", value: "2–5 ngày toàn quốc" },
      { label: "Đổi trả", value: "7 ngày nếu lỗi sản xuất" },
    ],
  },
  {
    slug: "iron-man-mk50",
    name: "Iron Man MK50",
    series: "Marvel",
    category: "Phim & Series",
    price: 1800000,
    originalPrice: 2000000,
    rentPrice: null,
    canRent: false,
    rating: 5.0,
    reviewCount: 38,
    badge: "Premium",
    images: [
      "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=1000&fit=crop",
    ],
    sizes: ["M", "L", "XL"],
    description:
      "Trang phục Iron Man MK50. Giáp EVA foam chi tiết cao, sơn metallic.",
    details: [
      { label: "Chất liệu", value: "EVA foam + sơn metallic" },
      { label: "Xuất xứ", value: "Sản xuất tại Việt Nam" },
      { label: "Bảo quản", value: "Bảo quản khô ráo" },
      { label: "Giao hàng", value: "5–7 ngày toàn quốc" },
      { label: "Đổi trả", value: "7 ngày nếu lỗi sản xuất" },
    ],
  },
  {
    slug: "raiden-shogun",
    name: "Raiden Shogun",
    series: "Genshin Impact",
    category: "Game",
    price: 1150000,
    originalPrice: null,
    rentPrice: 190000,
    canRent: true,
    rating: 4.9,
    reviewCount: 112,
    badge: "Mới",
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=1000&fit=crop",
    ],
    sizes: ["XS", "S", "M", "L"],
    description:
      "Trang phục Raiden Shogun từ Genshin Impact. Kimono tím hoàng gia với chi tiết sấm sét.",
    details: [
      { label: "Chất liệu", value: "Vải lụa tổng hợp cao cấp" },
      { label: "Xuất xứ", value: "Sản xuất tại Việt Nam" },
      { label: "Bảo quản", value: "Giặt tay" },
      { label: "Giao hàng", value: "2–5 ngày toàn quốc" },
      { label: "Đổi trả", value: "7 ngày nếu lỗi sản xuất" },
    ],
  },
  {
    slug: "cloud-strife",
    name: "Cloud Strife",
    series: "Final Fantasy VII",
    category: "Game",
    price: 1200000,
    originalPrice: 1500000,
    rentPrice: 200000,
    canRent: true,
    rating: 4.7,
    reviewCount: 55,
    badge: null,
    images: [
      "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=800&h=1000&fit=crop",
    ],
    sizes: ["S", "M", "L", "XL"],
    description:
      "Trang phục Cloud Strife từ Final Fantasy VII Remake. Áo khoác đen với kiếm Buster Sword.",
    details: [
      { label: "Chất liệu", value: "Giả da PU + vải dệt" },
      { label: "Xuất xứ", value: "Sản xuất tại Việt Nam" },
      { label: "Bảo quản", value: "Lau nhẹ" },
      { label: "Giao hàng", value: "2–5 ngày toàn quốc" },
      { label: "Đổi trả", value: "7 ngày nếu lỗi sản xuất" },
    ],
  },
  {
    slug: "elsa-frozen",
    name: "Elsa",
    series: "Frozen",
    category: "Phim & Series",
    price: 690000,
    originalPrice: null,
    rentPrice: 100000,
    canRent: true,
    rating: 4.6,
    reviewCount: 287,
    badge: null,
    images: [
      "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=800&h=1000&fit=crop",
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "Trang phục Elsa từ Frozen. Váy xanh băng với áo choàng voan.",
    details: [
      { label: "Chất liệu", value: "Vải voan + sequin" },
      { label: "Xuất xứ", value: "Sản xuất tại Việt Nam" },
      { label: "Bảo quản", value: "Giặt tay nhẹ" },
      { label: "Giao hàng", value: "2–5 ngày toàn quốc" },
      { label: "Đổi trả", value: "7 ngày nếu lỗi sản xuất" },
    ],
  },
  {
    slug: "levi-ackerman",
    name: "Levi Ackerman",
    series: "Attack on Titan",
    category: "Anime",
    price: 860000,
    originalPrice: 1000000,
    rentPrice: 140000,
    canRent: true,
    rating: 4.8,
    reviewCount: 143,
    badge: null,
    images: [
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=1000&fit=crop",
    ],
    sizes: ["XS", "S", "M", "L"],
    description:
      "Trang phục Levi Ackerman từ Attack on Titan. Đồng phục Survey Corps với áo choàng Wings of Freedom.",
    details: [
      { label: "Chất liệu", value: "Cotton + canvas" },
      { label: "Xuất xứ", value: "Sản xuất tại Việt Nam" },
      { label: "Bảo quản", value: "Giặt máy nhẹ" },
      { label: "Giao hàng", value: "2–5 ngày toàn quốc" },
      { label: "Đổi trả", value: "7 ngày nếu lỗi sản xuất" },
    ],
  },
  {
    slug: "mikasa-ackerman",
    name: "Mikasa Ackerman",
    series: "Attack on Titan",
    category: "Anime",
    price: 840000,
    originalPrice: null,
    rentPrice: 135000,
    canRent: true,
    rating: 4.7,
    reviewCount: 98,
    badge: null,
    images: [
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=1000&fit=crop",
    ],
    sizes: ["XS", "S", "M", "L"],
    description:
      "Trang phục Mikasa Ackerman từ Attack on Titan. Đồng phục Survey Corps nữ.",
    details: [
      { label: "Chất liệu", value: "Cotton + canvas" },
      { label: "Xuất xứ", value: "Sản xuất tại Việt Nam" },
      { label: "Bảo quản", value: "Giặt máy nhẹ" },
      { label: "Giao hàng", value: "2–5 ngày toàn quốc" },
      { label: "Đổi trả", value: "7 ngày nếu lỗi sản xuất" },
    ],
  },
  {
    slug: "jinx-arcane",
    name: "Jinx",
    series: "Arcane / League of Legends",
    category: "Game",
    price: 990000,
    originalPrice: null,
    rentPrice: 165000,
    canRent: true,
    rating: 4.9,
    reviewCount: 76,
    badge: "Mới",
    images: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1000&fit=crop",
    ],
    sizes: ["XS", "S", "M", "L"],
    description:
      "Trang phục Jinx từ Arcane. Áo crop top xanh, quần short với chi tiết bom.",
    details: [
      { label: "Chất liệu", value: "Vải thun co giãn" },
      { label: "Xuất xứ", value: "Sản xuất tại Việt Nam" },
      { label: "Bảo quản", value: "Giặt tay" },
      { label: "Giao hàng", value: "2–5 ngày toàn quốc" },
      { label: "Đổi trả", value: "7 ngày nếu lỗi sản xuất" },
    ],
  },
  {
    slug: "vi-arcane",
    name: "Vi",
    series: "Arcane / League of Legends",
    category: "Game",
    price: 970000,
    originalPrice: 1100000,
    rentPrice: 160000,
    canRent: true,
    rating: 4.7,
    reviewCount: 61,
    badge: null,
    images: [
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=1000&fit=crop",
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "Trang phục Vi từ Arcane. Áo khoác hồng với găng tay Hextech.",
    details: [
      { label: "Chất liệu", value: "Giả da PU + vải thun" },
      { label: "Xuất xứ", value: "Sản xuất tại Việt Nam" },
      { label: "Bảo quản", value: "Lau nhẹ" },
      { label: "Giao hàng", value: "2–5 ngày toàn quốc" },
      { label: "Đổi trả", value: "7 ngày nếu lỗi sản xuất" },
    ],
  },
  {
    slug: "geralt-witcher",
    name: "Geralt of Rivia",
    series: "The Witcher",
    category: "Phim & Series",
    price: 1400000,
    originalPrice: null,
    rentPrice: 230000,
    canRent: true,
    rating: 4.8,
    reviewCount: 44,
    badge: null,
    images: [
      "https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?w=800&h=1000&fit=crop",
    ],
    sizes: ["M", "L", "XL", "XXL"],
    description:
      "Trang phục Geralt of Rivia từ The Witcher. Áo giáp da với hai thanh kiếm.",
    details: [
      { label: "Chất liệu", value: "Da tổng hợp cao cấp" },
      { label: "Xuất xứ", value: "Sản xuất tại Việt Nam" },
      { label: "Bảo quản", value: "Lau nhẹ, bảo quản khô" },
      { label: "Giao hàng", value: "3–7 ngày toàn quốc" },
      { label: "Đổi trả", value: "7 ngày nếu lỗi sản xuất" },
    ],
  },
  {
    slug: "zero-two",
    name: "Zero Two",
    series: "Darling in the FranXX",
    category: "Anime",
    price: 880000,
    originalPrice: null,
    rentPrice: 145000,
    canRent: true,
    rating: 4.8,
    reviewCount: 167,
    badge: "Bán chạy",
    images: [
      "https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=800&h=1000&fit=crop",
    ],
    sizes: ["XS", "S", "M", "L"],
    description:
      "Trang phục Zero Two từ Darling in the FranXX. Đồng phục đỏ với sừng và tóc hồng.",
    details: [
      { label: "Chất liệu", value: "Vải thun co giãn 4 chiều" },
      { label: "Xuất xứ", value: "Sản xuất tại Việt Nam" },
      { label: "Bảo quản", value: "Giặt tay" },
      { label: "Giao hàng", value: "2–5 ngày toàn quốc" },
      { label: "Đổi trả", value: "7 ngày nếu lỗi sản xuất" },
    ],
  },
  {
    slug: "link-breath-wild",
    name: "Link (Champion's Tunic)",
    series: "The Legend of Zelda",
    category: "Game",
    price: 1080000,
    originalPrice: 1250000,
    rentPrice: 175000,
    canRent: true,
    rating: 4.6,
    reviewCount: 33,
    badge: null,
    images: [
      "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&h=1000&fit=crop",
    ],
    sizes: ["S", "M", "L", "XL"],
    description:
      "Trang phục Link Champion's Tunic từ Breath of the Wild. Áo xanh dương với quần trắng.",
    details: [
      { label: "Chất liệu", value: "Vải canvas + da tổng hợp" },
      { label: "Xuất xứ", value: "Sản xuất tại Việt Nam" },
      { label: "Bảo quản", value: "Giặt tay" },
      { label: "Giao hàng", value: "2–5 ngày toàn quốc" },
      { label: "Đổi trả", value: "7 ngày nếu lỗi sản xuất" },
    ],
  },
]

export const categories = [
  "Anime",
  "Game",
  "Phim & Series",
  "Fantasy & Original",
]

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}

export function getRelated(slug: string, limit = 4): Product[] {
  return products.filter((p) => p.slug !== slug).slice(0, limit)
}

export function searchProducts(
  query: string,
  filters?: {
    category?: string
    priceRange?: [number, number]
    sortBy?: string
  }
): Product[] {
  let results = products

  // Search by name, series, or description
  if (query.trim()) {
    const lowerQuery = query.toLowerCase()
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.series.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery)
    )
  }

  // Filter by category
  if (filters?.category && filters.category !== "all") {
    results = results.filter((p) => p.category === filters.category)
  }

  // Filter by price range
  if (filters?.priceRange) {
    const [minPrice, maxPrice] = filters.priceRange
    results = results.filter((p) => p.price >= minPrice && p.price <= maxPrice)
  }

  // Sort
  if (filters?.sortBy) {
    switch (filters.sortBy) {
      case "price-asc":
        results.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        results.sort((a, b) => b.price - a.price)
        break
      case "rating":
        results.sort((a, b) => b.rating - a.rating)
        break
      case "newest":
        // Assuming newer products are at the start
        break
      default:
        break
    }
  }

  return results
}

// Mock reviews data
export const reviews: Review[] = [
  {
    id: "1",
    productSlug: "nezuko-kamado",
    userName: "Nguyễn Thị A",
    userAvatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    title: "Tuyệt vời! Chất lượng vượt trội",
    comment:
      "Trang phục rất đẹp, chất liệu tốt, đường may tỉ mỉ. Mình đã tham gia cosplay với bộ này và nhận được rất nhiều lời khen. Giao hàng nhanh, đóng gói cẩn thận.",
    images: [
      "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=300&fit=crop",
    ],
    createdAt: new Date("2024-03-15"),
    verified: true,
    helpful: 12,
  },
  {
    id: "2",
    productSlug: "nezuko-kamado",
    userName: "Trần Văn B",
    rating: 5,
    title: "Đúng như mô tả",
    comment:
      "Màu sắc trung thực với nhân vật gốc, size vừa vặn. Rất hài lòng với sản phẩm này. Sẽ ủng hộ shop lần sau!",
    createdAt: new Date("2024-03-10"),
    verified: true,
    helpful: 8,
  },
  {
    id: "3",
    productSlug: "nezuko-kamado",
    userName: "Lê Thị C",
    rating: 4,
    title: "Tốt nhưng có thể cải thiện",
    comment:
      "Trang phục đẹp, chất lượng ổn. Tuy nhiên phần dây buộc có thể làm chắc chắn hơn. Overall vẫn rất hài lòng.",
    createdAt: new Date("2024-03-08"),
    verified: false,
    helpful: 5,
  },
  {
    id: "4",
    productSlug: "rem-rezero",
    userName: "Phạm Văn D",
    rating: 5,
    title: "Yêu thích bộ này!",
    comment:
      "Chi tiết ren rất tinh xảo, màu xanh dương đẹp mắt. Đã thử cosplay và nhận được nhiều like trên mạng xã hội.",
    createdAt: new Date("2024-03-12"),
    verified: true,
    helpful: 15,
  },
  {
    id: "6",
    productSlug: "naruto-uzumaki",
    userName: "Trần Minh Khoa",
    rating: 5,
    title: "Chất lượng tốt, giao nhanh",
    comment:
      "Áo khoác cam rất đẹp, chất cotton mềm mại, màu sắc trung thực. Mặc đi event được nhiều người hỏi mua.",
    createdAt: new Date("2024-02-20"),
    verified: true,
    helpful: 24,
  },
  {
    id: "7",
    productSlug: "naruto-uzumaki",
    userName: "Nguyễn Thị Lan",
    rating: 4,
    title: "Ổn, nhưng size hơi rộng",
    comment:
      "Trang phục đẹp, đường may chắc chắn. Tuy nhiên size M hơi rộng hơn mình nghĩ, nên order size S nếu dáng nhỏ.",
    createdAt: new Date("2024-02-15"),
    verified: true,
    helpful: 18,
  },
]

export function getProductReviews(productSlug: string): Review[] {
  return reviews.filter((review) => review.productSlug === productSlug)
}

export function addReview(
  review: Omit<Review, "id" | "createdAt" | "helpful">
): Review {
  const newReview: Review = {
    ...review,
    id: Date.now().toString(),
    createdAt: new Date(),
    helpful: 0,
  }
  reviews.unshift(newReview) // Add to beginning of array
  return newReview
}

export function updateProductRating(productSlug: string) {
  const productReviews = getProductReviews(productSlug)
  if (productReviews.length === 0) return

  const averageRating =
    productReviews.reduce((sum, review) => sum + review.rating, 0) /
    productReviews.length
  const product = products.find((p) => p.slug === productSlug)
  if (product) {
    product.rating = Math.round(averageRating * 10) / 10
    product.reviewCount = productReviews.length
  }
}

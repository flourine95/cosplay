import { hashPassword } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  ProductStatus,
  ProductType,
  RentalItemCondition,
  SellerStatus,
  UserRole,
  UserStatus,
} from "@/app/generated/prisma/enums"
import "dotenv/config"

const systemSettings = [
  {
    key: "site_name",
    value: "Cosplay Marketplace",
    description: "Tên website",
  },
  {
    key: "site_email",
    value: "admin@cosplay.vn",
    description: "Email liên hệ chính",
  },
  { key: "maintenance_mode", value: "false", description: "Chế độ bảo trì" },
] as const

const systemFees = [
  {
    name: "platform_commission",
    description: "Phí hoa hồng nền tảng",
    feeType: "percentage" as const,
    feeValue: 10.0,
    isActive: true,
  },
  {
    name: "payment_processing_fee",
    description: "Phí xử lý thanh toán",
    feeType: "percentage" as const,
    feeValue: 2.5,
    isActive: true,
  },
  {
    name: "rental_insurance_fee",
    description: "Phí bảo hiểm cho thuê",
    feeType: "percentage" as const,
    feeValue: 5.0,
    isActive: true,
  },
]

const users = {
  admin: {
    email: "admin@cosplay.vn",
    password: "Admin@123456",
    name: "Admin",
    phone: "0901234567",
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    emailVerified: true,
    emailVerifiedAt: new Date(),
  },
  seller: {
    email: "seller@cosplay.vn",
    password: "Seller@123456",
    name: "Cosplay Shop",
    phone: "0912345678",
    role: UserRole.SELLER,
    status: UserStatus.ACTIVE,
    emailVerified: true,
    emailVerifiedAt: new Date(),
    shopName: "Cosplay Shop Premium",
    shopDescription:
      "Chuyên cung cấp trang phục cosplay chất lượng cao, may đo theo yêu cầu",
    sellerStatus: SellerStatus.APPROVED,
    sellerApprovedAt: new Date(),
    sellerRating: 4.8,
    sellerTotalReviews: 156,
    sellerTotalSales: 342,
    businessLicense: "0123456789",
    taxCode: "0123456789",
    bankName: "Vietcombank",
    bankAccount: "1234567890",
    bankAccountName: "NGUYEN VAN A",
  },
  customer: {
    email: "customer@cosplay.vn",
    password: "Customer@123456",
    name: "Nguyễn Văn B",
    phone: "0923456789",
    role: UserRole.CUSTOMER,
    status: UserStatus.ACTIVE,
    emailVerified: true,
    emailVerifiedAt: new Date(),
    savedAddresses: JSON.stringify([
      {
        name: "Nhà riêng",
        phone: "0923456789",
        address: "123 Nguyễn Huệ",
        city: "Hồ Chí Minh",
        district: "Quận 1",
        ward: "Phường Bến Nghé",
        isDefault: true,
      },
    ]),
  },
}

const categories = [
  {
    name: "Anime & Manga",
    slug: "anime-manga",
    description: "Trang phục từ các bộ anime và manga nổi tiếng",
    image: null,
    order: 1,
  },
  {
    name: "Game",
    slug: "game",
    description: "Trang phục nhân vật game",
    image: null,
    order: 2,
  },
  {
    name: "Movie & TV",
    slug: "movie-tv",
    description: "Trang phục từ phim và truyền hình",
    image: null,
    order: 3,
  },
  {
    name: "Original Character",
    slug: "original-character",
    description: "Trang phục nhân vật tự sáng tạo",
    image: null,
    order: 4,
  },
  {
    name: "Phụ kiện",
    slug: "phu-kien",
    description: "Phụ kiện cosplay: vũ khí, tóc giả, lens...",
    image: null,
    order: 5,
  },
]

type ProductTemplate = {
  name: string
  slug: string
  description: string
  shortDescription: string
  price: number
  comparePrice: number
  sku: string
  categorySlug: string
  status: ProductStatus
  type: ProductType
  tags: string[]
  rating: number
  reviewCount: number
  viewCount: number
  soldCount: number
  publishedAt: Date
}

const products: ProductTemplate[] = [
  {
    name: "Trang phục Naruto Uzumaki - Hokage",
    slug: "naruto-uzumaki-hokage",
    description:
      "Bộ trang phục Hokage đệ thất Naruto Uzumaki, chất liệu cao cấp",
    shortDescription: "Bộ trang phục Hokage Naruto chất lượng cao",
    price: 1500000,
    comparePrice: 2000000,
    sku: "NAR-HOK-001",
    categorySlug: "anime-manga",
    status: ProductStatus.ACTIVE,
    type: ProductType.BOTH,
    tags: ["naruto", "hokage", "anime"],
    rating: 4.9,
    reviewCount: 45,
    viewCount: 1234,
    soldCount: 89,
    publishedAt: new Date(),
  },
  {
    name: "Trang phục Genshin Impact - Raiden Shogun",
    slug: "genshin-raiden-shogun",
    description: "Bộ trang phục Raiden Shogun từ Genshin Impact",
    shortDescription: "Bộ trang phục Raiden Shogun đầy đủ",
    price: 2500000,
    comparePrice: 3200000,
    sku: "GEN-RAI-001",
    categorySlug: "game",
    status: ProductStatus.ACTIVE,
    type: ProductType.SALE,
    tags: ["genshin", "raiden", "game"],
    rating: 4.8,
    reviewCount: 67,
    viewCount: 2345,
    soldCount: 123,
    publishedAt: new Date(),
  },
  {
    name: "Trang phục Demon Slayer - Tanjiro Kamado",
    slug: "demon-slayer-tanjiro",
    description: "Bộ trang phục Tanjiro Kamado từ Kimetsu no Yaiba",
    shortDescription: "Bộ trang phục Tanjiro Kamado",
    price: 1800000,
    comparePrice: 2400000,
    sku: "DEM-TAN-001",
    categorySlug: "anime-manga",
    status: ProductStatus.ACTIVE,
    type: ProductType.RENTAL,
    tags: ["demon slayer", "tanjiro", "anime"],
    rating: 4.7,
    reviewCount: 34,
    viewCount: 987,
    soldCount: 56,
    publishedAt: new Date(),
  },
  {
    name: "Tóc giả Anime - Nhiều màu",
    slug: "toc-gia-anime",
    description: "Tóc giả cosplay chất lượng cao",
    shortDescription: "Tóc giả cosplay đa dạng",
    price: 350000,
    comparePrice: 500000,
    sku: "ACC-WIG-001",
    categorySlug: "phu-kien",
    status: ProductStatus.ACTIVE,
    type: ProductType.SALE,
    tags: ["wig", "tóc giả", "phụ kiện"],
    rating: 4.6,
    reviewCount: 89,
    viewCount: 3456,
    soldCount: 234,
    publishedAt: new Date(),
  },
  {
    name: "Trang phục Spider-Man - No Way Home",
    slug: "spiderman-no-way-home",
    description: "Bộ trang phục Spider-Man từ phim No Way Home",
    shortDescription: "Bộ trang phục Spider-Man mới nhất",
    price: 2200000,
    comparePrice: 2800000,
    sku: "MOV-SPI-001",
    categorySlug: "movie-tv",
    status: ProductStatus.ACTIVE,
    type: ProductType.BOTH,
    tags: ["spiderman", "marvel", "movie"],
    rating: 4.9,
    reviewCount: 78,
    viewCount: 2890,
    soldCount: 145,
    publishedAt: new Date(),
  },
]

const productSizes = ["S", "M", "L", "XL"] as const

const rentalConfig = {
  pricePerDayMultiplier: 0.05,
  depositMultiplier: 0.3,
  minDays: 3,
  maxDays: 14,
  condition: RentalItemCondition.EXCELLENT,
}

const measurementTemplate = {
  name: "Số đo chuẩn",
  height: 170,
  weight: 65,
  chest: 90,
  waist: 75,
  hips: 95,
  shoulder: 42,
  armLength: 58,
  legLength: 100,
  neck: 36,
  isDefault: true,
  notes: "Số đo cơ bản cho đặt may",
}

const reviewsTemplate = [
  {
    productSlug: "naruto-uzumaki-hokage",
    rating: 5,
    title: "Tuyệt vời!",
    content: "Chất lượng tốt, may đo chuẩn, giao hàng nhanh.",
    images: [] as string[],
    videos: [] as string[],
    isVerified: true,
    isPublished: true,
  },
  {
    productSlug: "genshin-raiden-shogun",
    rating: 5,
    title: "Đẹp như mơ",
    content: "Bộ Raiden đẹp xuất sắc, chi tiết tỉ mỉ.",
    images: [] as string[],
    videos: [] as string[],
    isVerified: true,
    isPublished: true,
  },
]

const seedSystemSettings = async () => {
  for (const setting of systemSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }
}

const seedSystemFees = async () => {
  for (const fee of systemFees) {
    await prisma.systemFee.upsert({
      where: { name: fee.name },
      update: {},
      create: fee,
    })
  }
}

const seedUsers = async () => {
  const admin = await prisma.user.upsert({
    where: { email: users.admin.email },
    update: {},
    create: { ...users.admin, password: hashPassword(users.admin.password) },
  })

  const seller = await prisma.user.upsert({
    where: { email: users.seller.email },
    update: {},
    create: { ...users.seller, password: hashPassword(users.seller.password) },
  })

  const customer = await prisma.user.upsert({
    where: { email: users.customer.email },
    update: {},
    create: {
      ...users.customer,
      password: hashPassword(users.customer.password),
    },
  })

  return { admin, seller, customer }
}

const seedCategories = async () => {
  const created = []
  for (const category of categories) {
    const c = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    })
    created.push(c)
  }
  return created
}

const seedProducts = async (
  sellerId: number,
  categoriesMap: Map<string, number>
) => {
  const created = []

  for (const template of products) {
    const categoryId = categoriesMap.get(template.categorySlug)
    if (!categoryId)
      throw new Error(`Category not found: ${template.categorySlug}`)

    const { categorySlug: _categorySlug, tags, ...productData } = template

    const product = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: { ...productData, tags: [...tags], categoryId, sellerId },
    })
    created.push(product)

    await prisma.productImage.createMany({
      data: [
        {
          productId: product.id,
          url: `/images/products/${product.slug}/main.jpg`,
          alt: product.name,
          order: 0,
          isPrimary: true,
        },
        {
          productId: product.id,
          url: `/images/products/${product.slug}/detail-1.jpg`,
          alt: `${product.name} - Chi tiết 1`,
          order: 1,
          isPrimary: false,
        },
      ],
      skipDuplicates: true,
    })

    await prisma.productVariant.createMany({
      data: productSizes.map((size, index) => ({
        productId: product.id,
        name: `Size ${size}`,
        sku: `${product.sku}-${size}`,
        price: product.price,
        stock: 10 + index * 2,
        attributes: JSON.stringify({ size, color: "default" }),
        isDefault: size === "M",
      })),
      skipDuplicates: true,
    })
  }

  return created
}

const seedRentalItems = async (
  sellerId: number,
  productsList: Awaited<ReturnType<typeof seedProducts>>
) => {
  for (const product of productsList) {
    if (product.type === "RENTAL" || product.type === "BOTH") {
      const price = product.price.toNumber()
      await prisma.rentalItem.upsert({
        where: { productId: product.id },
        update: {},
        create: {
          productId: product.id,
          sellerId,
          pricePerDay: price * rentalConfig.pricePerDayMultiplier,
          depositAmount: price * rentalConfig.depositMultiplier,
          minDays: rentalConfig.minDays,
          maxDays: rentalConfig.maxDays,
          condition: rentalConfig.condition,
          isAvailable: true,
        },
      })
    }
  }
}

const seedMeasurements = async (customerId: number) => {
  await prisma.measurement.create({
    data: { ...measurementTemplate, userId: customerId },
  })
}

const seedReviews = async (
  customerId: number,
  productsMap: Map<string, number>
) => {
  const data = []
  for (const review of reviewsTemplate) {
    const productId = productsMap.get(review.productSlug)
    if (!productId) throw new Error(`Product not found: ${review.productSlug}`)
    const { productSlug: _productSlug, images, videos, ...reviewData } = review
    data.push({
      ...reviewData,
      images: [...images],
      videos: [...videos],
      userId: customerId,
      productId,
    })
  }
  await prisma.review.createMany({ data, skipDuplicates: true })
}

const main = async () => {
  await seedSystemSettings()
  await seedSystemFees()

  const { seller, customer } = await seedUsers()

  const categoriesList = await seedCategories()
  const categoriesMap = new Map(categoriesList.map((c) => [c.slug, c.id]))

  const productsList = await seedProducts(seller.id, categoriesMap)
  const productsMap = new Map(productsList.map((p) => [p.slug, p.id]))

  await seedRentalItems(seller.id, productsList)
  await seedMeasurements(customer.id)
  await seedReviews(customer.id, productsMap)

  console.warn("Seed completed")
  console.warn(`Admin:    ${users.admin.email} / ${users.admin.password}`)
  console.warn(`Seller:   ${users.seller.email} / ${users.seller.password}`)
  console.warn(`Customer: ${users.customer.email} / ${users.customer.password}`)
}

main()
  .catch((error) => {
    console.error("Seed failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

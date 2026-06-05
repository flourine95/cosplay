import { hashPassword } from "@/lib/auth"
import { PrismaClient } from "@/app/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import {
  ProductStatus,
  ProductType,
  RentalItemCondition,
  SellerStatus,
  UserRole,
  UserStatus,
} from "@/app/generated/prisma/enums"
import "dotenv/config"
import { products as mockProducts } from "../lib/products"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

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

function getCategorySlug(category: string): string {
  switch (category) {
    case "Anime":
      return "anime-manga"
    case "Game":
      return "game"
    case "Phim & Series":
      return "movie-tv"
    case "Fantasy & Original":
      return "original-character"
    default:
      return "anime-manga"
  }
}

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
    productSlug: "nezuko-kamado",
    rating: 5,
    title: "Tuyệt vời!",
    content: "Chất lượng tốt, may đo chuẩn, giao hàng nhanh.",
    images: [] as string[],
    videos: [] as string[],
    isVerified: true,
    isPublished: true,
  },
  {
    productSlug: "raiden-shogun",
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
    create: {
      ...users.admin,
      password: await hashPassword(users.admin.password),
    },
  })

  const seller = await prisma.user.upsert({
    where: { email: users.seller.email },
    update: {},
    create: {
      ...users.seller,
      password: await hashPassword(users.seller.password),
    },
  })

  const customer = await prisma.user.upsert({
    where: { email: users.customer.email },
    update: {},
    create: {
      ...users.customer,
      password: await hashPassword(users.customer.password),
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

  for (const mockProduct of mockProducts) {
    const categorySlug = getCategorySlug(mockProduct.category)
    const categoryId = categoriesMap.get(categorySlug)
    if (!categoryId) throw new Error(`Category not found: ${categorySlug}`)

    const product = await prisma.product.upsert({
      where: { slug: mockProduct.slug },
      update: {},
      create: {
        name: mockProduct.name,
        slug: mockProduct.slug,
        description: mockProduct.description,
        shortDescription: mockProduct.description.slice(0, 100),
        price: mockProduct.price,
        comparePrice: mockProduct.originalPrice,
        sku: mockProduct.slug.toUpperCase(),
        type: mockProduct.canRent ? ProductType.BOTH : ProductType.SALE,
        status: ProductStatus.ACTIVE,
        tags: [
          mockProduct.series.toLowerCase(),
          mockProduct.category.toLowerCase(),
        ],
        rating: mockProduct.rating,
        reviewCount: mockProduct.reviewCount,
        viewCount: Math.floor(Math.random() * 1000),
        soldCount: Math.floor(Math.random() * 100),
        publishedAt: new Date(),
        categoryId,
        sellerId,
      },
    })
    created.push(product)

    if (mockProduct.images.length > 0) {
      await prisma.productImage.createMany({
        data: mockProduct.images.map((url, index) => ({
          productId: product.id,
          url,
          alt: `${mockProduct.name} - ${index + 1}`,
          order: index,
          isPrimary: index === 0,
        })),
        skipDuplicates: true,
      })
    }

    await prisma.productVariant.createMany({
      data: mockProduct.sizes.map((size, index) => ({
        productId: product.id,
        name: `Size ${size}`,
        sku: `${product.slug.toUpperCase()}-${size}`,
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

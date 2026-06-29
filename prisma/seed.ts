import { hashPassword } from "@/lib/auth"
import { PrismaClient } from "@/app/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import {
  CustomOrderStatus,
  EscrowStatus,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ProductStatus,
  ProductType,
  RentalItemCondition,
  RentalStatus,
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
    shopReturnName: "Cosplay Shop Premium",
    shopReturnPhone: "0912345678",
    shopReturnAddress: "45 Le Loi",
    shopReturnCity: "Ho Chi Minh",
    shopReturnDistrict: "Quan 1",
    shopReturnWard: "Phuong Ben Nghe",
    shopReturnNote: "Goi shop truoc khi gui tra do.",
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
  depositMultiplier: 1,
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

const orderTemplates = [
  {
    orderNumber: "DH-1024",
    productSlug: "nezuko-kamado",
    quantity: 1,
    status: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.PENDING,
    paymentMethod: PaymentMethod.COD,
    shippingName: "Nguyễn Minh Anh",
    shippingPhone: "0901222333",
    shippingAddress: "123 Nguyễn Huệ",
    shippingCity: "Hồ Chí Minh",
    shippingDistrict: "Quận 1",
    shippingWard: "Phường Bến Nghé",
    customerNote: "Giao buổi sáng giúp mình",
  },
  {
    orderNumber: "DH-1029",
    productSlug: "raiden-shogun",
    quantity: 1,
    status: OrderStatus.SHIPPING,
    paymentStatus: PaymentStatus.PAID,
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    shippingName: "Trần Hữu Khang",
    shippingPhone: "0988111222",
    shippingAddress: "45 Lê Lợi",
    shippingCity: "Hồ Chí Minh",
    shippingDistrict: "Quận 3",
    shippingWard: "Phường Võ Thị Sáu",
    customerNote: null,
  },
  {
    orderNumber: "DH-1030",
    productSlug: "gojo-satoru",
    quantity: 2,
    status: OrderStatus.COMPLETED,
    paymentStatus: PaymentStatus.PAID,
    paymentMethod: PaymentMethod.MOMO,
    shippingName: "Lê Bảo Ngọc",
    shippingPhone: "0932666777",
    shippingAddress: "88 Điện Biên Phủ",
    shippingCity: "Hồ Chí Minh",
    shippingDistrict: "Bình Thạnh",
    shippingWard: "Phường 15",
    customerNote: "Gói kỹ phụ kiện",
  },
] as const

const rentalOrderTemplates = [
  {
    orderNumber: "RT-2026-001",
    productSlug: "nezuko-kamado",
    startOffsetDays: 1,
    totalDays: 3,
    status: RentalStatus.CONFIRMED,
  },
  {
    orderNumber: "RT-2026-002",
    productSlug: "raiden-shogun",
    startOffsetDays: -2,
    totalDays: 5,
    status: RentalStatus.RENTED,
  },
  {
    orderNumber: "RT-2026-003",
    productSlug: "gojo-satoru",
    startOffsetDays: -7,
    totalDays: 3,
    status: RentalStatus.COMPLETED,
  },
] as const

const customOrderTemplates = [
  {
    orderNumber: "TAIL-001",
    title: "Áo Cosplay Venti (Genshin Impact)",
    description:
      "May áo Venti dùng vải lụa mờ, tay áo phồng, kèm nơ và chi tiết viền vàng.",
    characterName: "Venti",
    animeName: "Genshin Impact",
    specialRequests: "Giao trong 14 ngày, ưu tiên chất vải nhẹ.",
    status: CustomOrderStatus.SUBMITTED,
    estimatedPrice: 1200000,
    depositAmount: 500000,
    finalAmount: 1200000,
    referenceImages: [
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800",
    ],
  },
  {
    orderNumber: "TAIL-002",
    title: "Giáp tay Iron Man",
    description:
      "Làm giáp tay bằng form cứng, sơn đỏ cherry, có chi tiết đèn giả ở lòng bàn tay.",
    characterName: "Iron Man",
    animeName: "Marvel",
    specialRequests: "Cần ảnh tiến độ sau khi sơn lót.",
    status: CustomOrderStatus.IN_PROGRESS,
    estimatedPrice: 1800000,
    depositAmount: 800000,
    finalAmount: 1800000,
    referenceImages: [
      "https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=800",
    ],
  },
  {
    orderNumber: "TAIL-003",
    title: "Váy công chúa Lolita",
    description:
      "Váy xòe nhiều tầng, viền ren trắng, form eo ôm nhẹ theo số đo.",
    characterName: "Original Princess",
    animeName: "Original Character",
    specialRequests: "Ren chân váy dài hơn mẫu 5cm.",
    status: CustomOrderStatus.REVISION_REQUESTED,
    estimatedPrice: 2200000,
    depositAmount: 1000000,
    finalAmount: 2200000,
    referenceImages: [
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800",
    ],
  },
] as const

const messageTemplates = [
  {
    content:
      "Chào shop, em muốn hỏi đơn đặt may TAIL-001 đã có báo giá chưa ạ?",
    from: "customer" as const,
  },
  {
    content: "Shop đã nhận yêu cầu rồi nhé. Shop sẽ gửi báo giá trong hôm nay.",
    from: "seller" as const,
  },
  {
    content: "Dạ em cảm ơn shop.",
    from: "customer" as const,
  },
] as const

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
  const existing = await prisma.measurement.findFirst({
    where: { userId: customerId, name: measurementTemplate.name },
  })
  if (existing) return existing

  return prisma.measurement.create({
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

const seedOrders = async (
  customerId: number,
  sellerId: number,
  productsMap: Map<string, number>
) => {
  for (const template of orderTemplates) {
    const productId = productsMap.get(template.productSlug)
    if (!productId)
      throw new Error(`Product not found: ${template.productSlug}`)

    const product = await prisma.product.findUniqueOrThrow({
      where: { id: productId },
      include: { variants: { orderBy: { id: "asc" }, take: 1 } },
    })
    const [variant] = product.variants
    const subtotal = product.price.mul(template.quantity)

    await prisma.order.upsert({
      where: { orderNumber: template.orderNumber },
      update: {},
      create: {
        userId: customerId,
        sellerId,
        orderNumber: template.orderNumber,
        shippingName: template.shippingName,
        shippingPhone: template.shippingPhone,
        shippingAddress: template.shippingAddress,
        shippingCity: template.shippingCity,
        shippingDistrict: template.shippingDistrict,
        shippingWard: template.shippingWard,
        subtotal,
        shippingFee: 30000,
        discount: 0,
        tax: 0,
        total: subtotal.add(30000),
        status: template.status,
        paymentStatus: template.paymentStatus,
        paymentMethod: template.paymentMethod,
        escrowStatus:
          template.status === OrderStatus.COMPLETED
            ? EscrowStatus.RELEASED
            : EscrowStatus.HOLDING,
        customerNote: template.customerNote,
        confirmedAt:
          template.status === OrderStatus.PENDING ? null : new Date(),
        shippedAt:
          template.status === OrderStatus.SHIPPING ||
          template.status === OrderStatus.COMPLETED
            ? new Date()
            : null,
        deliveredAt:
          template.status === OrderStatus.COMPLETED ? new Date() : null,
        completedAt:
          template.status === OrderStatus.COMPLETED ? new Date() : null,
        items: {
          create: {
            productId: product.id,
            variantId: variant?.id,
            productName: product.name,
            variantName: variant?.name,
            price: product.price,
            quantity: template.quantity,
            subtotal,
          },
        },
        statusHistory: {
          create: {
            status: template.status,
            note: "Seed dữ liệu mẫu cho seller dashboard",
            createdBy: sellerId,
          },
        },
      },
    })
  }
}

const seedRentalOrders = async (
  customerId: number,
  productsMap: Map<string, number>
) => {
  for (const template of rentalOrderTemplates) {
    const productId = productsMap.get(template.productSlug)
    if (!productId)
      throw new Error(`Product not found: ${template.productSlug}`)

    const rentalItem = await prisma.rentalItem.findUnique({
      where: { productId },
    })
    if (!rentalItem) continue

    const startDate = new Date()
    startDate.setDate(startDate.getDate() + template.startOffsetDays)
    startDate.setHours(10, 0, 0, 0)

    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + template.totalDays - 1)

    const rentalFee = rentalItem.pricePerDay.mul(template.totalDays)

    await prisma.rentalOrder.upsert({
      where: { orderNumber: template.orderNumber },
      update: {},
      create: {
        userId: customerId,
        rentalItemId: rentalItem.id,
        orderNumber: template.orderNumber,
        startDate,
        endDate,
        actualReturnDate:
          template.status === RentalStatus.COMPLETED ? endDate : null,
        pricePerDay: rentalItem.pricePerDay,
        totalDays: template.totalDays,
        rentalFee,
        depositAmount: rentalItem.depositAmount,
        status: template.status,
        conditionAtPickup:
          template.status === RentalStatus.CONFIRMED
            ? null
            : RentalItemCondition.EXCELLENT,
        conditionAtReturn:
          template.status === RentalStatus.COMPLETED
            ? RentalItemCondition.GOOD
            : null,
        pickupNotes: "Seed lịch thuê mẫu",
        pickupImages: [],
        pickupVideos: [],
        returnNotes:
          template.status === RentalStatus.COMPLETED
            ? "Khách đã trả đồ, tình trạng tốt"
            : null,
        returnImages: [],
        returnVideos: [],
        confirmedAt: new Date(),
        pickedUpAt:
          template.status === RentalStatus.RENTED ||
          template.status === RentalStatus.COMPLETED
            ? startDate
            : null,
        returnedAt: template.status === RentalStatus.COMPLETED ? endDate : null,
        completedAt:
          template.status === RentalStatus.COMPLETED ? endDate : null,
      },
    })
  }
}

const seedCustomOrders = async (
  customerId: number,
  sellerId: number,
  measurementId: number
) => {
  for (const template of customOrderTemplates) {
    const deadline = new Date()
    deadline.setDate(deadline.getDate() + 14)

    await prisma.customOrder.upsert({
      where: { orderNumber: template.orderNumber },
      update: {},
      create: {
        userId: customerId,
        sellerId,
        measurementId,
        orderNumber: template.orderNumber,
        title: template.title,
        description: template.description,
        referenceImages: [...template.referenceImages],
        characterName: template.characterName,
        animeName: template.animeName,
        specialRequests: template.specialRequests,
        deadline,
        status: template.status,
        estimatedPrice: template.estimatedPrice,
        depositAmount: template.depositAmount,
        finalAmount: template.finalAmount,
        totalPaid:
          template.status === CustomOrderStatus.SUBMITTED
            ? 0
            : template.depositAmount,
        submittedAt: new Date(),
        acceptedAt:
          template.status === CustomOrderStatus.SUBMITTED ? null : new Date(),
        quotes: {
          create: {
            sellerId,
            quotedPrice: template.estimatedPrice,
            depositAmount: template.depositAmount,
            estimatedDays: 14,
            description: "Báo giá mẫu từ seed",
            isAccepted: template.status !== CustomOrderStatus.SUBMITTED,
          },
        },
        progressUpdates:
          template.status === CustomOrderStatus.IN_PROGRESS ||
          template.status === CustomOrderStatus.REVISION_REQUESTED
            ? {
                create: {
                  title: "Đã bắt đầu gia công",
                  description:
                    "Shop đã chuẩn bị vật liệu và bắt đầu xử lý mẫu.",
                  images: [...template.referenceImages],
                  videos: [],
                  progressPercent:
                    template.status === CustomOrderStatus.IN_PROGRESS ? 35 : 80,
                },
              }
            : undefined,
        revisions:
          template.status === CustomOrderStatus.REVISION_REQUESTED
            ? {
                create: {
                  description:
                    "Khách yêu cầu bóp eo thêm 2cm và tăng độ dài ren chân váy.",
                  images: [],
                  videos: [],
                },
              }
            : undefined,
      },
    })
  }
}

const seedConversations = async (customerId: number, sellerId: number) => {
  const existingConversation = await prisma.conversation.findFirst({
    where: { user1Id: customerId, user2Id: sellerId },
  })
  const conversation =
    existingConversation ??
    (await prisma.conversation.create({
      data: {
        user1Id: customerId,
        user2Id: sellerId,
        lastMessageAt: new Date(),
      },
    }))

  const existingMessages = await prisma.message.count({
    where: { conversationId: conversation.id },
  })
  if (existingMessages > 0) return

  for (const [index, message] of messageTemplates.entries()) {
    const createdAt = new Date()
    createdAt.setMinutes(
      createdAt.getMinutes() - (messageTemplates.length - index) * 5
    )
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: message.from === "seller" ? sellerId : customerId,
        content: message.content,
        attachments: [],
        isRead: message.from === "seller",
        createdAt,
      },
    })
  }

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { lastMessageAt: new Date() },
  })
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
  const measurement = await seedMeasurements(customer.id)
  await seedReviews(customer.id, productsMap)
  await seedOrders(customer.id, seller.id, productsMap)
  await seedRentalOrders(customer.id, productsMap)
  await seedCustomOrders(customer.id, seller.id, measurement.id)
  await seedConversations(customer.id, seller.id)

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

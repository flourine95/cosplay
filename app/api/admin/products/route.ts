import { NextResponse } from "next/server"
import { Prisma } from "@/app/generated/prisma/client"
import {
  ProductStatus,
  ProductType,
  UserRole,
} from "@/app/generated/prisma/enums"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { adminProductSchema } from "@/schemas/admin-product"

const requireAdmin = async () => {
  const user = await getSession()
  return user?.role === UserRole.ADMIN ? user : null
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const parsed = adminProductSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
        { status: 400 }
      )
    }

    const { data } = parsed
    const seller = await prisma.user.findFirst({
      where: { id: data.sellerId, role: UserRole.SELLER },
      select: { id: true },
    })

    if (!seller) {
      return NextResponse.json(
        { error: "Seller không tồn tại" },
        { status: 404 }
      )
    }

    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
      select: { id: true },
    })

    if (!category) {
      return NextResponse.json(
        { error: "Danh mục không tồn tại" },
        { status: 404 }
      )
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        sellerId: data.sellerId,
        categoryId: data.categoryId,
        description: data.description,
        shortDescription: data.shortDescription,
        price: new Prisma.Decimal(data.price),
        comparePrice: data.comparePrice
          ? new Prisma.Decimal(data.comparePrice)
          : undefined,
        sku: data.sku || undefined,
        type: data.type,
        status: data.status,
        tags: data.tags,
        publishedAt: data.status === ProductStatus.ACTIVE ? new Date() : null,
        images: {
          create: data.imageUrls.map((url, index) => ({
            url,
            alt: `${data.name} - ${index + 1}`,
            order: index,
            isPrimary: index === 0,
          })),
        },
        variants: {
          create: [
            {
              name: data.variantName,
              sku: data.variantSku || undefined,
              price: new Prisma.Decimal(data.price),
              stock: data.stock,
              attributes: { source: "admin-default" },
              isDefault: true,
            },
          ],
        },
        rentalItem:
          data.type === ProductType.RENTAL || data.type === ProductType.BOTH
            ? {
                create: {
                  sellerId: data.sellerId,
                  pricePerDay: new Prisma.Decimal(data.rentalPricePerDay ?? 0),
                  depositAmount: new Prisma.Decimal(
                    data.rentalDepositAmount ?? 0
                  ),
                  minDays: data.rentalMinDays,
                  maxDays: data.rentalMaxDays,
                  condition: data.rentalCondition,
                  isAvailable: true,
                },
              }
            : undefined,
      },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            shopName: true,
          },
        },
        images: true,
        variants: true,
        rentalItem: true,
      },
    })

    return NextResponse.json({ data: product }, { status: 201 })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Slug, SKU sản phẩm hoặc SKU biến thể đã tồn tại" },
        { status: 409 }
      )
    }

    console.error("POST /api/admin/products error:", error)
    return NextResponse.json(
      { error: "Không thể tạo sản phẩm" },
      { status: 500 }
    )
  }
}

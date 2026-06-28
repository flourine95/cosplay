import { NextResponse } from "next/server"
import { Prisma } from "@/app/generated/prisma/client"
import { ProductStatus, ProductType } from "@/app/generated/prisma/enums"
import { requireSeller } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  sellerProductInclude,
  serializeSellerProduct,
} from "@/lib/seller-product"
import { sellerProductSchema } from "@/schemas/seller-product"

export async function GET() {
  try {
    const seller = await requireSeller()
    if (!seller) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const products = await prisma.product.findMany({
      where: { sellerId: seller.id },
      include: sellerProductInclude,
      orderBy: { createdAt: "desc" },
    })

    const data = products.map(serializeSellerProduct)
    const stats = {
      total: data.length,
      active: data.filter((p) => p.status === ProductStatus.ACTIVE).length,
      totalStock: data.reduce((sum, p) => sum + p.totalStock, 0),
      rented: data.reduce((sum, p) => sum + p.rented, 0),
    }

    return NextResponse.json({ data: { products: data, stats } })
  } catch (error) {
    console.error("GET /api/seller/products error:", error)
    return NextResponse.json(
      { error: "Không thể lấy danh sách sản phẩm" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const seller = await requireSeller()
    if (!seller) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const parsed = sellerProductSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
        { status: 400 }
      )
    }

    const { data } = parsed

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

    const hasRental =
      data.type === ProductType.RENTAL || data.type === ProductType.BOTH

    // Lưu tình trạng độ mới vào tags (schema Product không có field riêng)
    const tags = data.condition
      ? [...data.tags, `condition:${data.condition}`]
      : data.tags

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        sellerId: seller.id,
        categoryId: data.categoryId,
        description: data.description,
        shortDescription: data.shortDescription,
        price: new Prisma.Decimal(data.price),
        comparePrice:
          data.comparePrice != null
            ? new Prisma.Decimal(data.comparePrice)
            : undefined,
        sku: data.sku || undefined,
        type: data.type,
        status: data.status,
        tags,
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
          create: data.variants.map((variant, index) => ({
            name: variant.size,
            sku: variant.sku || undefined,
            price: new Prisma.Decimal(data.price),
            stock: variant.stock,
            attributes: { size: variant.size },
            isDefault: index === 0,
          })),
        },
        rentalItem: hasRental
          ? {
              create: {
                sellerId: seller.id,
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
      include: sellerProductInclude,
    })

    return NextResponse.json(
      { data: serializeSellerProduct(product) },
      { status: 201 }
    )
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

    console.error("POST /api/seller/products error:", error)
    return NextResponse.json(
      { error: "Không thể tạo sản phẩm" },
      { status: 500 }
    )
  }
}

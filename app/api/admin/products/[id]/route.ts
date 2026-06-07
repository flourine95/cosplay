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

interface RouteContext {
  params: Promise<{ id: string }>
}

const requireAdmin = async () => {
  const user = await getSession()
  return user?.role === UserRole.ADMIN ? user : null
}

const parseProductId = async ({ params }: RouteContext): Promise<number> => {
  const { id } = await params
  const productId = Number(id)
  if (!Number.isInteger(productId) || productId <= 0) {
    throw new Error("Invalid product id")
  }
  return productId
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const productId = await parseProductId(context)
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: { orderBy: { order: "asc" } },
        variants: { orderBy: { id: "asc" } },
        rentalItem: true,
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: "Không tìm thấy sản phẩm" },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: product })
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid product id") {
      return NextResponse.json(
        { error: "Mã sản phẩm không hợp lệ" },
        { status: 400 }
      )
    }

    console.error("GET /api/admin/products/[id] error:", error)
    return NextResponse.json(
      { error: "Không thể lấy sản phẩm" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const productId = await parseProductId(context)
    const body = await request.json()
    const parsed = adminProductSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
        { status: 400 }
      )
    }

    const { data } = parsed
    const [product, seller, category] = await Promise.all([
      prisma.product.findUnique({
        where: { id: productId },
        include: { variants: { orderBy: { id: "asc" } }, rentalItem: true },
      }),
      prisma.user.findFirst({
        where: { id: data.sellerId, role: UserRole.SELLER },
        select: { id: true },
      }),
      prisma.category.findUnique({
        where: { id: data.categoryId },
        select: { id: true },
      }),
    ])

    if (!product) {
      return NextResponse.json(
        { error: "Không tìm thấy sản phẩm" },
        { status: 404 }
      )
    }

    if (!seller) {
      return NextResponse.json(
        { error: "Seller không tồn tại" },
        { status: 404 }
      )
    }

    if (!category) {
      return NextResponse.json(
        { error: "Danh mục không tồn tại" },
        { status: 404 }
      )
    }

    const defaultVariant =
      product.variants.find((variant) => variant.isDefault) ??
      product.variants[0]
    const hasRental =
      data.type === ProductType.RENTAL || data.type === ProductType.BOTH

    const updated = await prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId } })
      await tx.product.update({
        where: { id: productId },
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
            : null,
          sku: data.sku || null,
          type: data.type,
          status: data.status,
          tags: data.tags,
          publishedAt:
            data.status === ProductStatus.ACTIVE
              ? (product.publishedAt ?? new Date())
              : null,
          images: {
            create: data.imageUrls.map((url, index) => ({
              url,
              alt: `${data.name} - ${index + 1}`,
              order: index,
              isPrimary: index === 0,
            })),
          },
        },
      })

      if (defaultVariant) {
        await tx.productVariant.update({
          where: { id: defaultVariant.id },
          data: {
            name: data.variantName,
            sku: data.variantSku || null,
            price: new Prisma.Decimal(data.price),
            stock: data.stock,
            attributes: { source: "admin-default" },
            isDefault: true,
          },
        })
      } else {
        await tx.productVariant.create({
          data: {
            productId,
            name: data.variantName,
            sku: data.variantSku || undefined,
            price: new Prisma.Decimal(data.price),
            stock: data.stock,
            attributes: { source: "admin-default" },
            isDefault: true,
          },
        })
      }

      if (hasRental) {
        await tx.rentalItem.upsert({
          where: { productId },
          update: {
            sellerId: data.sellerId,
            pricePerDay: new Prisma.Decimal(data.rentalPricePerDay ?? 0),
            depositAmount: new Prisma.Decimal(data.rentalDepositAmount ?? 0),
            minDays: data.rentalMinDays,
            maxDays: data.rentalMaxDays,
            condition: data.rentalCondition,
            isAvailable: true,
          },
          create: {
            productId,
            sellerId: data.sellerId,
            pricePerDay: new Prisma.Decimal(data.rentalPricePerDay ?? 0),
            depositAmount: new Prisma.Decimal(data.rentalDepositAmount ?? 0),
            minDays: data.rentalMinDays,
            maxDays: data.rentalMaxDays,
            condition: data.rentalCondition,
            isAvailable: true,
          },
        })
      } else if (product.rentalItem) {
        await tx.rentalItem.delete({ where: { productId } })
      }

      return tx.product.findUnique({
        where: { id: productId },
        include: {
          category: true,
          seller: {
            select: { id: true, name: true, email: true, shopName: true },
          },
          images: true,
          variants: true,
          rentalItem: true,
        },
      })
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid product id") {
      return NextResponse.json(
        { error: "Mã sản phẩm không hợp lệ" },
        { status: 400 }
      )
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Slug, SKU sản phẩm hoặc SKU biến thể đã tồn tại" },
        { status: 409 }
      )
    }

    console.error("PATCH /api/admin/products/[id] error:", error)
    return NextResponse.json(
      { error: "Không thể cập nhật sản phẩm" },
      { status: 500 }
    )
  }
}

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

const parseProductId = (value: string): number => {
  const id = Number(value)
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid product id")
  }
  return id
}

const invalidIdResponse = () =>
  NextResponse.json({ error: "Mã sản phẩm không hợp lệ" }, { status: 400 })

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/seller/products/[id]">
) {
  try {
    const seller = await requireSeller()
    if (!seller) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const { id } = await ctx.params
    const productId = parseProductId(id)

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: sellerProductInclude,
    })

    if (!product || product.sellerId !== seller.id) {
      return NextResponse.json(
        { error: "Không tìm thấy sản phẩm" },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: serializeSellerProduct(product) })
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid product id") {
      return invalidIdResponse()
    }
    console.error("GET /api/seller/products/[id] error:", error)
    return NextResponse.json(
      { error: "Không thể lấy sản phẩm" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/seller/products/[id]">
) {
  try {
    const seller = await requireSeller()
    if (!seller) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const { id } = await ctx.params
    const productId = parseProductId(id)
    const body = await request.json()
    const parsed = sellerProductSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
        { status: 400 }
      )
    }

    const { data } = parsed
    const [existing, category] = await Promise.all([
      prisma.product.findUnique({
        where: { id: productId },
        include: { rentalItem: true },
      }),
      prisma.category.findUnique({
        where: { id: data.categoryId },
        select: { id: true },
      }),
    ])

    if (!existing || existing.sellerId !== seller.id) {
      return NextResponse.json(
        { error: "Không tìm thấy sản phẩm" },
        { status: 404 }
      )
    }
    if (!category) {
      return NextResponse.json(
        { error: "Danh mục không tồn tại" },
        { status: 404 }
      )
    }

    const hasRental =
      data.type === ProductType.RENTAL || data.type === ProductType.BOTH
    const tags = data.condition
      ? [...data.tags, `condition:${data.condition}`]
      : data.tags

    const updated = await prisma.$transaction(async (tx) => {
      // Thay toàn bộ ảnh và biến thể (size) bằng dữ liệu mới
      await tx.productImage.deleteMany({ where: { productId } })
      await tx.productVariant.deleteMany({ where: { productId } })

      await tx.product.update({
        where: { id: productId },
        data: {
          name: data.name,
          slug: data.slug,
          categoryId: data.categoryId,
          description: data.description,
          shortDescription: data.shortDescription,
          price: new Prisma.Decimal(data.price),
          comparePrice:
            data.comparePrice != null
              ? new Prisma.Decimal(data.comparePrice)
              : null,
          sku: data.sku || null,
          type: data.type,
          status: data.status,
          tags,
          publishedAt:
            data.status === ProductStatus.ACTIVE
              ? (existing.publishedAt ?? new Date())
              : null,
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
        },
      })

      if (hasRental) {
        await tx.rentalItem.upsert({
          where: { productId },
          update: {
            sellerId: seller.id,
            pricePerDay: new Prisma.Decimal(data.rentalPricePerDay ?? 0),
            depositAmount: new Prisma.Decimal(data.rentalDepositAmount ?? 0),
            minDays: data.rentalMinDays,
            maxDays: data.rentalMaxDays,
            condition: data.rentalCondition,
          },
          create: {
            productId,
            sellerId: seller.id,
            pricePerDay: new Prisma.Decimal(data.rentalPricePerDay ?? 0),
            depositAmount: new Prisma.Decimal(data.rentalDepositAmount ?? 0),
            minDays: data.rentalMinDays,
            maxDays: data.rentalMaxDays,
            condition: data.rentalCondition,
            isAvailable: true,
          },
        })
      } else if (existing.rentalItem) {
        await tx.rentalItem.delete({ where: { productId } })
      }

      return tx.product.findUniqueOrThrow({
        where: { id: productId },
        include: sellerProductInclude,
      })
    })

    return NextResponse.json({ data: serializeSellerProduct(updated) })
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid product id") {
      return invalidIdResponse()
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
    console.error("PATCH /api/seller/products/[id] error:", error)
    return NextResponse.json(
      { error: "Không thể cập nhật sản phẩm" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/seller/products/[id]">
) {
  try {
    const seller = await requireSeller()
    if (!seller) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const { id } = await ctx.params
    const productId = parseProductId(id)

    const existing = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        sellerId: true,
        _count: { select: { orderItems: true } },
      },
    })

    if (!existing || existing.sellerId !== seller.id) {
      return NextResponse.json(
        { error: "Không tìm thấy sản phẩm" },
        { status: 404 }
      )
    }

    // Đã có đơn hàng tham chiếu → không xóa, chỉ ngừng kinh doanh
    if (existing._count.orderItems > 0) {
      const product = await prisma.product.update({
        where: { id: productId },
        data: { status: ProductStatus.DISCONTINUED, publishedAt: null },
        include: sellerProductInclude,
      })
      return NextResponse.json({
        data: serializeSellerProduct(product),
        message:
          "Sản phẩm đã có đơn hàng nên được chuyển sang Ngừng kinh doanh",
      })
    }

    await prisma.product.delete({ where: { id: productId } })
    return NextResponse.json({ data: { id: productId } })
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid product id") {
      return invalidIdResponse()
    }
    console.error("DELETE /api/seller/products/[id] error:", error)
    return NextResponse.json(
      { error: "Không thể xóa sản phẩm" },
      { status: 500 }
    )
  }
}

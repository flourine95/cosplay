import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

// GET /api/cart
export async function GET() {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ items: [] })
    }

    const dbCartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            images: true,
          },
        },
        variant: true,
      },
    })

    const items = dbCartItems.map((item) => {
      const attrs =
        typeof item.variant?.attributes === "string"
          ? JSON.parse(item.variant.attributes)
          : item.variant?.attributes

      // Type can be stored in the item or determined from product type
      const itemType =
        item.type || (item.product?.type === "RENTAL" ? "Thuê" : "Mua")
      const rentDays = item.rentDays || undefined

      const price = item.variant?.price
        ? Number(item.variant.price)
        : Number(item.product?.price || 0)

      return {
        id: item.id.toString(),
        productId: item.productId.toString(),
        variantId: item.variantId?.toString() || "",
        productSlug: item.product?.slug || "",
        name: item.product?.name || "Sản phẩm",
        productName: item.product?.name || "Sản phẩm",
        image:
          item.product?.images?.find(
            (img: { isPrimary: boolean }) => img.isPrimary
          )?.url ||
          item.product?.images?.[0]?.url ||
          "/images/placeholder.jpg",
        size: attrs?.size || "M",
        type: itemType,
        rentDays: rentDays,
        price: price,
        quantity: item.quantity,
      }
    })

    return NextResponse.json({ items })
  } catch (error) {
    console.error("GET /api/cart error:", error)
    return NextResponse.json(
      { error: "Không thể tải danh sách giỏ hàng" },
      { status: 500 }
    )
  }
}

// POST /api/cart
export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const body = await request.json()
    const { productSlug, size, type, rentDays, quantity } = body

    if (!productSlug || !size) {
      return NextResponse.json(
        { error: "Thiếu thông tin sản phẩm" },
        { status: 400 }
      )
    }

    // Find product
    const product = await prisma.product.findUnique({
      where: { slug: productSlug },
      include: { variants: true },
    })

    if (!product) {
      return NextResponse.json(
        { error: "Không tìm thấy sản phẩm" },
        { status: 404 }
      )
    }

    // Find matching variant
    const variant = product.variants.find((v) => {
      const attrs = (
        typeof v.attributes === "string"
          ? JSON.parse(v.attributes)
          : v.attributes
      ) as Record<string, unknown> | null
      return attrs?.size === size
    })

    if (!variant) {
      return NextResponse.json(
        { error: `Sản phẩm không có size ${size}` },
        { status: 400 }
      )
    }

    // Check if item already exists in database
    // We match by userId, productId, variantId, and custom properties if applicable
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId: user.id,
        productId: product.id,
        variantId: variant.id,
      },
    })

    const qty = quantity || 1
    const dbType = type === "rent" ? "Thuê" : "Mua"

    let savedItem
    if (existingItem) {
      savedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + qty,
          type: dbType,
          rentDays: rentDays || null,
        },
      })
    } else {
      savedItem = await prisma.cartItem.create({
        data: {
          userId: user.id,
          productId: product.id,
          variantId: variant.id,
          quantity: qty,
          type: dbType,
          rentDays: rentDays || null,
        },
      })
    }

    return NextResponse.json({ success: true, item: savedItem })
  } catch (error) {
    console.error("POST /api/cart error:", error)
    return NextResponse.json(
      { error: "Không thể thêm sản phẩm vào giỏ hàng" },
      { status: 500 }
    )
  }
}

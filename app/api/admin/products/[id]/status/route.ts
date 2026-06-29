import { NextResponse } from "next/server"
import { z } from "zod"
import { ProductStatus, UserRole } from "@/app/generated/prisma/enums"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface RouteContext {
  params: Promise<{ id: string }>
}

const productStatusSchema = z.object({
  status: z.enum(ProductStatus, { error: "Trạng thái không hợp lệ" }),
})

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
    const parsed = productStatusSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
        { status: 400 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        publishedAt: true,
        images: { select: { id: true }, take: 1 },
        variants: { select: { stock: true } },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: "Không tìm thấy sản phẩm" },
        { status: 404 }
      )
    }

    if (parsed.data.status === ProductStatus.ACTIVE) {
      const totalStock = product.variants.reduce(
        (sum, variant) => sum + variant.stock,
        0
      )
      if (product.images.length === 0) {
        return NextResponse.json(
          { error: "Không thể duyệt sản phẩm chưa có ảnh" },
          { status: 400 }
        )
      }
      if (product.variants.length === 0 || totalStock <= 0) {
        return NextResponse.json(
          { error: "Không thể duyệt sản phẩm chưa có tồn kho" },
          { status: 400 }
        )
      }
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        status: parsed.data.status,
        publishedAt:
          parsed.data.status === ProductStatus.ACTIVE
            ? (product.publishedAt ?? new Date())
            : null,
      },
      select: { id: true, status: true, publishedAt: true },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid product id") {
      return NextResponse.json(
        { error: "Mã sản phẩm không hợp lệ" },
        { status: 400 }
      )
    }

    console.error("PATCH /api/admin/products/[id]/status error:", error)
    return NextResponse.json(
      { error: "Không thể cập nhật trạng thái sản phẩm" },
      { status: 500 }
    )
  }
}

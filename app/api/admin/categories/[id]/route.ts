import { NextResponse } from "next/server"
import { Prisma } from "@/app/generated/prisma/client"
import { UserRole } from "@/app/generated/prisma/enums"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { adminCategorySchema } from "@/schemas/admin-category"

interface RouteContext {
  params: Promise<{ id: string }>
}

const requireAdmin = async () => {
  const user = await getSession()
  return user?.role === UserRole.ADMIN ? user : null
}

const parseCategoryId = async ({ params }: RouteContext): Promise<number> => {
  const { id } = await params
  const categoryId = Number(id)
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    throw new Error("Invalid category id")
  }
  return categoryId
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

    const categoryId = await parseCategoryId(context)
    const body = await request.json()
    const parsed = adminCategorySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
        { status: 400 }
      )
    }

    const { data } = parsed

    if (data.parentId === categoryId) {
      return NextResponse.json(
        { error: "Danh mục không thể làm cha của chính nó" },
        { status: 400 }
      )
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    })

    if (!category) {
      return NextResponse.json(
        { error: "Không tìm thấy danh mục" },
        { status: 404 }
      )
    }

    if (data.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: data.parentId },
        select: { id: true, parentId: true },
      })

      if (!parent) {
        return NextResponse.json(
          { error: "Danh mục cha không tồn tại" },
          { status: 404 }
        )
      }

      if (parent.parentId === categoryId) {
        return NextResponse.json(
          { error: "Không thể tạo quan hệ danh mục vòng lặp" },
          { status: 400 }
        )
      }
    }

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        parentId: data.parentId ?? null,
        order: data.order,
        isActive: data.isActive,
      },
      include: {
        parent: { select: { id: true, name: true } },
        _count: { select: { products: true, children: true } },
      },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid category id") {
      return NextResponse.json(
        { error: "Mã danh mục không hợp lệ" },
        { status: 400 }
      )
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Slug danh mục đã tồn tại" },
        { status: 409 }
      )
    }

    console.error("PATCH /api/admin/categories/[id] error:", error)
    return NextResponse.json(
      { error: "Không thể cập nhật danh mục" },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const categoryId = await parseCategoryId(context)
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: { select: { products: true, children: true } },
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: "Không tìm thấy danh mục" },
        { status: 404 }
      )
    }

    if (category._count.products > 0 || category._count.children > 0) {
      return NextResponse.json(
        {
          error:
            "Không thể xóa danh mục đang có sản phẩm hoặc danh mục con. Hãy tạm ẩn danh mục thay vì xóa.",
        },
        { status: 400 }
      )
    }

    await prisma.category.delete({ where: { id: categoryId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid category id") {
      return NextResponse.json(
        { error: "Mã danh mục không hợp lệ" },
        { status: 400 }
      )
    }

    console.error("DELETE /api/admin/categories/[id] error:", error)
    return NextResponse.json(
      { error: "Không thể xóa danh mục" },
      { status: 500 }
    )
  }
}

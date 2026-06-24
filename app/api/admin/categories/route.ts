import { NextResponse } from "next/server"
import { Prisma } from "@/app/generated/prisma/client"
import { UserRole } from "@/app/generated/prisma/enums"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { adminCategorySchema } from "@/schemas/admin-category"

const requireAdmin = async () => {
  const user = await getSession()
  return user?.role === UserRole.ADMIN ? user : null
}

export async function GET() {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const categories = await prisma.category.findMany({
      include: {
        parent: { select: { id: true, name: true } },
        _count: { select: { products: true, children: true } },
      },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    })

    return NextResponse.json({ data: categories })
  } catch (error) {
    console.error("GET /api/admin/categories error:", error)
    return NextResponse.json(
      { error: "Không thể lấy danh mục" },
      { status: 500 }
    )
  }
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
    const parsed = adminCategorySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
        { status: 400 }
      )
    }

    const { data } = parsed

    if (data.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: data.parentId },
        select: { id: true },
      })

      if (!parent) {
        return NextResponse.json(
          { error: "Danh mục cha không tồn tại" },
          { status: 404 }
        )
      }
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        parentId: data.parentId,
        order: data.order,
        isActive: data.isActive,
      },
      include: {
        parent: { select: { id: true, name: true } },
        _count: { select: { products: true, children: true } },
      },
    })

    return NextResponse.json({ data: category }, { status: 201 })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Slug danh mục đã tồn tại" },
        { status: 409 }
      )
    }

    console.error("POST /api/admin/categories error:", error)
    return NextResponse.json(
      { error: "Không thể tạo danh mục" },
      { status: 500 }
    )
  }
}

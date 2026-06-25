import { NextResponse } from "next/server"
import { requireSeller } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const seller = await requireSeller()
    if (!seller) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true, parentId: true },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    })

    return NextResponse.json({ data: categories })
  } catch (error) {
    console.error("GET /api/seller/categories error:", error)
    return NextResponse.json(
      { error: "Không thể lấy danh mục" },
      { status: 500 }
    )
  }
}

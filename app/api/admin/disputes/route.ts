import { NextResponse } from "next/server"
import { UserRole } from "@/app/generated/prisma/enums"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const user = await getSession()
    if (!user || user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const disputes = await prisma.returnRequest.findMany({
      include: {
        order: {
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true },
            },
            seller: {
              select: { id: true, name: true, email: true, shopName: true },
            },
            items: {
              select: { productName: true, quantity: true, subtotal: true },
            },
            payout: { select: { id: true, status: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ data: disputes })
  } catch (error) {
    console.error("GET /api/admin/disputes error:", error)
    return NextResponse.json(
      { error: "Không thể tải danh sách dispute" },
      { status: 500 }
    )
  }
}

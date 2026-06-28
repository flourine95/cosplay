import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const sessionUser = await getSession()
    if (!sessionUser) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }
    const sellers = await prisma.user.findMany({
      where: {
        role: "SELLER",
        status: "ACTIVE"
      },
      select: {
        id: true,
        name: true,
        shopName: true,
        shopLogo: true,
        sellerRating: true,
        sellerTotalReviews: true,
      },
      orderBy: { sellerRating: "desc" },
    })
    return NextResponse.json(sellers, { status: 200 })
  } catch (error) {
    console.error("[SELLERS_GET_ERROR]", error)
    return NextResponse.json(
      { error: "Không thể tải danh sách Maker" },
      { status: 500 }
    )
  }
}
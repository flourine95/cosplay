import { NextResponse } from "next/server"
import { requireSeller } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  sellerRentalCalendarInclude,
  serializeSellerRentalCalendarItem,
} from "@/lib/seller-rental-calendar"

export async function GET() {
  try {
    const seller = await requireSeller()
    if (!seller) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const rentalOrders = await prisma.rentalOrder.findMany({
      where: { rentalItem: { sellerId: seller.id } },
      include: sellerRentalCalendarInclude,
      orderBy: [{ startDate: "asc" }, { endDate: "asc" }],
    })

    return NextResponse.json({
      data: rentalOrders.map(serializeSellerRentalCalendarItem),
    })
  } catch (error) {
    console.error("GET /api/seller/rental-calendar error:", error)
    return NextResponse.json(
      { error: "Không thể lấy lịch thuê" },
      { status: 500 }
    )
  }
}

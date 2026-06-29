import { NextResponse } from "next/server"
import { requireSeller } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rentalOrderInclude, serializeRentalOrder } from "@/lib/rental-order"

export async function GET() {
  try {
    const seller = await requireSeller()
    if (!seller) {
      return NextResponse.json(
        { error: "Khong co quyen truy cap" },
        { status: 403 }
      )
    }

    const orders = await prisma.rentalOrder.findMany({
      where: { rentalItem: { sellerId: seller.id } },
      include: rentalOrderInclude,
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json({
      data: orders.map(serializeRentalOrder),
    })
  } catch (error) {
    console.error("GET /api/seller/rental-orders error:", error)
    return NextResponse.json(
      { error: "Khong the lay danh sach don thue" },
      { status: 500 }
    )
  }
}

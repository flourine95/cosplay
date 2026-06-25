import { NextResponse } from "next/server"
import { RentalStatus } from "@/app/generated/prisma/enums"
import { requireSeller } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const rentalStatusLabels: Record<RentalStatus, string> = {
  [RentalStatus.PENDING]: "Chờ xác nhận",
  [RentalStatus.CONFIRMED]: "Đã xác nhận",
  [RentalStatus.DEPOSIT_PAID]: "Đã cọc",
  [RentalStatus.READY_FOR_PICKUP]: "Sẵn sàng lấy",
  [RentalStatus.RENTED]: "Đang thuê",
  [RentalStatus.RETURNED]: "Đã trả",
  [RentalStatus.DEPOSIT_REFUNDED]: "Đã hoàn cọc",
  [RentalStatus.COMPLETED]: "Hoàn tất",
  [RentalStatus.CANCELLED]: "Đã hủy",
  [RentalStatus.OVERDUE]: "Quá hạn",
}

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
      include: {
        user: { select: { id: true, name: true, phone: true } },
        rentalItem: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: {
                  where: { isPrimary: true },
                  select: { url: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
      orderBy: [{ startDate: "asc" }, { endDate: "asc" }],
    })

    return NextResponse.json({
      data: rentalOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customer: {
          id: order.user.id,
          name: order.user.name,
          phone: order.user.phone,
        },
        product: {
          id: order.rentalItem.product.id,
          name: order.rentalItem.product.name,
          slug: order.rentalItem.product.slug,
          image: order.rentalItem.product.images[0]?.url ?? null,
        },
        startDate: order.startDate.toISOString(),
        endDate: order.endDate.toISOString(),
        actualReturnDate: order.actualReturnDate?.toISOString() ?? null,
        totalDays: order.totalDays,
        rentalFee: order.rentalFee.toNumber(),
        depositAmount: order.depositAmount.toNumber(),
        status: order.status,
        statusLabel: rentalStatusLabels[order.status],
      })),
    })
  } catch (error) {
    console.error("GET /api/seller/rental-calendar error:", error)
    return NextResponse.json(
      { error: "Không thể lấy lịch thuê" },
      { status: 500 }
    )
  }
}

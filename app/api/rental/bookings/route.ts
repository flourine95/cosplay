import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { differenceInDays, format } from "date-fns"

// GET /api/rental/bookings
export async function GET() {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const dbOrders = await prisma.rentalOrder.findMany({
      where: { userId: user.id },
      include: {
        rentalItem: {
          include: {
            product: {
              include: {
                images: true,
                seller: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const orders = dbOrders.map((order) => {
      let mappedStatus: "active" | "pending" | "returning" | "completed" =
        "pending"
      const { status } = order

      if (status === "RENTED" || status === "OVERDUE") {
        mappedStatus = "active"
      } else if (status === "RETURNED" || status === "DEPOSIT_REFUNDED") {
        mappedStatus = "returning"
      } else if (status === "COMPLETED") {
        mappedStatus = "completed"
      } else {
        mappedStatus = "pending"
      }

      let daysLeft: number | null = null
      if (mappedStatus === "active" && order.endDate) {
        const today = new Date()
        const end = new Date(order.endDate)
        const diff = differenceInDays(end, today)
        daysLeft = diff >= 0 ? diff : 0
      }

      const img =
        order.rentalItem?.product?.images?.find((i) => i.isPrimary)?.url ||
        order.rentalItem?.product?.images?.[0]?.url ||
        "/images/placeholder.jpg"

      return {
        id: order.orderNumber,
        status: mappedStatus,
        itemName: order.rentalItem?.product?.name || "Sản phẩm cosplay",
        shopName: order.rentalItem?.product?.seller?.shopName || "Cosplay Shop",
        startDate: format(order.startDate, "dd/MM/yyyy"),
        endDate: format(order.endDate, "dd/MM/yyyy"),
        daysLeft,
        totalPrice: Number(order.rentalFee),
        deposit: Number(order.depositAmount),
        image: img,
      }
    })

    return NextResponse.json({ rentals: orders })
  } catch (error) {
    console.error("GET /api/rental/bookings error:", error)
    return NextResponse.json(
      { error: "Không thể lấy danh sách lịch sử thuê đồ" },
      { status: 500 }
    )
  }
}

// POST /api/rental/bookings
export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const body = await request.json()
    const { rentalItemId, startDate, endDate } = body

    if (!rentalItemId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Thiếu thông tin đặt thuê" },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start >= end) {
      return NextResponse.json(
        { error: "Ngày kết thúc phải sau ngày bắt đầu" },
        { status: 400 }
      )
    }

    // 1. Fetch rental item
    const rentalItem = await prisma.rentalItem.findUnique({
      where: { id: parseInt(rentalItemId, 10) },
      include: { product: true },
    })

    if (!rentalItem || !rentalItem.isAvailable) {
      return NextResponse.json(
        { error: "Sản phẩm thuê không khả dụng" },
        { status: 404 }
      )
    }

    // 2. Overlap Check (Race condition prevention)
    const conflict = await prisma.rentalOrder.findFirst({
      where: {
        rentalItemId: rentalItem.id,
        status: { not: "CANCELLED" },
        AND: [{ startDate: { lte: end } }, { endDate: { gte: start } }],
      },
    })

    if (conflict) {
      return NextResponse.json(
        {
          error:
            "Khoảng thời gian bạn chọn đã được đặt thuê trước đó. Vui lòng chọn lịch khác.",
        },
        { status: 409 }
      )
    }

    const totalDays = differenceInDays(end, start) + 1
    const pricePerDayVal = Number(rentalItem.pricePerDay)
    const rentalFee = totalDays * pricePerDayVal
    const orderNumber = `RT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`

    // 3. Create RentalOrder
    const newOrder = await prisma.rentalOrder.create({
      data: {
        userId: user.id,
        rentalItemId: rentalItem.id,
        orderNumber,
        startDate: start,
        endDate: end,
        pricePerDay: rentalItem.pricePerDay,
        totalDays,
        rentalFee,
        depositAmount: rentalItem.depositAmount,
        status: "PENDING",
      },
    })

    return NextResponse.json({
      success: true,
      order: {
        id: newOrder.id,
        orderNumber: newOrder.orderNumber,
        totalPayment:
          Number(newOrder.rentalFee) + Number(newOrder.depositAmount),
      },
    })
  } catch (error) {
    console.error("POST /api/rental/bookings error:", error)
    return NextResponse.json(
      { error: "Lỗi tạo đơn đặt thuê đồ" },
      { status: 500 }
    )
  }
}

// PATCH /api/rental/bookings
export async function PATCH(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const body = await request.json()
    const { orderNumber, returnNote } = body

    if (!orderNumber) {
      return NextResponse.json(
        { error: "Thiếu mã đơn đặt thuê" },
        { status: 400 }
      )
    }

    // Tìm đơn thuê thuộc về user hiện tại
    const order = await prisma.rentalOrder.findFirst({
      where: {
        orderNumber,
        userId: user.id,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: "Không tìm thấy đơn đặt thuê" },
        { status: 404 }
      )
    }

    // Cập nhật trạng thái thành RETURNED (Đã trả đồ) và lưu ghi chú trả
    await prisma.rentalOrder.update({
      where: { id: order.id },
      data: {
        status: "RETURNED",
        returnNotes: returnNote || "",
        actualReturnDate: new Date(),
        returnedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, status: "returned" })
  } catch (error) {
    console.error("PATCH /api/rental/bookings error:", error)
    return NextResponse.json({ error: "Lỗi báo cáo trả đồ" }, { status: 500 })
  }
}

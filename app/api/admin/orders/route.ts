import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { UserRole } from "@/app/generated/prisma/enums"

export async function GET() {
  try {
    const user = await getSession()
    if (!user || user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                type: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Map DB orders to the shape expected by the frontend component
    const mappedOrders = orders.map((order) => {
      // Determine type: if any item is RENTAL, type is Rent. Otherwise, Tailor.
      const hasRental = order.items.some(
        (item) => item.product?.type === "RENTAL"
      )
      const orderType = hasRental ? "Rent" : "Tailor"

      // Format date range (for rental)
      let dateRange: string | undefined = undefined
      if (hasRental) {
        const start = new Date(order.createdAt)
        const end = new Date(order.createdAt)
        end.setDate(end.getDate() + 3) // Default 3 rental days
        const formatDate = (d: Date) =>
          `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`
        dateRange = `${formatDate(start)} - ${formatDate(end)}`
      }

      // Determine status string
      let displayStatus:
        | "Ongoing"
        | "Returned"
        | "Processing"
        | "Overdue"
        | "Pending_Measurement" = "Processing"
      if (order.status === "PENDING" || order.status === "CONFIRMED") {
        displayStatus = orderType === "Rent" ? "Ongoing" : "Pending_Measurement"
      } else if (order.status === "PROCESSING") {
        displayStatus = "Processing"
      } else if (order.status === "DELIVERED" || order.status === "COMPLETED") {
        displayStatus = orderType === "Rent" ? "Returned" : "Processing"
      } else if (order.status === "CANCELLED") {
        displayStatus = "Returned"
      }

      // Get first item name or summary
      const itemsSummary =
        order.items.length > 0
          ? order.items
              .map((i) => `${i.productName} (x${i.quantity})`)
              .join(", ")
          : "Không có sản phẩm"

      // Format amount
      const amountFormatted = `${Number(order.total).toLocaleString("vi-VN")}₫`

      // Determine deadline label
      let deadline = "Đang xử lý"
      if (order.status === "COMPLETED") {
        deadline = "Hoàn tất"
      } else if (order.status === "CANCELLED") {
        deadline = "Đã hủy"
      } else if (orderType === "Rent") {
        deadline = "Còn 3 ngày"
      } else {
        deadline = "Đang xử lý"
      }

      return {
        id: order.orderNumber,
        customer: order.shippingName || order.user?.name || "Khách hàng",
        type: orderType,
        item: itemsSummary,
        amount: amountFormatted,
        status: displayStatus,
        dateRange,
        progress: orderType === "Tailor" ? 30 : undefined, // dummy progress for tailor orders
        deadline,
      }
    })

    return NextResponse.json({ orders: mappedOrders })
  } catch (error) {
    console.error("GET /api/admin/orders error:", error)
    return NextResponse.json(
      { error: "Không thể lấy danh sách đơn hàng" },
      { status: 500 }
    )
  }
}

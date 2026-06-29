import { NextResponse } from "next/server"
import {
  NotificationType,
  OrderStatus,
  PaymentStatus,
  ReturnStatus,
  UserRole,
} from "@/app/generated/prisma/enums"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createReturnRequestSchema } from "@/schemas/return-request"

const refundableOrderStatuses = new Set<string>([
  OrderStatus.DELIVERED,
  OrderStatus.COMPLETED,
])

export async function GET() {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const requests = await prisma.returnRequest.findMany({
      where: { userId: user.id },
      include: {
        order: {
          select: {
            orderNumber: true,
            total: true,
            status: true,
            paymentStatus: true,
            escrowStatus: true,
            seller: { select: { name: true, shopName: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ data: requests })
  } catch (error) {
    console.error("GET /api/returns error:", error)
    return NextResponse.json(
      { error: "Không thể tải danh sách yêu cầu hoàn tiền" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createReturnRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
        { status: 400 }
      )
    }

    const order = await prisma.order.findFirst({
      where: {
        orderNumber: parsed.data.orderNumber,
        userId: user.id,
      },
      include: {
        returnRequests: {
          where: {
            status: {
              in: [
                ReturnStatus.PENDING,
                ReturnStatus.APPROVED,
                ReturnStatus.SHIPPING_BACK,
                ReturnStatus.RECEIVED,
              ],
            },
          },
          select: { id: true },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: "Không tìm thấy đơn hàng của bạn" },
        { status: 404 }
      )
    }

    if (!refundableOrderStatuses.has(order.status)) {
      return NextResponse.json(
        { error: "Chỉ có thể yêu cầu hoàn tiền với đơn đã giao hoặc hoàn tất" },
        { status: 400 }
      )
    }

    if (order.paymentStatus === PaymentStatus.REFUNDED) {
      return NextResponse.json(
        { error: "Đơn hàng này đã được hoàn tiền" },
        { status: 400 }
      )
    }

    if (order.returnRequests.length > 0) {
      return NextResponse.json(
        { error: "Đơn hàng đang có yêu cầu hoàn tiền/chấp tranh xử lý" },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      const created = await tx.returnRequest.create({
        data: {
          orderId: order.id,
          userId: user.id,
          reason: parsed.data.reason,
          description: parsed.data.description,
          images: parsed.data.images,
          videos: parsed.data.videos,
        },
      })

      await tx.notification.create({
        data: {
          userId: order.sellerId,
          type: NotificationType.SYSTEM,
          title: "Đơn hàng có yêu cầu hoàn tiền",
          content: `Khách hàng đã mở yêu cầu hoàn tiền cho đơn ${order.orderNumber}.`,
          link: "/seller/orders",
          data: { orderId: order.id, returnRequestId: created.id },
        },
      })

      const admins = await tx.user.findMany({
        where: { role: UserRole.ADMIN },
        select: { id: true },
      })

      if (admins.length > 0) {
        await tx.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            type: NotificationType.SYSTEM,
            title: "Dispute mới cần xử lý",
            content: `Yêu cầu hoàn tiền cho đơn ${order.orderNumber} đang chờ admin xử lý.`,
            link: "/admin/disputes",
            data: { orderId: order.id, returnRequestId: created.id },
          })),
        })
      }

      return created
    })

    return NextResponse.json({ data: result }, { status: 201 })
  } catch (error) {
    console.error("POST /api/returns error:", error)
    return NextResponse.json(
      { error: "Không thể tạo yêu cầu hoàn tiền" },
      { status: 500 }
    )
  }
}

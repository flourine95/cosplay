import { NextResponse } from "next/server"
import {
  CustomOrderStatus,
  NotificationType,
  SellerStatus,
  UserRole,
} from "@/app/generated/prisma/enums"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  customerCustomOrderInclude,
  serializeCustomerCustomOrder,
} from "@/lib/customer-custom-order"
import { createCustomOrderSchema } from "@/schemas/custom-order"

const generateCustomOrderNumber = () =>
  `CUS-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`

export async function POST(request: Request) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createCustomOrderSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
        { status: 400 }
      )
    }

    const seller = parsed.data.sellerId
      ? await prisma.user.findFirst({
          where: {
            id: parsed.data.sellerId,
            role: UserRole.SELLER,
            sellerStatus: SellerStatus.APPROVED,
          },
          select: { id: true },
        })
      : await prisma.user.findFirst({
          where: {
            role: UserRole.SELLER,
            sellerStatus: SellerStatus.APPROVED,
          },
          select: { id: true },
          orderBy: { id: "asc" },
        })

    if (!seller) {
      return NextResponse.json(
        { error: "Chưa có seller đặt may được duyệt" },
        { status: 400 }
      )
    }

    const order = await prisma.$transaction(async (tx) => {
      const measurement =
        parsed.data.measurement &&
        Object.values(parsed.data.measurement).some((value) => value)
          ? await tx.measurement.create({
              data: {
                userId: user.id,
                name: `Số đo cho ${parsed.data.title}`,
                height: parsed.data.measurement.height,
                weight: parsed.data.measurement.weight,
                chest: parsed.data.measurement.chest,
                waist: parsed.data.measurement.waist,
                hips: parsed.data.measurement.hips,
                shoulder: parsed.data.measurement.shoulder,
                armLength: parsed.data.measurement.armLength,
                legLength: parsed.data.measurement.legLength,
                notes: parsed.data.measurement.notes,
              },
            })
          : null

      const created = await tx.customOrder.create({
        data: {
          userId: user.id,
          sellerId: seller.id,
          measurementId: measurement?.id,
          orderNumber: generateCustomOrderNumber(),
          title: parsed.data.title,
          description: parsed.data.description,
          referenceImages: parsed.data.referenceImages,
          characterName: parsed.data.characterName,
          animeName: parsed.data.animeName,
          specialRequests: parsed.data.specialRequests,
          deadline: parsed.data.deadline,
          estimatedPrice: parsed.data.estimatedPrice,
          status: CustomOrderStatus.SUBMITTED,
          submittedAt: new Date(),
        },
      })

      const user1Id = Math.min(user.id, seller.id)
      const user2Id = Math.max(user.id, seller.id)

      const existingConversation = await tx.conversation.findFirst({
        where: { user1Id, user2Id, customOrderId: created.id },
      })
      const conversation = existingConversation
        ? await tx.conversation.update({
            where: { id: existingConversation.id },
            data: { lastMessageAt: new Date() },
          })
        : await tx.conversation.create({
            data: {
              user1Id,
              user2Id,
              customOrderId: created.id,
              lastMessageAt: new Date(),
            },
          })

      await tx.message.create({
        data: {
          conversationId: conversation.id,
          senderId: user.id,
          content: `Mình vừa gửi yêu cầu đặt may ${created.orderNumber}: ${created.title}`,
          attachments: [],
        },
      })

      await tx.notification.create({
        data: {
          userId: seller.id,
          type: NotificationType.CUSTOM_ORDER,
          title: "Yêu cầu đặt may mới",
          content: `Khách hàng đã gửi yêu cầu đặt may ${created.orderNumber}.`,
          link: "/seller/tailoring/requests",
          data: { customOrderId: created.id },
        },
      })

      return created
    })

    return NextResponse.json({ data: order }, { status: 201 })
  } catch (error) {
    console.error("POST /api/custom-orders error:", error)
    return NextResponse.json(
      { error: "Không thể tạo yêu cầu đặt may" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const orders = await prisma.customOrder.findMany({
      where: { userId: user.id },
      include: customerCustomOrderInclude,
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json({
      data: orders.map(serializeCustomerCustomOrder),
    })
  } catch (error) {
    console.error("GET /api/custom-orders error:", error)
    return NextResponse.json(
      { error: "Không thể lấy danh sách đặt may" },
      { status: 500 }
    )
  }
}

import { NextResponse } from "next/server"
import { UserRole } from "@/app/generated/prisma/enums"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type RouteContext = {
  params: Promise<{ orderNumber: string }>
}

const serializeMessage = (message: {
  id: string
  senderId: number
  content: string
  attachments: string[]
  isRead: boolean
  createdAt: Date
  sender: { id: number; name: string; avatar: string | null }
}) => ({
  id: message.id,
  senderId: message.senderId,
  senderName: message.sender.name,
  senderAvatar: message.sender.avatar,
  content: message.content,
  attachments: message.attachments,
  isRead: message.isRead,
  createdAt: message.createdAt.toISOString(),
})

async function getRentalParticipant(orderNumber: string) {
  const user = await getSession()
  if (!user) return { error: "Vui lòng đăng nhập", status: 401 as const }

  const order = await prisma.rentalOrder.findUnique({
    where: { orderNumber },
    include: {
      user: { select: { id: true, name: true } },
      rentalItem: {
        include: {
          seller: { select: { id: true, name: true, shopName: true } },
          product: { select: { name: true } },
        },
      },
    },
  })

  if (!order) {
    return { error: "Không tìm thấy đơn thuê", status: 404 as const }
  }

  const { sellerId } = order.rentalItem
  const isCustomer = order.userId === user.id
  const isSeller = sellerId === user.id
  const isAdmin = user.role === UserRole.ADMIN

  if (!isCustomer && !isSeller && !isAdmin) {
    return { error: "Không có quyền truy cập", status: 403 as const }
  }

  return { user, order, sellerId, isAdmin, isCustomer, isSeller }
}

function getOtherUserId({
  bodyRecipient,
  customerId,
  isAdmin,
  isCustomer,
  sellerId,
}: {
  bodyRecipient: unknown
  customerId: number
  sellerId: number
  isCustomer: boolean
  isAdmin: boolean
}) {
  if (isCustomer) return sellerId
  if (!isAdmin) return customerId

  const recipient = String(bodyRecipient ?? "customer")
  return recipient === "seller" ? sellerId : customerId
}

async function findOrCreateConversation({
  orderId,
  userId,
  otherUserId,
}: {
  orderId: number
  userId: number
  otherUserId: number
}) {
  const user1Id = Math.min(userId, otherUserId)
  const user2Id = Math.max(userId, otherUserId)

  const existing = await prisma.conversation.findFirst({
    where: { user1Id, user2Id, rentalOrderId: orderId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { id: true, name: true, avatar: true } },
        },
      },
    },
  })

  if (existing) return existing

  return prisma.conversation.create({
    data: { user1Id, user2Id, rentalOrderId: orderId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { id: true, name: true, avatar: true } },
        },
      },
    },
  })
}

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { orderNumber } = await params
    const participant = await getRentalParticipant(orderNumber)
    if ("error" in participant) {
      return NextResponse.json(
        { error: participant.error },
        { status: participant.status }
      )
    }

    const { searchParams } = new URL(request.url)
    const otherUserId = getOtherUserId({
      bodyRecipient: searchParams.get("recipient"),
      customerId: participant.order.userId,
      sellerId: participant.sellerId,
      isCustomer: participant.isCustomer,
      isAdmin: participant.isAdmin,
    })

    const conversation = await findOrCreateConversation({
      orderId: participant.order.id,
      userId: participant.user.id,
      otherUserId,
    })

    return NextResponse.json({
      data: {
        conversationId: conversation.id,
        currentUserId: participant.user.id,
        orderNumber: participant.order.orderNumber,
        itemName: participant.order.rentalItem.product.name,
        messages: conversation.messages.map(serializeMessage),
      },
    })
  } catch (error) {
    console.error(
      "GET /api/rental/bookings/[orderNumber]/messages error:",
      error
    )
    return NextResponse.json(
      { error: "Không thể lấy tin nhắn đơn thuê" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { orderNumber } = await params
    const participant = await getRentalParticipant(orderNumber)
    if ("error" in participant) {
      return NextResponse.json(
        { error: participant.error },
        { status: participant.status }
      )
    }

    const body = await request.json()
    const content = String(body.content ?? "").trim()
    if (!content) {
      return NextResponse.json(
        { error: "Nội dung tin nhắn không hợp lệ" },
        { status: 400 }
      )
    }

    const otherUserId = getOtherUserId({
      bodyRecipient: body.recipient,
      customerId: participant.order.userId,
      sellerId: participant.sellerId,
      isCustomer: participant.isCustomer,
      isAdmin: participant.isAdmin,
    })

    const conversation = await findOrCreateConversation({
      orderId: participant.order.id,
      userId: participant.user.id,
      otherUserId,
    })

    await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: participant.user.id,
          content,
          attachments: [],
        },
      }),
      prisma.conversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt: new Date() },
      }),
    ])

    const updated = await prisma.conversation.findUniqueOrThrow({
      where: { id: conversation.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    })

    return NextResponse.json({
      data: {
        conversationId: updated.id,
        currentUserId: participant.user.id,
        messages: updated.messages.map(serializeMessage),
      },
    })
  } catch (error) {
    console.error(
      "POST /api/rental/bookings/[orderNumber]/messages error:",
      error
    )
    return NextResponse.json(
      { error: "Không thể gửi tin nhắn đơn thuê" },
      { status: 500 }
    )
  }
}

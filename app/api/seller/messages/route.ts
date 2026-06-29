import { NextResponse } from "next/server"
import { requireSeller } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const serializeConversation = (
  conversation: Awaited<ReturnType<typeof getConversationPayload>>
) => {
  const customer =
    conversation.user1Id === conversation.sellerId
      ? conversation.user2
      : conversation.user1
  const [lastMessage] = conversation.messages

  return {
    id: conversation.id,
    customer: {
      id: customer.id,
      name: customer.name,
      avatar: customer.avatar,
    },
    orderId: conversation.orderId,
    customOrderId: conversation.customOrderId,
    rentalOrderId: conversation.rentalOrderId,
    lastMessage: lastMessage?.content ?? "",
    lastMessageAt:
      conversation.lastMessageAt?.toISOString() ??
      conversation.createdAt.toISOString(),
    unreadCount: conversation.messages.filter(
      (message) => message.senderId !== conversation.sellerId && !message.isRead
    ).length,
    messages: [...conversation.messages].reverse().map((message) => ({
      id: message.id,
      senderId: message.senderId,
      content: message.content,
      attachments: message.attachments,
      isRead: message.isRead,
      createdAt: message.createdAt.toISOString(),
    })),
  }
}

async function getConversationPayload(
  sellerId: number,
  conversationId: string
) {
  const conversation = await prisma.conversation.findUniqueOrThrow({
    where: { id: conversationId },
    include: {
      user1: { select: { id: true, name: true, avatar: true } },
      user2: { select: { id: true, name: true, avatar: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  })

  return { ...conversation, sellerId }
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

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: seller.id }, { user2Id: seller.id }],
      },
      include: {
        user1: { select: { id: true, name: true, avatar: true } },
        user2: { select: { id: true, name: true, avatar: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 50 },
      },
      orderBy: { lastMessageAt: "desc" },
    })

    return NextResponse.json({
      data: conversations.map((conversation) =>
        serializeConversation({ ...conversation, sellerId: seller.id })
      ),
    })
  } catch (error) {
    console.error("GET /api/seller/messages error:", error)
    return NextResponse.json(
      { error: "Không thể lấy tin nhắn" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const seller = await requireSeller()
    if (!seller) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const conversationId = String(body.conversationId ?? "")
    const content = String(body.content ?? "").trim()

    if (!conversationId || content.length < 1) {
      return NextResponse.json(
        { error: "Nội dung tin nhắn không hợp lệ" },
        { status: 400 }
      )
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { id: true, user1Id: true, user2Id: true },
    })

    if (
      !conversation ||
      (conversation.user1Id !== seller.id && conversation.user2Id !== seller.id)
    ) {
      return NextResponse.json(
        { error: "Không tìm thấy cuộc trò chuyện" },
        { status: 404 }
      )
    }

    await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId,
          senderId: seller.id,
          content,
          attachments: [],
        },
      }),
      prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      }),
    ])

    const payload = await getConversationPayload(seller.id, conversationId)
    return NextResponse.json({ data: serializeConversation(payload) })
  } catch (error) {
    console.error("POST /api/seller/messages error:", error)
    return NextResponse.json(
      { error: "Không thể gửi tin nhắn" },
      { status: 500 }
    )
  }
}

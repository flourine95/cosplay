import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type RouteContext = {
  params: Promise<{ id: string }>
}

const parseId = (value: string) => {
  const id = Number(value)
  if (!Number.isInteger(id) || id <= 0) throw new Error("INVALID_ID")
  return id
}

async function getOrCreateConversation(customOrderId: number, userId: number) {
  const order = await prisma.customOrder.findUnique({
    where: { id: customOrderId },
    select: { id: true, userId: true, sellerId: true },
  })

  if (!order || order.userId !== userId) return null

  const existing = await prisma.conversation.findFirst({
    where: {
      customOrderId: order.id,
      OR: [
        { user1Id: order.userId, user2Id: order.sellerId },
        { user1Id: order.sellerId, user2Id: order.userId },
      ],
    },
  })

  if (existing) return existing

  const pairExisting = await prisma.conversation.findFirst({
    where: {
      OR: [
        { user1Id: order.userId, user2Id: order.sellerId },
        { user1Id: order.sellerId, user2Id: order.userId },
      ],
    },
  })

  if (pairExisting) {
    return prisma.conversation.update({
      where: { id: pairExisting.id },
      data: { customOrderId: order.id },
    })
  }

  return prisma.conversation.create({
    data: {
      user1Id: order.userId,
      user2Id: order.sellerId,
      customOrderId: order.id,
      lastMessageAt: new Date(),
    },
  })
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const { id } = await params
    const customOrderId = parseId(id)
    const conversation = await getOrCreateConversation(customOrderId, user.id)

    if (!conversation) {
      return NextResponse.json(
        { error: "Không tìm thấy đơn đặt may" },
        { status: 404 }
      )
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    })

    return NextResponse.json({
      data: {
        conversationId: conversation.id,
        messages: messages.map((message) => ({
          id: message.id,
          senderId: message.senderId,
          senderName: message.sender.name,
          senderAvatar: message.sender.avatar,
          content: message.content,
          attachments: message.attachments,
          isRead: message.isRead,
          createdAt: message.createdAt.toISOString(),
        })),
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_ID") {
      return NextResponse.json(
        { error: "Mã đơn đặt may không hợp lệ" },
        { status: 400 }
      )
    }
    console.error("GET /api/custom-orders/[id]/messages error:", error)
    return NextResponse.json(
      { error: "Không thể lấy tin nhắn" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const { id } = await params
    const customOrderId = parseId(id)
    const body = await request.json()
    const content = String(body.content ?? "").trim()

    if (!content) {
      return NextResponse.json(
        { error: "Nội dung tin nhắn không hợp lệ" },
        { status: 400 }
      )
    }

    const conversation = await getOrCreateConversation(customOrderId, user.id)

    if (!conversation) {
      return NextResponse.json(
        { error: "Không tìm thấy đơn đặt may" },
        { status: 404 }
      )
    }

    await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: user.id,
          content,
          attachments: [],
        },
      }),
      prisma.conversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt: new Date() },
      }),
    ])

    const messages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    })

    return NextResponse.json({
      data: {
        conversationId: conversation.id,
        messages: messages.map((message) => ({
          id: message.id,
          senderId: message.senderId,
          senderName: message.sender.name,
          senderAvatar: message.sender.avatar,
          content: message.content,
          attachments: message.attachments,
          isRead: message.isRead,
          createdAt: message.createdAt.toISOString(),
        })),
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_ID") {
      return NextResponse.json(
        { error: "Mã đơn đặt may không hợp lệ" },
        { status: 400 }
      )
    }
    console.error("POST /api/custom-orders/[id]/messages error:", error)
    return NextResponse.json(
      { error: "Không thể gửi tin nhắn" },
      { status: 500 }
    )
  }
}

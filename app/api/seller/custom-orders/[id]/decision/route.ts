import { NextResponse } from "next/server"
import {
  CustomOrderStatus,
  NotificationType,
} from "@/app/generated/prisma/enums"
import { requireSeller } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sellerCustomOrderDecisionSchema } from "@/schemas/custom-order"

type RouteContext = {
  params: Promise<{ id: string }>
}

const parseId = (value: string) => {
  const id = Number(value)
  if (!Number.isInteger(id) || id <= 0) throw new Error("INVALID_ID")
  return id
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const seller = await requireSeller()
    if (!seller) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const { id } = await params
    const customOrderId = parseId(id)
    const body = await request.json()
    const parsed = sellerCustomOrderDecisionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
        { status: 400 }
      )
    }

    const existing = await prisma.customOrder.findUnique({
      where: { id: customOrderId },
      select: {
        id: true,
        userId: true,
        sellerId: true,
        orderNumber: true,
        status: true,
        acceptedAt: true,
      },
    })

    if (!existing || existing.sellerId !== seller.id) {
      return NextResponse.json(
        { error: "Không tìm thấy đơn đặt may" },
        { status: 404 }
      )
    }

    if (
      existing.status !== CustomOrderStatus.SUBMITTED ||
      existing.acceptedAt
    ) {
      return NextResponse.json(
        { error: "Yêu cầu này đã được xử lý" },
        { status: 400 }
      )
    }

    const isAccepted = parsed.data.action === "accept"
    const updated = await prisma.$transaction(async (tx) => {
      const order = await tx.customOrder.update({
        where: { id: customOrderId },
        data: isAccepted
          ? { acceptedAt: new Date() }
          : { status: CustomOrderStatus.CANCELLED },
      })

      await tx.notification.create({
        data: {
          userId: existing.userId,
          type: NotificationType.CUSTOM_ORDER,
          title: isAccepted
            ? "Seller đã nhận yêu cầu đặt may"
            : "Seller đã từ chối yêu cầu đặt may",
          content: isAccepted
            ? `Seller đã nhận yêu cầu ${existing.orderNumber} và sẽ báo giá.`
            : `Seller đã từ chối yêu cầu ${existing.orderNumber}.${parsed.data.note ? ` Lý do: ${parsed.data.note}` : ""}`,
          link: `/custom-order/${existing.id}`,
          data: {
            customOrderId: existing.id,
            action: parsed.data.action,
            note: parsed.data.note,
          },
        },
      })

      return order
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_ID") {
      return NextResponse.json(
        { error: "Mã đơn đặt may không hợp lệ" },
        { status: 400 }
      )
    }

    console.error("PATCH /api/seller/custom-orders/[id]/decision error:", error)
    return NextResponse.json(
      { error: "Không thể xử lý yêu cầu đặt may" },
      { status: 500 }
    )
  }
}

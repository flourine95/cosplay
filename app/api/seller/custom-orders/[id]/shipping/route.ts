import { NextResponse } from "next/server"
import {
  CustomOrderStatus,
  NotificationType,
} from "@/app/generated/prisma/enums"
import { requireSeller } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  sellerCustomOrderInclude,
  serializeSellerCustomOrder,
} from "@/lib/seller-custom-order"

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
        { error: "Khong co quyen truy cap" },
        { status: 403 }
      )
    }

    const { id } = await params
    const orderId = parseId(id)
    const body = await request.json()
    const trackingCode = String(body.trackingCode ?? "").trim()
    const shippingCarrier = String(body.shippingCarrier ?? "").trim()
    const shippingFee = Number(body.shippingFee ?? 0)

    if (!trackingCode || !shippingCarrier) {
      return NextResponse.json(
        { error: "Vui long nhap don vi van chuyen va ma van don" },
        { status: 400 }
      )
    }

    if (!Number.isFinite(shippingFee) || shippingFee < 0) {
      return NextResponse.json(
        { error: "Phi giao hang khong hop le" },
        { status: 400 }
      )
    }

    const existing = await prisma.customOrder.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        sellerId: true,
        status: true,
        orderNumber: true,
      },
    })

    if (!existing || existing.sellerId !== seller.id) {
      return NextResponse.json(
        { error: "Khong tim thay don dat may" },
        { status: 404 }
      )
    }

    if (existing.status !== CustomOrderStatus.READY) {
      return NextResponse.json(
        { error: "Chi co the giao hang khi don da san sang giao" },
        { status: 400 }
      )
    }

    const order = await prisma.$transaction(async (tx) => {
      await tx.customOrder.update({
        where: { id: orderId },
        data: {
          trackingCode,
          shippingCarrier,
          shippingFee,
        },
      })

      await tx.notification.create({
        data: {
          userId: existing.userId,
          type: NotificationType.CUSTOM_ORDER,
          title: "Hang dat may da giao",
          content: `Don ${existing.orderNumber} da duoc giao qua ${shippingCarrier}, ma van don ${trackingCode}.`,
          link: `/custom-order/${existing.id}`,
          data: { customOrderId: existing.id, trackingCode, shippingCarrier },
        },
      })

      return tx.customOrder.findUniqueOrThrow({
        where: { id: orderId },
        include: sellerCustomOrderInclude,
      })
    })

    return NextResponse.json({ data: serializeSellerCustomOrder(order) })
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_ID") {
      return NextResponse.json(
        { error: "Ma don dat may khong hop le" },
        { status: 400 }
      )
    }
    console.error("PATCH /api/seller/custom-orders/[id]/shipping error:", error)
    return NextResponse.json(
      { error: "Khong the cap nhat giao hang" },
      { status: 500 }
    )
  }
}

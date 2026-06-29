import { NextResponse } from "next/server"
import {
  NotificationType,
  RentalDisputeStatus,
  RentalStatus,
} from "@/app/generated/prisma/enums"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rentalOrderInclude, serializeRentalOrder } from "@/lib/rental-order"

type RouteContext = {
  params: Promise<{ orderNumber: string }>
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Chua dang nhap" }, { status: 401 })
    }

    const { orderNumber } = await params
    const body = await request.json()
    const reason = String(body.reason ?? "").trim()
    const description = String(body.description ?? "").trim()
    const images = Array.isArray(body.images)
      ? body.images.filter(
          (item: unknown): item is string => typeof item === "string"
        )
      : []

    if (!reason || !description) {
      return NextResponse.json(
        { error: "Vui long nhap ly do va mo ta khieu nai" },
        { status: 400 }
      )
    }

    const existing = await prisma.rentalOrder.findFirst({
      where: { orderNumber, userId: user.id },
      include: rentalOrderInclude,
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Khong tim thay don thue" },
        { status: 404 }
      )
    }

    if (
      existing.status !== RentalStatus.DEPOSIT_REFUNDED &&
      existing.status !== RentalStatus.COMPLETED
    ) {
      return NextResponse.json(
        { error: "Chi co the khieu nai sau khi shop da kiem tra va xu ly coc" },
        { status: 400 }
      )
    }

    const openStatuses: RentalDisputeStatus[] = [
      RentalDisputeStatus.OPEN,
      RentalDisputeStatus.SHOP_RESPONDED,
      RentalDisputeStatus.ADMIN_REVIEWING,
    ]
    const openDispute = existing.disputes.find((dispute) =>
      openStatuses.includes(dispute.status)
    )

    if (openDispute) {
      return NextResponse.json(
        { error: "Don thue nay dang co khieu nai mo" },
        { status: 409 }
      )
    }

    const order = await prisma.$transaction(async (tx) => {
      await tx.rentalDispute.create({
        data: {
          rentalOrderId: existing.id,
          userId: user.id,
          sellerId: existing.rentalItem.sellerId,
          reason,
          description,
          images,
        },
      })

      await tx.notification.create({
        data: {
          userId: existing.rentalItem.sellerId,
          type: NotificationType.RENTAL,
          title: "Khach da tao khieu nai don thue",
          content: `Don ${existing.orderNumber} co khieu nai moi can phan hoi.`,
          link: "/seller/rentals",
          data: {
            rentalOrderId: existing.id,
            orderNumber: existing.orderNumber,
          },
        },
      })

      return tx.rentalOrder.findUniqueOrThrow({
        where: { id: existing.id },
        include: rentalOrderInclude,
      })
    })

    return NextResponse.json({ rental: serializeRentalOrder(order) })
  } catch (error) {
    console.error(
      "POST /api/rental/bookings/[orderNumber]/dispute error:",
      error
    )
    return NextResponse.json(
      { error: "Khong the tao khieu nai don thue" },
      { status: 500 }
    )
  }
}

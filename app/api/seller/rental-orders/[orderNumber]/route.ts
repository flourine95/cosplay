import { NextResponse } from "next/server"
import {
  NotificationType,
  RentalDisputeStatus,
  RentalItemCondition,
  RentalStatus,
  UserRole,
} from "@/app/generated/prisma/enums"
import { requireSeller } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rentalOrderInclude, serializeRentalOrder } from "@/lib/rental-order"

type RouteContext = {
  params: Promise<{ orderNumber: string }>
}

const validConditions = Object.values(RentalItemCondition)

const lateDaysFor = (endDate: Date, actualReturnDate: Date) => {
  const end = new Date(endDate)
  const returned = new Date(actualReturnDate)
  end.setHours(0, 0, 0, 0)
  returned.setHours(0, 0, 0, 0)
  return Math.max(
    Math.ceil((returned.getTime() - end.getTime()) / (24 * 60 * 60 * 1000)),
    0
  )
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

    const { orderNumber } = await params
    const body = await request.json()
    const action = String(body.action ?? "")
    const note = String(body.note ?? "").trim()

    const existing = await prisma.rentalOrder.findFirst({
      where: { orderNumber, rentalItem: { sellerId: seller.id } },
      include: rentalOrderInclude,
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Khong tim thay don thue" },
        { status: 404 }
      )
    }

    if (action === "confirm") {
      if (existing.status !== RentalStatus.DEPOSIT_PAID) {
        return NextResponse.json(
          { error: "Chi co the xac nhan don da thanh toan coc" },
          { status: 400 }
        )
      }

      const order = await prisma.rentalOrder.update({
        where: { id: existing.id },
        data: {
          status: RentalStatus.CONFIRMED,
          confirmedAt: new Date(),
        },
        include: rentalOrderInclude,
      })

      return NextResponse.json({ data: serializeRentalOrder(order) })
    }

    if (action === "markReady") {
      if (
        existing.status !== RentalStatus.CONFIRMED &&
        existing.status !== RentalStatus.DEPOSIT_PAID
      ) {
        return NextResponse.json(
          { error: "Don chua san sang de chuyen sang giao do" },
          { status: 400 }
        )
      }

      const order = await prisma.rentalOrder.update({
        where: { id: existing.id },
        data: {
          status: RentalStatus.READY_FOR_PICKUP,
          pickupNotes: note || null,
          conditionAtPickup: existing.rentalItem.condition,
        },
        include: rentalOrderInclude,
      })

      await prisma.notification.create({
        data: {
          userId: existing.userId,
          type: NotificationType.RENTAL,
          title: "Don thue da san sang nhan",
          content: `Shop da chuan bi xong don ${existing.orderNumber}. Vui long xac nhan khi ban da nhan do.`,
          link: "/rental/management",
          data: {
            rentalOrderId: existing.id,
            orderNumber: existing.orderNumber,
          },
        },
      })

      return NextResponse.json({ data: serializeRentalOrder(order) })
    }

    if (action === "cancel") {
      if (
        existing.status !== RentalStatus.DEPOSIT_PAID &&
        existing.status !== RentalStatus.CONFIRMED &&
        existing.status !== RentalStatus.READY_FOR_PICKUP
      ) {
        return NextResponse.json(
          { error: "Khong the huy don o trang thai hien tai" },
          { status: 400 }
        )
      }

      const order = await prisma.rentalOrder.update({
        where: { id: existing.id },
        data: { status: RentalStatus.CANCELLED },
        include: rentalOrderInclude,
      })

      await prisma.notification.create({
        data: {
          userId: existing.userId,
          type: NotificationType.RENTAL,
          title: "Shop da huy don thue",
          content: `Don ${existing.orderNumber} da bi huy. Vui long lien he shop neu can ho tro.`,
          link: "/rental/management",
          data: {
            rentalOrderId: existing.id,
            orderNumber: existing.orderNumber,
          },
        },
      })

      return NextResponse.json({ data: serializeRentalOrder(order) })
    }

    if (action === "inspectReturn") {
      if (existing.status !== RentalStatus.RETURNED) {
        return NextResponse.json(
          { error: "Chi co the kiem tra sau khi khach yeu cau tra do" },
          { status: 400 }
        )
      }

      const actualReturnDate = body.actualReturnDate
        ? new Date(String(body.actualReturnDate))
        : new Date()
      if (Number.isNaN(actualReturnDate.getTime())) {
        return NextResponse.json(
          { error: "Ngay tra thuc te khong hop le" },
          { status: 400 }
        )
      }

      const conditionAtReturn = String(body.conditionAtReturn ?? "")
      if (!validConditions.includes(conditionAtReturn as RentalItemCondition)) {
        return NextResponse.json(
          { error: "Tinh trang do khi tra khong hop le" },
          { status: 400 }
        )
      }

      const damageFee = Math.max(Number(body.damageFee ?? 0), 0)
      const lateDays = lateDaysFor(existing.endDate, actualReturnDate)
      const lateFee = lateDays * existing.pricePerDay.toNumber() * 0.5
      const refundAmount = Math.max(
        existing.depositAmount.toNumber() - damageFee - lateFee,
        0
      )
      const damageDescription = String(body.damageDescription ?? "").trim()

      const order = await prisma.$transaction(async (tx) => {
        const updated = await tx.rentalOrder.update({
          where: { id: existing.id },
          data: {
            status: RentalStatus.DEPOSIT_REFUNDED,
            actualReturnDate,
            conditionAtReturn: conditionAtReturn as RentalItemCondition,
            damageFee,
            lateFee,
            refundAmount,
            damageDescription: damageDescription || null,
            completedAt: null,
          },
          include: rentalOrderInclude,
        })

        return updated
      })

      await prisma.notification.create({
        data: {
          userId: existing.userId,
          type: NotificationType.RENTAL,
          title: "Shop da kiem tra do tra",
          content: `Don ${existing.orderNumber}: shop da xac nhan nhan lai do. Admin se hoan coc ${refundAmount.toLocaleString("vi-VN")} VND sau khi doi soat.`,
          link: "/rental/management",
          data: {
            rentalOrderId: existing.id,
            orderNumber: existing.orderNumber,
          },
        },
      })

      const admins = await prisma.user.findMany({
        where: { role: UserRole.ADMIN },
        select: { id: true },
      })
      if (admins.length > 0) {
        await prisma.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            type: NotificationType.RENTAL,
            title: "Don thue cho hoan coc",
            content: `Don ${existing.orderNumber} da duoc shop kiem tra. Can hoan coc ${refundAmount.toLocaleString("vi-VN")} VND cho khach.`,
            link: "/admin/orders",
            data: {
              rentalOrderId: existing.id,
              orderNumber: existing.orderNumber,
            },
          })),
        })
      }

      return NextResponse.json({ data: serializeRentalOrder(order) })
    }

    if (action === "respondDispute") {
      const disputeId = Number(body.disputeId)
      const response = String(body.response ?? "").trim()

      if (!Number.isInteger(disputeId) || !response) {
        return NextResponse.json(
          { error: "Du lieu phan hoi khieu nai khong hop le" },
          { status: 400 }
        )
      }

      const dispute = existing.disputes.find((item) => item.id === disputeId)
      if (!dispute || dispute.status !== RentalDisputeStatus.OPEN) {
        return NextResponse.json(
          { error: "Khong tim thay khieu nai dang mo" },
          { status: 404 }
        )
      }

      const order = await prisma.$transaction(async (tx) => {
        await tx.rentalDispute.update({
          where: { id: disputeId },
          data: {
            shopResponse: response,
            status: RentalDisputeStatus.SHOP_RESPONDED,
          },
        })

        await tx.notification.create({
          data: {
            userId: existing.userId,
            type: NotificationType.RENTAL,
            title: "Shop da phan hoi khieu nai",
            content: `Shop da phan hoi khieu nai cho don ${existing.orderNumber}.`,
            link: "/rental/management",
            data: { rentalOrderId: existing.id, disputeId },
          },
        })

        return tx.rentalOrder.findUniqueOrThrow({
          where: { id: existing.id },
          include: rentalOrderInclude,
        })
      })

      return NextResponse.json({ data: serializeRentalOrder(order) })
    }

    return NextResponse.json(
      { error: "Hanh dong don thue khong hop le" },
      { status: 400 }
    )
  } catch (error) {
    console.error("PATCH /api/seller/rental-orders/[orderNumber] error:", error)
    return NextResponse.json(
      { error: "Khong the cap nhat don thue" },
      { status: 500 }
    )
  }
}

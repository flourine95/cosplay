import { NextResponse } from "next/server"
import {
  NotificationType,
  PaymentMethod,
  PaymentStatus,
  PaymentType,
  RentalStatus,
  UserRole,
} from "@/app/generated/prisma/enums"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  activeRentalStatuses,
  rentalOrderInclude,
  serializeRentalOrder,
} from "@/lib/rental-order"

const generateRentalOrderNumber = () =>
  `REN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`

const startOfDay = (date: Date) => {
  const normalized = new Date(date)
  normalized.setHours(0, 0, 0, 0)
  return normalized
}

const rentalDaysBetween = (startDate: Date, endDate: Date) =>
  Math.floor(
    (startOfDay(endDate).getTime() - startOfDay(startDate).getTime()) /
      (24 * 60 * 60 * 1000)
  ) + 1

const getRentalOrder = (orderNumber: string, userId: number) =>
  prisma.rentalOrder.findFirst({
    where: { orderNumber, userId },
    include: rentalOrderInclude,
  })

const getImageUrls = (value: unknown) =>
  Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter((item) => item.startsWith("/uploads/"))
    : []

const getRequiredText = (value: unknown) =>
  typeof value === "string" ? value.trim() : ""

const notifyAdmins = async ({
  content,
  orderId,
  orderNumber,
  title,
}: {
  content: string
  orderId: number
  orderNumber: string
  title: string
}) => {
  const admins = await prisma.user.findMany({
    where: { role: UserRole.ADMIN },
    select: { id: true },
  })

  if (admins.length === 0) return

  await prisma.notification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      type: NotificationType.RENTAL,
      title,
      content,
      link: "/admin/orders",
      data: { rentalOrderId: orderId, orderNumber },
    })),
  })
}

export async function GET() {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Chua dang nhap" }, { status: 401 })
    }

    const orders = await prisma.rentalOrder.findMany({
      where: { userId: user.id },
      include: rentalOrderInclude,
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json({
      rentals: orders.map((order) => serializeRentalOrder(order)),
    })
  } catch (error) {
    console.error("GET /api/rental/bookings error:", error)
    return NextResponse.json(
      { error: "Khong the lay danh sach don thue" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Chua dang nhap" }, { status: 401 })
    }

    const body = await request.json()
    const rentalItemId = Number(body.rentalItemId)
    const startDate = new Date(String(body.startDate ?? ""))
    const endDate = new Date(String(body.endDate ?? ""))
    const shippingName = getRequiredText(body.shippingName)
    const shippingPhone = getRequiredText(body.shippingPhone)
    const shippingAddress = getRequiredText(body.shippingAddress)
    const shippingCity = getRequiredText(body.shippingCity)
    const shippingDistrict = getRequiredText(body.shippingDistrict)
    const shippingWard = getRequiredText(body.shippingWard)
    const shippingNote = getRequiredText(body.shippingNote)

    if (
      !Number.isInteger(rentalItemId) ||
      rentalItemId <= 0 ||
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      return NextResponse.json(
        { error: "Du lieu dat thue khong hop le" },
        { status: 400 }
      )
    }

    if (
      !shippingName ||
      !shippingPhone ||
      !shippingAddress ||
      !shippingCity ||
      !shippingDistrict ||
      !shippingWard
    ) {
      return NextResponse.json(
        { error: "Vui long nhap day du dia chi giao hang" },
        { status: 400 }
      )
    }

    const normalizedStart = startOfDay(startDate)
    const normalizedEnd = startOfDay(endDate)
    const today = startOfDay(new Date())

    if (normalizedStart < today) {
      return NextResponse.json(
        { error: "Khong the dat thue ngay trong qua khu" },
        { status: 400 }
      )
    }

    if (normalizedEnd < normalizedStart) {
      return NextResponse.json(
        { error: "Ngay tra phai sau hoac bang ngay nhan" },
        { status: 400 }
      )
    }

    const rentalItem = await prisma.rentalItem.findUnique({
      where: { id: rentalItemId },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            phone: true,
            shopName: true,
            shopReturnName: true,
            shopReturnPhone: true,
            shopReturnAddress: true,
            shopReturnCity: true,
            shopReturnDistrict: true,
            shopReturnWard: true,
            shopReturnNote: true,
          },
        },
        product: { select: { id: true, name: true, slug: true } },
      },
    })

    if (!rentalItem || !rentalItem.isAvailable) {
      return NextResponse.json(
        { error: "San pham thue khong kha dung" },
        { status: 404 }
      )
    }

    if (rentalItem.sellerId === user.id) {
      return NextResponse.json(
        { error: "Khong the thue san pham cua chinh ban" },
        { status: 400 }
      )
    }

    const returnName =
      rentalItem.seller.shopReturnName ??
      rentalItem.seller.shopName ??
      rentalItem.seller.name
    const returnPhone =
      rentalItem.seller.shopReturnPhone ?? rentalItem.seller.phone ?? ""
    const returnAddress = rentalItem.seller.shopReturnAddress ?? ""
    const returnCity = rentalItem.seller.shopReturnCity ?? ""
    const returnDistrict = rentalItem.seller.shopReturnDistrict ?? ""
    const returnWard = rentalItem.seller.shopReturnWard ?? ""
    const returnAddressNote = rentalItem.seller.shopReturnNote ?? null

    if (
      !returnName ||
      !returnPhone ||
      !returnAddress ||
      !returnCity ||
      !returnDistrict ||
      !returnWard
    ) {
      return NextResponse.json(
        { error: "Shop chua cau hinh dia chi nhan do tra ve" },
        { status: 400 }
      )
    }

    const totalDays = rentalDaysBetween(normalizedStart, normalizedEnd)
    if (totalDays < rentalItem.minDays) {
      return NextResponse.json(
        { error: `Thoi gian thue toi thieu la ${rentalItem.minDays} ngay` },
        { status: 400 }
      )
    }

    if (rentalItem.maxDays && totalDays > rentalItem.maxDays) {
      return NextResponse.json(
        { error: `Thoi gian thue toi da la ${rentalItem.maxDays} ngay` },
        { status: 400 }
      )
    }

    const conflict = await prisma.rentalOrder.findFirst({
      where: {
        rentalItemId,
        status: { in: activeRentalStatuses },
        startDate: { lte: normalizedEnd },
        endDate: { gte: normalizedStart },
      },
      select: { id: true },
    })

    if (conflict) {
      return NextResponse.json(
        { error: "Khoang ngay nay da co nguoi dat thue" },
        { status: 409 }
      )
    }

    const rentalFee = rentalItem.pricePerDay.toNumber() * totalDays
    const depositAmount = rentalItem.depositAmount.toNumber()
    const totalPayment = rentalFee + depositAmount

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.rentalOrder.create({
        data: {
          userId: user.id,
          rentalItemId,
          orderNumber: generateRentalOrderNumber(),
          startDate: normalizedStart,
          endDate: normalizedEnd,
          pricePerDay: rentalItem.pricePerDay,
          totalDays,
          rentalFee,
          depositAmount,
          shippingName,
          shippingPhone,
          shippingAddress,
          shippingCity,
          shippingDistrict,
          shippingWard,
          shippingNote: shippingNote || null,
          returnName,
          returnPhone,
          returnAddress,
          returnCity,
          returnDistrict,
          returnWard,
          returnAddressNote,
          refundAmount: depositAmount,
          status: RentalStatus.DEPOSIT_PAID,
        },
      })

      await tx.payment.create({
        data: {
          rentalOrderId: created.id,
          amount: totalPayment,
          paymentMethod: PaymentMethod.BANK_TRANSFER,
          paymentType: PaymentType.RENTAL_DEPOSIT,
          status: PaymentStatus.PAID,
          transactionId: `RENTAL-MOCK-${created.id}-${Date.now()}`,
          transactionData: {
            source: "mock",
            note: "Mock payment for rental booking. Admin holds the deposit until seller confirms the returned item.",
            rentalFee,
            depositAmount,
            totalDays,
          },
          paidAt: new Date(),
        },
      })

      const user1Id = Math.min(user.id, rentalItem.sellerId)
      const user2Id = Math.max(user.id, rentalItem.sellerId)
      const existingConversation = await tx.conversation.findFirst({
        where: { user1Id, user2Id, rentalOrderId: created.id },
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
              rentalOrderId: created.id,
              lastMessageAt: new Date(),
            },
          })

      await tx.message.create({
        data: {
          conversationId: conversation.id,
          senderId: user.id,
          content: `Minh vua dat thue ${rentalItem.product.name} (${created.orderNumber}) tu ${normalizedStart.toLocaleDateString("vi-VN")} den ${normalizedEnd.toLocaleDateString("vi-VN")}.`,
          attachments: [],
        },
      })

      await tx.notification.create({
        data: {
          userId: rentalItem.sellerId,
          type: NotificationType.RENTAL,
          title: "Co don thue moi",
          content: `Khach hang da dat thue ${rentalItem.product.name} trong ${totalDays} ngay.`,
          link: "/seller/calendar",
          data: { rentalOrderId: created.id, orderNumber: created.orderNumber },
        },
      })

      return tx.rentalOrder.findUniqueOrThrow({
        where: { id: created.id },
        include: rentalOrderInclude,
      })
    })

    return NextResponse.json(
      {
        order: { id: order.id, orderNumber: order.orderNumber },
        rental: serializeRentalOrder(order),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("POST /api/rental/bookings error:", error)
    return NextResponse.json(
      { error: "Khong the tao don thue" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Chua dang nhap" }, { status: 401 })
    }

    const body = await request.json()
    const orderNumber = String(body.orderNumber ?? "").trim()
    const action = String(body.action ?? "requestReturn")
    const returnNote = String(body.returnNote ?? "").trim()
    const pickupImages = getImageUrls(body.pickupImages)
    const returnImages = getImageUrls(body.returnImages)

    if (!orderNumber) {
      return NextResponse.json(
        { error: "Ma don thue khong hop le" },
        { status: 400 }
      )
    }

    const existing = await getRentalOrder(orderNumber, user.id)
    if (!existing) {
      return NextResponse.json(
        { error: "Khong tim thay don thue" },
        { status: 404 }
      )
    }

    if (action === "confirmReceived") {
      if (existing.status !== RentalStatus.READY_FOR_PICKUP) {
        return NextResponse.json(
          { error: "Chi co the xac nhan nhan do khi shop da san sang giao" },
          { status: 400 }
        )
      }

      if (pickupImages.length === 0) {
        return NextResponse.json(
          { error: "Vui long tai anh tinh trang do khi nhan" },
          { status: 400 }
        )
      }

      const order = await prisma.rentalOrder.update({
        where: { id: existing.id },
        data: {
          status: RentalStatus.RENTED,
          pickedUpAt: new Date(),
          conditionAtPickup: existing.rentalItem.condition,
          pickupImages,
        },
        include: rentalOrderInclude,
      })

      await prisma.notification.create({
        data: {
          userId: order.rentalItem.sellerId,
          type: NotificationType.RENTAL,
          title: "Khach da xac nhan nhan do",
          content: `Don ${order.orderNumber} da chuyen sang trang thai dang thue.`,
          link: "/seller/rentals",
          data: { rentalOrderId: order.id, orderNumber: order.orderNumber },
        },
      })

      await notifyAdmins({
        title: "Khach da nhan do va gui anh",
        content: `Don ${order.orderNumber}: khach da xac nhan nhan do va tai ${pickupImages.length} anh tinh trang ban dau.`,
        orderId: order.id,
        orderNumber: order.orderNumber,
      })

      return NextResponse.json({ rental: serializeRentalOrder(order) })
    }

    if (action !== "requestReturn") {
      return NextResponse.json(
        { error: "Hanh dong don thue khong hop le" },
        { status: 400 }
      )
    }

    if (
      existing.status !== RentalStatus.RENTED &&
      existing.status !== RentalStatus.OVERDUE
    ) {
      return NextResponse.json(
        { error: "Chi co the bao cao tra do khi don dang thue" },
        { status: 400 }
      )
    }

    if (returnImages.length === 0) {
      return NextResponse.json(
        { error: "Vui long tai anh tinh trang do truoc khi tra" },
        { status: 400 }
      )
    }

    const order = await prisma.rentalOrder.update({
      where: { id: existing.id },
      data: {
        status: RentalStatus.RETURNED,
        actualReturnDate: new Date(),
        returnedAt: new Date(),
        returnNotes: returnNote || null,
        returnImages,
      },
      include: rentalOrderInclude,
    })

    await prisma.notification.create({
      data: {
        userId: order.rentalItem.sellerId,
        type: NotificationType.RENTAL,
        title: "Khach da bao cao tra do",
        content: `Don ${order.orderNumber} dang cho seller kiem tra tinh trang do.`,
        link: "/seller/calendar",
        data: { rentalOrderId: order.id, orderNumber: order.orderNumber },
      },
    })

    await notifyAdmins({
      title: "Khach da gui anh tra do",
      content: `Don ${order.orderNumber}: khach da yeu cau tra do va tai ${returnImages.length} anh truoc khi tra.`,
      orderId: order.id,
      orderNumber: order.orderNumber,
    })

    return NextResponse.json({ rental: serializeRentalOrder(order) })
  } catch (error) {
    console.error("PATCH /api/rental/bookings error:", error)
    return NextResponse.json(
      { error: "Khong the cap nhat don thue" },
      { status: 500 }
    )
  }
}

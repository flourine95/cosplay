import { NextResponse } from "next/server"
import { Prisma } from "@/app/generated/prisma/client"
import {
  EscrowStatus,
  NotificationType,
  OrderStatus,
  PaymentStatus,
  PayoutStatus,
  ReturnStatus,
  UserRole,
} from "@/app/generated/prisma/enums"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { adminUpdateReturnRequestSchema } from "@/schemas/return-request"

type RouteContext = {
  params: Promise<{ id: string }>
}

const parseId = (value: string) => {
  const id = Number(value)
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("INVALID_DISPUTE_ID")
  }
  return id
}

const resolvedStatuses = new Set<string>([
  ReturnStatus.REJECTED,
  ReturnStatus.REFUNDED,
  ReturnStatus.CLOSED,
])

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const admin = await getSession()
    if (!admin || admin.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const { id } = await params
    const disputeId = parseId(id)
    const body = await request.json()
    const parsed = adminUpdateReturnRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
        { status: 400 }
      )
    }

    const dispute = await prisma.returnRequest.findUnique({
      where: { id: disputeId },
      include: {
        order: {
          include: {
            payout: { select: { id: true, status: true } },
          },
        },
      },
    })

    if (!dispute) {
      return NextResponse.json(
        { error: "Không tìm thấy dispute" },
        { status: 404 }
      )
    }

    const { status, adminNote, refundAmount } = parsed.data
    const requestedRefundAmount =
      refundAmount === undefined ? null : new Prisma.Decimal(refundAmount)

    if (
      status === ReturnStatus.REFUNDED &&
      dispute.order.payout?.status === PayoutStatus.COMPLETED
    ) {
      return NextResponse.json(
        { error: "Không thể hoàn tiền vì payout đã chuyển cho seller" },
        { status: 400 }
      )
    }

    if (
      status === ReturnStatus.REFUNDED &&
      dispute.order.escrowStatus === EscrowStatus.RELEASED
    ) {
      return NextResponse.json(
        { error: "Không thể hoàn tiền vì escrow đã release" },
        { status: 400 }
      )
    }

    if (
      status === ReturnStatus.REFUNDED &&
      requestedRefundAmount &&
      requestedRefundAmount.greaterThan(dispute.order.total)
    ) {
      return NextResponse.json(
        { error: "Số tiền hoàn không được vượt quá giá trị đơn hàng" },
        { status: 400 }
      )
    }

    const updated = await prisma.$transaction(async (tx) => {
      const next = await tx.returnRequest.update({
        where: { id: disputeId },
        data: {
          status,
          adminNote,
          refundAmount:
            status === ReturnStatus.REFUNDED
              ? (requestedRefundAmount ?? dispute.order.total)
              : requestedRefundAmount,
          refundedAt: status === ReturnStatus.REFUNDED ? new Date() : null,
          resolvedAt: resolvedStatuses.has(status) ? new Date() : null,
        },
      })

      if (status === ReturnStatus.REFUNDED) {
        await tx.order.update({
          where: { id: dispute.orderId },
          data: {
            status: OrderStatus.REFUNDED,
            paymentStatus: PaymentStatus.REFUNDED,
            escrowStatus: EscrowStatus.REFUNDED,
            payoutId: null,
            adminNote,
          },
        })

        await tx.payment.updateMany({
          where: { orderId: dispute.orderId },
          data: { status: PaymentStatus.REFUNDED },
        })
      }

      await tx.notification.createMany({
        data: [
          {
            userId: dispute.userId,
            type: NotificationType.SYSTEM,
            title: "Yêu cầu hoàn tiền đã được cập nhật",
            content: `Admin đã cập nhật yêu cầu hoàn tiền của đơn ${dispute.order.orderNumber} sang ${status}.`,
            link: "/profile/orders",
            data: { returnRequestId: dispute.id, status, updatedBy: admin.id },
          },
          {
            userId: dispute.order.sellerId,
            type: NotificationType.SYSTEM,
            title: "Dispute đơn hàng đã được cập nhật",
            content: `Dispute của đơn ${dispute.order.orderNumber} đã chuyển sang ${status}.`,
            link: "/seller/orders",
            data: { returnRequestId: dispute.id, status, updatedBy: admin.id },
          },
        ],
      })

      return next
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_DISPUTE_ID") {
      return NextResponse.json(
        { error: "Mã dispute không hợp lệ" },
        { status: 400 }
      )
    }

    console.error("PATCH /api/admin/disputes/[id] error:", error)
    return NextResponse.json(
      { error: "Không thể cập nhật dispute" },
      { status: 500 }
    )
  }
}

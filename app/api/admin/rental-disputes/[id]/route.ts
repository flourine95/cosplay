import { NextResponse } from "next/server"
import {
  NotificationType,
  RentalDisputeStatus,
  RentalStatus,
  UserRole,
} from "@/app/generated/prisma/enums"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type RouteContext = {
  params: Promise<{ id: string }>
}

const finalStatuses = new Set<RentalDisputeStatus>([
  RentalDisputeStatus.RESOLVED_REFUND_CUSTOMER,
  RentalDisputeStatus.RESOLVED_PAY_SHOP,
  RentalDisputeStatus.RESOLVED_SPLIT,
  RentalDisputeStatus.CLOSED,
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
    const disputeId = Number(id)
    if (!Number.isInteger(disputeId) || disputeId <= 0) {
      return NextResponse.json(
        { error: "Mã tranh chấp không hợp lệ" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const status = String(body.status ?? "") as RentalDisputeStatus
    const adminNote = String(body.adminNote ?? "").trim()
    const refundAmount = Math.max(Number(body.refundAmount ?? 0), 0)

    if (!Object.values(RentalDisputeStatus).includes(status)) {
      return NextResponse.json(
        { error: "Trạng thái phán quyết không hợp lệ" },
        { status: 400 }
      )
    }

    const existing = await prisma.rentalDispute.findUnique({
      where: { id: disputeId },
      include: {
        rentalOrder: {
          include: {
            rentalItem: {
              include: { product: { select: { name: true } } },
            },
          },
        },
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Không tìm thấy tranh chấp thuê" },
        { status: 404 }
      )
    }

    const maxDeposit = existing.rentalOrder.depositAmount.toNumber()
    if (
      (status === RentalDisputeStatus.RESOLVED_REFUND_CUSTOMER ||
        status === RentalDisputeStatus.RESOLVED_SPLIT) &&
      refundAmount > maxDeposit
    ) {
      return NextResponse.json(
        { error: "Số tiền hoàn không được vượt quá tiền cọc" },
        { status: 400 }
      )
    }

    const finalRefundAmount =
      status === RentalDisputeStatus.RESOLVED_REFUND_CUSTOMER
        ? maxDeposit
        : status === RentalDisputeStatus.RESOLVED_PAY_SHOP
          ? 0
          : status === RentalDisputeStatus.RESOLVED_SPLIT
            ? refundAmount
            : existing.refundAmount?.toNumber()

    await prisma.$transaction(async (tx) => {
      await tx.rentalDispute.update({
        where: { id: disputeId },
        data: {
          status,
          adminNote: adminNote || null,
          refundAmount: finalRefundAmount,
          resolvedAt: finalStatuses.has(status) ? new Date() : null,
        },
      })

      if (finalStatuses.has(status)) {
        await tx.rentalOrder.update({
          where: { id: existing.rentalOrderId },
          data: {
            refundAmount: finalRefundAmount ?? 0,
            status: RentalStatus.COMPLETED,
            completedAt: new Date(),
          },
        })
      }

      await tx.notification.createMany({
        data: [
          {
            userId: existing.userId,
            type: NotificationType.RENTAL,
            title: "Admin đã ra phán quyết tranh chấp thuê",
            content: `Đơn ${existing.rentalOrder.orderNumber}: ${adminNote || "Admin đã cập nhật kết quả xử lý."}`,
            link: "/rental/management",
            data: { rentalOrderId: existing.rentalOrderId, disputeId },
          },
          {
            userId: existing.sellerId,
            type: NotificationType.RENTAL,
            title: "Admin đã ra phán quyết tranh chấp thuê",
            content: `Đơn ${existing.rentalOrder.orderNumber}: ${adminNote || "Admin đã cập nhật kết quả xử lý."}`,
            link: "/seller/rentals",
            data: { rentalOrderId: existing.rentalOrderId, disputeId },
          },
        ],
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("PATCH /api/admin/rental-disputes/[id] error:", error)
    return NextResponse.json(
      { error: "Không thể cập nhật tranh chấp thuê" },
      { status: 500 }
    )
  }
}

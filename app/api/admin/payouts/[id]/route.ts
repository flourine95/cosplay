import { NextResponse } from "next/server"
import {
  EscrowStatus,
  PayoutStatus,
  UserRole,
} from "@/app/generated/prisma/enums"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { adminUpdatePayoutSchema } from "@/schemas/admin-payout"

type RouteContext = {
  params: Promise<{ id: string }>
}

const requireAdmin = async () => {
  const user = await getSession()
  return user?.role === UserRole.ADMIN ? user : null
}

const parsePayoutId = (value: string) => {
  const id = Number(value)
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("INVALID_PAYOUT_ID")
  }
  return id
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const { id } = await context.params
    const payoutId = parsePayoutId(id)
    const body = await request.json()
    const parsed = adminUpdatePayoutSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
        { status: 400 }
      )
    }

    const payout = await prisma.sellerPayout.findUnique({
      where: { id: payoutId },
      select: { id: true, status: true },
    })

    if (!payout) {
      return NextResponse.json(
        { error: "Không tìm thấy payout" },
        { status: 404 }
      )
    }

    if (payout.status === PayoutStatus.COMPLETED) {
      return NextResponse.json(
        { error: "Payout đã hoàn tất, không thể cập nhật" },
        { status: 400 }
      )
    }

    const { status, transferProof, transferNote } = parsed.data
    const updated = await prisma.$transaction(async (tx) => {
      const next = await tx.sellerPayout.update({
        where: { id: payoutId },
        data: {
          status,
          transferProof: transferProof || undefined,
          transferNote: transferNote || undefined,
          processedBy: admin.id,
          processedAt: status === PayoutStatus.COMPLETED ? new Date() : null,
        },
      })

      if (status === PayoutStatus.COMPLETED) {
        await tx.order.updateMany({
          where: { payoutId },
          data: { escrowStatus: EscrowStatus.RELEASED },
        })
      }

      if (status === PayoutStatus.FAILED) {
        await tx.order.updateMany({
          where: { payoutId },
          data: { payoutId: null, escrowStatus: EscrowStatus.HOLDING },
        })
      }

      return next
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_PAYOUT_ID") {
      return NextResponse.json(
        { error: "Mã payout không hợp lệ" },
        { status: 400 }
      )
    }

    console.error("PATCH /api/admin/payouts/[id] error:", error)
    return NextResponse.json(
      { error: "Không thể cập nhật payout" },
      { status: 500 }
    )
  }
}

import { NextResponse } from "next/server"
import { CustomOrderStatus } from "@/app/generated/prisma/enums"
import { requireSeller } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  sellerCustomOrderInclude,
  serializeSellerCustomOrder,
} from "@/lib/seller-custom-order"
import { sellerCustomRevisionResponseSchema } from "@/schemas/seller-custom-order"

const parsePositiveId = (value: string, message: string): number => {
  const id = Number(value)
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(message)
  }
  return id
}

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/seller/custom-orders/[id]/revisions/[revisionId]">
) {
  try {
    const seller = await requireSeller()
    if (!seller) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const { id, revisionId } = await ctx.params
    const customOrderId = parsePositiveId(id, "Invalid custom order id")
    const parsedRevisionId = parsePositiveId(revisionId, "Invalid revision id")
    const body = await request.json()
    const parsed = sellerCustomRevisionResponseSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
        { status: 400 }
      )
    }

    const existing = await prisma.customOrder.findUnique({
      where: { id: customOrderId },
      select: { id: true, sellerId: true },
    })

    if (!existing || existing.sellerId !== seller.id) {
      return NextResponse.json(
        { error: "Không tìm thấy đơn đặt may" },
        { status: 404 }
      )
    }

    const revision = await prisma.customOrderRevision.findUnique({
      where: { id: parsedRevisionId },
      select: { id: true, customOrderId: true },
    })

    if (!revision || revision.customOrderId !== customOrderId) {
      return NextResponse.json(
        { error: "Không tìm thấy yêu cầu chỉnh sửa" },
        { status: 404 }
      )
    }

    const order = await prisma.$transaction(async (tx) => {
      await tx.customOrderRevision.update({
        where: { id: parsedRevisionId },
        data: {
          sellerResponse: parsed.data.sellerResponse,
          respondedAt: new Date(),
        },
      })

      await tx.customOrder.update({
        where: { id: customOrderId },
        data: { status: CustomOrderStatus.IN_PROGRESS },
      })

      return tx.customOrder.findUniqueOrThrow({
        where: { id: customOrderId },
        include: sellerCustomOrderInclude,
      })
    })

    return NextResponse.json({ data: serializeSellerCustomOrder(order) })
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid custom order id") {
      return NextResponse.json(
        { error: "Mã đơn đặt may không hợp lệ" },
        { status: 400 }
      )
    }
    if (error instanceof Error && error.message === "Invalid revision id") {
      return NextResponse.json(
        { error: "Mã yêu cầu chỉnh sửa không hợp lệ" },
        { status: 400 }
      )
    }
    console.error(
      "PATCH /api/seller/custom-orders/[id]/revisions/[revisionId] error:",
      error
    )
    return NextResponse.json(
      { error: "Không thể phản hồi yêu cầu chỉnh sửa" },
      { status: 500 }
    )
  }
}

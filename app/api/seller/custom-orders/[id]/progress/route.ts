import { NextResponse } from "next/server"
import { CustomOrderStatus } from "@/app/generated/prisma/enums"
import { requireSeller } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  sellerCustomOrderInclude,
  serializeSellerCustomOrder,
} from "@/lib/seller-custom-order"
import { sellerCustomProgressSchema } from "@/schemas/seller-custom-order"

const parseCustomOrderId = (value: string): number => {
  const id = Number(value)
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid custom order id")
  }
  return id
}

const invalidIdResponse = () =>
  NextResponse.json({ error: "Mã đơn đặt may không hợp lệ" }, { status: 400 })

const progressableStatuses: CustomOrderStatus[] = [
  CustomOrderStatus.DEPOSIT_PAID,
  CustomOrderStatus.IN_PROGRESS,
  CustomOrderStatus.REVISION_REQUESTED,
  CustomOrderStatus.READY,
]

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/seller/custom-orders/[id]/progress">
) {
  try {
    const seller = await requireSeller()
    if (!seller) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const { id } = await ctx.params
    const customOrderId = parseCustomOrderId(id)
    const body = await request.json()
    const parsed = sellerCustomProgressSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
        { status: 400 }
      )
    }

    const existing = await prisma.customOrder.findUnique({
      where: { id: customOrderId },
      select: { id: true, sellerId: true, status: true },
    })

    if (!existing || existing.sellerId !== seller.id) {
      return NextResponse.json(
        { error: "Không tìm thấy đơn đặt may" },
        { status: 404 }
      )
    }

    if (!progressableStatuses.includes(existing.status)) {
      return NextResponse.json(
        { error: "Đơn này chưa thể cập nhật tiến độ" },
        { status: 400 }
      )
    }

    const { data } = parsed
    const nextStatus =
      data.status ??
      (data.progressPercent >= 100
        ? CustomOrderStatus.READY
        : CustomOrderStatus.IN_PROGRESS)

    const order = await prisma.$transaction(async (tx) => {
      await tx.customOrderProgress.create({
        data: {
          customOrderId,
          title: data.title,
          description: data.description,
          images: data.images,
          videos: data.videos,
          progressPercent: data.progressPercent,
        },
      })

      await tx.customOrder.update({
        where: { id: customOrderId },
        data: {
          status: nextStatus,
        },
      })

      return tx.customOrder.findUniqueOrThrow({
        where: { id: customOrderId },
        include: sellerCustomOrderInclude,
      })
    })

    return NextResponse.json({ data: serializeSellerCustomOrder(order) })
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid custom order id") {
      return invalidIdResponse()
    }
    console.error("POST /api/seller/custom-orders/[id]/progress error:", error)
    return NextResponse.json(
      { error: "Không thể cập nhật tiến độ" },
      { status: 500 }
    )
  }
}

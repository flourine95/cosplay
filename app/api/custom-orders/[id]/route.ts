export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

// Map enum status → label + mô tả tiếng Việt
const STATUS_META: Record<
  string,
  { label: string; desc: string; step: number }
> = {
  DRAFT:              { label: "Nháp",                  desc: "Đơn chưa được gửi.",                          step: 0 },
  SUBMITTED:          { label: "Đã gửi yêu cầu",        desc: "Đơn đã gửi, chờ Maker xem xét và báo giá.",  step: 1 },
  QUOTED:             { label: "Maker đã báo giá",       desc: "Maker đã gửi báo giá, chờ bạn xác nhận.",    step: 2 },
  QUOTE_ACCEPTED:     { label: "Đã chốt giá",            desc: "Bạn đã chấp nhận báo giá.",                  step: 3 },
  DEPOSIT_PAID:       { label: "Đã đặt cọc",             desc: "Đã nhận cọc, Maker bắt đầu chuẩn bị.",       step: 4 },
  IN_PROGRESS:        { label: "Đang gia công",          desc: "Maker đang tiến hành may trang phục.",        step: 5 },
  REVISION_REQUESTED: { label: "Yêu cầu chỉnh sửa",     desc: "Bạn đã gửi yêu cầu chỉnh sửa cho Maker.",    step: 6 },
  READY:              { label: "Hoàn thiện",             desc: "Trang phục đã hoàn thiện, chờ nghiệm thu.",   step: 7 },
  COMPLETED:          { label: "Hoàn thành",             desc: "Đơn hàng đã hoàn tất và giao hàng.",          step: 8 },
  CANCELLED:          { label: "Đã hủy",                 desc: "Đơn hàng đã bị hủy.",                         step: -1 },
}

// Các bước hiển thị trên timeline (không tính DRAFT và CANCELLED)
const TIMELINE_STEPS = [
  "SUBMITTED",
  "QUOTED",
  "QUOTE_ACCEPTED",
  "DEPOSIT_PAID",
  "IN_PROGRESS",
  "REVISION_REQUESTED",
  "READY",
  "COMPLETED",
]

// -------------------------------------------------------------------------
// GET /api/custom-orders/[id]
// -------------------------------------------------------------------------
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSession()
    if (!sessionUser) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const { id: idParam } = await params
    const id = parseInt(idParam, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 })
    }

    const order = await prisma.customOrder.findFirst({
      where: {
        id,
        userId: sessionUser.id, // chỉ lấy đơn của chính user
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            shopName: true,
            shopLogo: true,
            sellerRating: true,
            sellerTotalReviews: true,
            phone: true,
          },
        },
        measurement: {
          select: {
            id: true,
            name: true,
          },
        },
        progressUpdates: {
          orderBy: { createdAt: "asc" },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: "Không tìm thấy đơn hàng" },
        { status: 404 }
      )
    }

    // Tính % tiến độ dựa theo step
    const currentMeta = STATUS_META[order.status] ?? STATUS_META["SUBMITTED"]
    const totalSteps = TIMELINE_STEPS.length - 1
    const progressPercent =
      order.status === "CANCELLED"
        ? 0
        : Math.round((currentMeta.step / totalSteps) * 100)

    // Build timeline steps để FE render
    const timeline = TIMELINE_STEPS.map((s) => {
      const meta = STATUS_META[s]
      const isDone = currentMeta.step > meta.step
      const isCurrent = order.status === s

      // Tìm progress update khớp với step này nếu có
      const matchedProgress = order.progressUpdates.find(
        (p: { status?: string }) => p.status === s
      )

      return {
        status: s,
        label: meta.label,
        desc: matchedProgress?.note ?? (isCurrent || isDone ? meta.desc : ""),
        date: matchedProgress?.createdAt ?? null,
        done: isDone,
        current: isCurrent,
      }
    })

    // Tài chính
    const toNumber = (val: unknown) =>
      val != null ? parseFloat(String(val)) : 0

    const estimatedPrice = toNumber(order.estimatedPrice)
    const depositAmount  = toNumber(order.depositAmount)
    const totalPaid      = toNumber(order.totalPaid)
    const finalAmount    = toNumber(order.finalAmount)
    const remaining      = Math.max(0, (finalAmount || estimatedPrice) - totalPaid)

    return NextResponse.json({
      id:           order.id,
      orderNumber:  order.orderNumber,
      title:        order.title,
      characterName: order.characterName,
      animeName:    order.animeName,
      description:  order.description,
      specialRequests: order.specialRequests,
      referenceImages: order.referenceImages,
      deadline:     order.deadline,
      status:       order.status,
      statusLabel:  currentMeta.label,
      statusDesc:   currentMeta.desc,
      progressPercent,
      createdAt:    order.createdAt,
      submittedAt:  order.submittedAt,
      acceptedAt:   order.acceptedAt,
      completedAt:  order.completedAt,
      trackingCode: order.trackingCode,
      shippingCarrier: order.shippingCarrier,

      // Tài chính
      finance: {
        estimatedPrice,
        depositAmount,
        finalAmount,
        totalPaid,
        remaining,
        shippingFee: toNumber(order.shippingFee),
      },

      // Seller
      seller: order.seller
        ? {
            id:                 order.seller.id,
            name:               order.seller.name,
            shopName:           order.seller.shopName,
            shopLogo:           order.seller.shopLogo,
            sellerRating:       order.seller.sellerRating,
            sellerTotalReviews: order.seller.sellerTotalReviews,
            phone:              order.seller.phone,
          }
        : null,

      // Measurement
      measurement: order.measurement
        ? { id: order.measurement.id, name: order.measurement.name }
        : null,

      // Timeline
      timeline,

      // Raw progress updates nếu FE cần
      progressUpdates: order.progressUpdates,
    })
  } catch (error) {
    console.error("GET /api/custom-orders/[id] error:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi tải chi tiết đơn hàng" },
      { status: 500 }
    )
  }
}
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

// -------------------------------------------------------------------------
// GET: Lấy danh sách đơn đặt may của user hiện tại
// -------------------------------------------------------------------------
export async function GET() {
  try {
    const sessionUser = await getSession()
    if (!sessionUser) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const customOrders = await prisma.customOrder.findMany({
      where: { userId: sessionUser.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(customOrders, { status: 200 })
  } catch (error) {
    console.error("GET /api/custom-orders error:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi tải danh sách đơn đặt may" },
      { status: 500 }
    )
  }
}

// -------------------------------------------------------------------------
// POST: Tạo đơn đặt may mới
// -------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSession()
    if (!sessionUser) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const body = await request.json()


    const {
      sellerId,
      measurementId,
      characterName,
      description,
      referenceImages,
      animeName,
      specialRequests,
      deadline,
      estimatedPrice,
    } = body

    if (!characterName?.trim()) {
      return NextResponse.json(
        { error: "Vui lòng nhập tên nhân vật cần đặt may" },
        { status: 400 }
      )
    }

    if (!measurementId) {
      return NextResponse.json(
        { error: "Vui lòng chọn bộ số đo cơ thể áp dụng" },
        { status: 400 }
      )
    }

    // Kiểm tra measurement thuộc về user này
    const checkMeasurement = await prisma.measurement.findFirst({
      where: {
        id: parseInt(measurementId, 10),
        userId: sessionUser.id,
      },
    })

    if (!checkMeasurement) {
      return NextResponse.json(
        { error: "Bộ số đo cơ thể được chọn không hợp lệ" },
        { status: 400 }
      )
    }

    const orderNumber = `CUST-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`

    const newCustomOrder = await prisma.customOrder.create({
      data: {
        user:        { connect: { id: sessionUser.id } },
        measurement: { connect: { id: parseInt(measurementId, 10) } },
        ...(sellerId ? { seller: { connect: { id: parseInt(sellerId, 10) } } } : {}),
        orderNumber,
        title: `Đặt may trang phục: ${characterName.trim()}`,
        description: description?.trim() || null,
        referenceImages: Array.isArray(referenceImages) ? referenceImages : [],
        characterName: characterName.trim(),
        animeName: animeName?.trim() || null,
        specialRequests: specialRequests?.trim() || null,
        deadline: deadline ? new Date(deadline) : null,
        status: "SUBMITTED" as const,
        estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : 0,
        depositAmount: 0,
        finalAmount: 0,
        totalPaid: 0,
        shippingFee: 0,
        actualWeight: null,
        submittedAt: new Date(),
      },
    })

    return NextResponse.json(
      {
        success: true,
        orderId: newCustomOrder.id,
        orderNumber: newCustomOrder.orderNumber,
        status: "requested",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("POST /api/custom-orders error:", error)
    return NextResponse.json(
      { error: "Hệ thống gặp sự cố, không thể khởi tạo yêu cầu may mặc" },
      { status: 500 }
    )
  }
}
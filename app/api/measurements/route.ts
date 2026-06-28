import { NextResponse } from "next/server"
import { prisma} from "@/lib/prisma" // Đồng bộ import prisma thực tế của bạn
import { getSession } from "@/lib/auth"

// -------------------------------------------------------------
// GET: Lấy toàn bộ danh sách số đo của người dùng hiện tại
// -------------------------------------------------------------
export async function GET() {
  try {
    const sessionUser = await getSession() 
if (!sessionUser) {
  return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
}
const userId = sessionUser.id

    const measurements = await prisma.measurement.findMany({
      where: { userId },
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "desc" }
      ],
    })

    return NextResponse.json(measurements, { status: 200 })
  } catch (error) {
    console.error("[MEASUREMENTS_GET_ERROR]", error)
    return NextResponse.json(
      { error: "Không thể tải danh sách số đo từ hệ thống" },
      { status: 500 }
    )
  }
}

// -------------------------------------------------------------
// POST: Tạo mới một bộ số đo cơ thể (Xử lý chuỗi rỗng an toàn)
// -------------------------------------------------------------
export async function POST(request: Request) {
  try {
    const sessionUser = await getSession()
if (!sessionUser) {
  return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
}
const userId = sessionUser.id
    const body = await request.json()

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Tên bộ số đo không được để trống" }, { status: 400 })
    }

    // Ép kiểu dữ liệu chuỗi từ form sang số thực Float8 an toàn (Tránh lỗi chuỗi rỗng tạo ra NaN)
    const payload = {
      userId,
      name: body.name.trim(),
      height: (body.height && !isNaN(parseFloat(body.height))) ? parseFloat(body.height) : null,
      weight: (body.weight && !isNaN(parseFloat(body.weight))) ? parseFloat(body.weight) : null,
      chest: (body.chest && !isNaN(parseFloat(body.chest))) ? parseFloat(body.chest) : null,
      waist: (body.waist && !isNaN(parseFloat(body.waist))) ? parseFloat(body.waist) : null,
      hips: (body.hips && !isNaN(parseFloat(body.hips))) ? parseFloat(body.hips) : null,
      shoulder: (body.shoulder && !isNaN(parseFloat(body.shoulder))) ? parseFloat(body.shoulder) : null,
      armLength: (body.armLength && !isNaN(parseFloat(body.armLength))) ? parseFloat(body.armLength) : null,
      legLength: (body.legLength && !isNaN(parseFloat(body.legLength))) ? parseFloat(body.legLength) : null,
      neck: (body.neck && !isNaN(parseFloat(body.neck))) ? parseFloat(body.neck) : null,
      notes: body.notes?.trim() || null,
      additionalMeasurements: body.additionalMeasurements || {},
      isDefault: body.isDefault || false,
    }

    // Kiểm tra logic mặc định
    const existingCount = await prisma.measurement.count({ where: { userId } })
    
    if (existingCount === 0) {
      payload.isDefault = true
    } else if (payload.isDefault) {
      await prisma.measurement.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      })
    }

    const newMeasurement = await prisma.measurement.create({ data: payload })

    return NextResponse.json(newMeasurement, { status: 201 })
  } catch (error) {
    console.error("[MEASUREMENTS_POST_ERROR]", error)
    return NextResponse.json(
      { error: "Lỗi cấu hình lưu trữ dữ liệu số đo mới" },
      { status: 500 }
    )
  }
}
import { NextResponse } from "next/server"
import { prisma} from "@/lib/prisma" // Import prisma từ dự án của bạn và gán danh nghĩa 'db'
import { getSession } from "@/lib/auth"




// -------------------------------------------------------------
// PUT: Cập nhật chỉnh sửa bộ số đo theo ID (Hỗ trợ Next.js 15+)
// -------------------------------------------------------------
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Định nghĩa params dưới dạng Promise theo Next.js 15
) {
  try {
    const sessionUser = await getSession()
if (!sessionUser) {
  return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
}
const userId = sessionUser.id
    
    // Giải nén (unwrap) params bằng await trước khi sử dụng thuộc tính id
    const { id: idParam } = await params
    const id = parseInt(idParam) 
    
    const body = await request.json()

    if (isNaN(id)) {
      return NextResponse.json({ error: "Mã số đo không hợp lệ" }, { status: 400 })
    }

    // Lọc và ép kiểu dữ liệu an toàn từ chuỗi (Form) sang số thực Float8 cho DB
    const updateData: any = {}
    
    if (body.name !== undefined) updateData.name = body.name.trim()
    if (body.height !== undefined) updateData.height = (body.height && !isNaN(parseFloat(body.height))) ? parseFloat(body.height) : null
    if (body.weight !== undefined) updateData.weight = (body.weight && !isNaN(parseFloat(body.weight))) ? parseFloat(body.weight) : null
    if (body.chest !== undefined) updateData.chest = (body.chest && !isNaN(parseFloat(body.chest))) ? parseFloat(body.chest) : null
    if (body.waist !== undefined) updateData.waist = (body.waist && !isNaN(parseFloat(body.waist))) ? parseFloat(body.waist) : null
    if (body.hips !== undefined) updateData.hips = (body.hips && !isNaN(parseFloat(body.hips))) ? parseFloat(body.hips) : null
    if (body.shoulder !== undefined) updateData.shoulder = (body.shoulder && !isNaN(parseFloat(body.shoulder))) ? parseFloat(body.shoulder) : null
    if (body.armLength !== undefined) updateData.armLength = (body.armLength && !isNaN(parseFloat(body.armLength))) ? parseFloat(body.armLength) : null
    if (body.legLength !== undefined) updateData.legLength = (body.legLength && !isNaN(parseFloat(body.legLength))) ? parseFloat(body.legLength) : null
    if (body.neck !== undefined) updateData.neck = (body.neck && !isNaN(parseFloat(body.neck))) ? parseFloat(body.neck) : null
    if (body.notes !== undefined) updateData.notes = body.notes?.trim() || null
    if (body.additionalMeasurements !== undefined) updateData.additionalMeasurements = body.additionalMeasurements
    if (body.isDefault !== undefined) updateData.isDefault = body.isDefault

    // Nếu kích hoạt bộ này làm mặc định (isDefault: true), gỡ các bộ cũ của user này trước
    if (updateData.isDefault === true) {
      await prisma.measurement.updateMany({
        where: { userId, isDefault: true, NOT: { id } },
        data: { isDefault: false },
      })
    }

    const updatedMeasurement = await prisma.measurement.update({
      where: { id, userId },
      data: updateData,
    })

    return NextResponse.json(updatedMeasurement, { status: 200 })
  } catch (error) {
    console.error("[MEASUREMENTS_PUT_ERROR]", error)
    return NextResponse.json(
      { error: "Cập nhật dữ liệu số đo thất bại" },
      { status: 500 }
    )
  }
}

// -------------------------------------------------------------
// DELETE: Xóa vĩnh viễn bộ số đo theo ID (Hỗ trợ Next.js 15+)
// -------------------------------------------------------------
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Định nghĩa params dưới dạng Promise theo Next.js 15
) {
  try {
    const sessionUser = await getSession()
if (!sessionUser) {
  return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
}
const userId = sessionUser.id

    // Giải nén (unwrap) params bằng await trước khi sử dụng thuộc tính id
    const { id: idParam } = await params
    const id = parseInt(idParam)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Mã số đo không hợp lệ" }, { status: 400 })
    }

    // 1. Kiểm tra xem bộ sắp xóa có đang giữ trạng thái mặc định không
    const target = await prisma.measurement.findFirst({
      where: { id, userId },
    })

    if (!target) {
      return NextResponse.json({ error: "Không tìm thấy bộ số đo yêu cầu" }, { status: 404 })
    }

    // 2. Tiến hành xóa khỏi DB
    await prisma.measurement.delete({
      where: { id, userId },
    })

    // 3. LOGIC BÙ TRỪ: Nếu xóa trúng bộ đang làm mặc định, tự động đẩy bộ cập nhật gần nhất còn lại lên làm mặc định
    if (target.isDefault) {
      const nextDefault = await prisma.measurement.findFirst({
        where: { userId },
        orderBy: { updatedAt: "desc" },
      })

      if (nextDefault) {
        await prisma.measurement.update({
          where: { id: nextDefault.id },
          data: { isDefault: true },
        })
      }
    }

    return NextResponse.json({ message: "Xóa số đo thành công" }, { status: 200 })
  } catch (error) {
    console.error("[MEASUREMENTS_DELETE_ERROR]", error)
    return NextResponse.json(
      { error: "Lỗi hệ thống, không thể xóa số đo này" },
      { status: 500 }
    )
  }
}
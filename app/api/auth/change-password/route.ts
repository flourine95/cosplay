import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession, verifyPassword, hashPassword } from "@/lib/auth"
import { changePasswordSchema } from "@/schemas/auth"

export async function POST(request: NextRequest) {
  try {
    const [sessionUser, body] = await Promise.all([
      getSession(),
      request.json(),
    ])

    if (!sessionUser) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const parsed = changePasswordSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword } = parsed.data

    const user = await prisma.user.findUnique({ where: { id: sessionUser.id } })
    if (!user) {
      return NextResponse.json(
        { error: "Người dùng không tồn tại" },
        { status: 404 }
      )
    }

    const valid = await verifyPassword(currentPassword, user.password)
    if (!valid) {
      return NextResponse.json(
        { error: "Mật khẩu hiện tại không đúng" },
        { status: 400 }
      )
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password: await hashPassword(newPassword) },
    })

    // Xóa tất cả session khác, giữ lại session hiện tại
    await prisma.session.deleteMany({
      where: {
        userId: user.id,
        id: { not: sessionUser.sessionId },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json(
      { error: "Không thể đổi mật khẩu" },
      { status: 500 }
    )
  }
}

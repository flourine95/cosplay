import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPassword, createSession, sanitizeUser } from "@/lib/auth"
import { UserStatus } from "@/app/generated/prisma/enums"
import { loginSchema } from "@/schemas/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
        { status: 400 }
      )
    }

    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json(
        { error: "Email hoặc mật khẩu không đúng" },
        { status: 401 }
      )
    }

    if (user.status === UserStatus.SUSPENDED) {
      return NextResponse.json(
        { error: "Tài khoản của bạn đã bị tạm khóa" },
        { status: 403 }
      )
    }

    if (user.status === UserStatus.INACTIVE) {
      return NextResponse.json(
        { error: "Tài khoản không hoạt động" },
        { status: 403 }
      )
    }

    await Promise.all([
      prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      }),
      createSession(user.id),
    ])

    return NextResponse.json({ user: sanitizeUser(user) })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Đăng nhập thất bại" }, { status: 500 })
  }
}

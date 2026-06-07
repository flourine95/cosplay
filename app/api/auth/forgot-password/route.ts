import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"
import { forgotPasswordSchema } from "@/schemas/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = forgotPasswordSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Email không hợp lệ" },
        { status: 400 }
      )
    }

    const { email } = parsed.data

    // Luôn trả về success để tránh user enumeration
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ success: true })
    }

    // Xóa token cũ chưa dùng
    await prisma.passwordReset.deleteMany({
      where: { userId: user.id, usedAt: null },
    })

    const token = randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60) // 1 giờ

    await prisma.passwordReset.create({
      data: { userId: user.id, token, expiresAt },
    })

    // TODO: Gửi email với link: /change-password?token={token}
    console.warn(
      `[DEV] Reset link: ${process.env.NEXT_PUBLIC_APP_URL}/change-password?token=${token}`
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "Không thể xử lý yêu cầu" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, createSession, sanitizeUser } from "@/lib/auth"
import { resetPasswordSchema } from "@/schemas/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = resetPasswordSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
        { status: 400 }
      )
    }

    const { token, password } = parsed.data

    const reset = await prisma.passwordReset.findUnique({ where: { token } })

    if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn" },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id: reset.userId },
      data: { password: await hashPassword(password) },
    })

    await prisma.$transaction([
      prisma.passwordReset.update({
        where: { id: reset.id },
        data: { usedAt: new Date() },
      }),
      prisma.session.deleteMany({ where: { userId: reset.userId } }),
    ])

    await createSession(updatedUser.id)

    return NextResponse.json({ user: sanitizeUser(updatedUser) })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      { error: "Không thể đặt lại mật khẩu" },
      { status: 500 }
    )
  }
}

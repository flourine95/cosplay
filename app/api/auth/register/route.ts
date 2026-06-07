import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, createSession, sanitizeUser } from "@/lib/auth"
import {
  SellerStatus,
  UserRole,
  UserStatus,
} from "@/app/generated/prisma/enums"
import { registerSchema } from "@/schemas/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
        { status: 400 }
      )
    }

    const { name, email, password, role } = parsed.data
    const userRole = role === "SELLER" ? UserRole.SELLER : UserRole.CUSTOMER

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: "Email này đã được sử dụng" },
        { status: 409 }
      )
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: await hashPassword(password),
        role: userRole,
        status: UserStatus.ACTIVE,
        emailVerified: false,
        sellerStatus:
          userRole === UserRole.SELLER ? SellerStatus.PENDING : undefined,
      },
    })

    await createSession(user.id)

    return NextResponse.json({ user: sanitizeUser(user) }, { status: 201 })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "Đăng ký thất bại" }, { status: 500 })
  }
}

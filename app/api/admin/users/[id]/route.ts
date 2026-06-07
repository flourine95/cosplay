import { NextResponse } from "next/server"
import { Prisma } from "@/app/generated/prisma/client"
import {
  SellerStatus,
  UserRole,
  UserStatus,
} from "@/app/generated/prisma/enums"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { adminUserUpdateSchema } from "@/schemas/admin-user"

interface RouteContext {
  params: Promise<{ id: string }>
}

const requireAdmin = async () => {
  const user = await getSession()
  return user?.role === UserRole.ADMIN ? user : null
}

const parseUserId = async ({ params }: RouteContext): Promise<number> => {
  const { id } = await params
  const userId = Number(id)
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid user id")
  }
  return userId
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const userId = await parseUserId(context)
    const body = await request.json()
    const parsed = adminUserUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
        { status: 400 }
      )
    }

    if (admin.id === userId && parsed.data.status !== UserStatus.ACTIVE) {
      return NextResponse.json(
        { error: "Không thể tự khóa tài khoản admin đang đăng nhập" },
        { status: 400 }
      )
    }

    const { data } = parsed
    const user = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          role: data.role,
          status: data.status,
          sellerStatus:
            data.role === UserRole.SELLER ? SellerStatus.PENDING : null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
        },
      })

      if (
        data.status === UserStatus.SUSPENDED ||
        data.status === UserStatus.INACTIVE
      ) {
        await tx.session.deleteMany({ where: { userId } })
      }

      return updatedUser
    })

    return NextResponse.json({ data: user })
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid user id") {
      return NextResponse.json(
        { error: "Mã người dùng không hợp lệ" },
        { status: 400 }
      )
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Không tìm thấy người dùng" },
        { status: 404 }
      )
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Email này đã được sử dụng" },
        { status: 409 }
      )
    }

    console.error("PATCH /api/admin/users/[id] error:", error)
    return NextResponse.json(
      { error: "Không thể cập nhật người dùng" },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const userId = await parseUserId(context)
    if (admin.id === userId) {
      return NextResponse.json(
        { error: "Không thể tự khóa tài khoản admin đang đăng nhập" },
        { status: 400 }
      )
    }

    const user = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { status: UserStatus.SUSPENDED },
        select: { id: true, status: true },
      })

      await tx.session.deleteMany({ where: { userId } })
      return updatedUser
    })

    return NextResponse.json({ data: user })
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid user id") {
      return NextResponse.json(
        { error: "Mã người dùng không hợp lệ" },
        { status: 400 }
      )
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Không tìm thấy người dùng" },
        { status: 404 }
      )
    }

    console.error("DELETE /api/admin/users/[id] error:", error)
    return NextResponse.json(
      { error: "Không thể khóa người dùng" },
      { status: 500 }
    )
  }
}

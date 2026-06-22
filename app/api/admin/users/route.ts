import { NextResponse } from "next/server"
import { Prisma } from "@/app/generated/prisma/client"
import {
  SellerStatus,
  UserRole,
  UserStatus,
} from "@/app/generated/prisma/enums"
import { getSession, hashPassword } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { adminUserCreateSchema } from "@/schemas/admin-user"

const requireAdmin = async () => {
  const user = await getSession()
  return user?.role === UserRole.ADMIN ? user : null
}

const formatUser = (user: {
  id: number
  name: string
  email: string
  phone: string | null
  role: UserRole
  status: UserStatus
  createdAt: Date
  lastLoginAt: Date | null
  ordersAsBuyer: { total: Prisma.Decimal }[]
  _count: { ordersAsBuyer: number; products: number }
}) => {
  const spent = user.ordersAsBuyer.reduce(
    (sum, order) => sum + Number(order.total),
    0
  )

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    orders: user._count.ordersAsBuyer,
    products: user._count.products,
    spent,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  }
}

export async function GET() {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
        ordersAsBuyer: { select: { total: true } },
        _count: {
          select: {
            ordersAsBuyer: true,
            products: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    return NextResponse.json({
      data: {
        users: users.map(formatUser),
        stats: {
          total: users.length,
          newThisMonth: users.filter((user) => user.createdAt >= startOfMonth)
            .length,
          suspended: users.filter(
            (user) => user.status === UserStatus.SUSPENDED
          ).length,
        },
      },
    })
  } catch (error) {
    console.error("GET /api/admin/users error:", error)
    return NextResponse.json(
      { error: "Không thể lấy danh sách người dùng" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const parsed = adminUserCreateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
        { status: 400 }
      )
    }

    const { data } = parsed
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        password: await hashPassword(data.password),
        role: data.role,
        status: data.status,
        emailVerified: data.status === UserStatus.ACTIVE,
        emailVerifiedAt: data.status === UserStatus.ACTIVE ? new Date() : null,
        sellerStatus:
          data.role === UserRole.SELLER ? SellerStatus.PENDING : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ data: user }, { status: 201 })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Email này đã được sử dụng" },
        { status: 409 }
      )
    }

    console.error("POST /api/admin/users error:", error)
    return NextResponse.json(
      { error: "Không thể tạo người dùng" },
      { status: 500 }
    )
  }
}

export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@/app/generated/prisma/client"
import { getSession, sanitizeUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getDefaultAddress, parseSavedAddresses } from "@/lib/profile"
import { profileUpdateSchema } from "@/schemas/profile"
export async function GET() {
  const sessionUser = await getSession()
  if (!sessionUser) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
  }

  const [user, ordersCount, measurementsCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: sessionUser.id } }),
    prisma.order.count({ where: { userId: sessionUser.id } }),
    prisma.measurement.count({ where: { userId: sessionUser.id } }),
  ])

  if (!user) {
    return NextResponse.json(
      { error: "Không tìm thấy người dùng" },
      { status: 404 }
    )
  }

  const safeUser = sanitizeUser(user)
  const savedAddresses = parseSavedAddresses(safeUser.savedAddresses)
  const defaultAddress = getDefaultAddress(safeUser.savedAddresses)

  return NextResponse.json({
    user: {
      ...safeUser,
      savedAddresses,
    },
    stats: {
      orders: ordersCount,
      measurements: measurementsCount,
      addresses: savedAddresses.length,
    },
    defaultAddress,
  })
}

export async function PUT(request: NextRequest) {
  try {
    const sessionUser = await getSession()
    if (!sessionUser) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = profileUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
        { status: 400 }
      )
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { id: true, savedAddresses: true },
    })

    if (!currentUser) {
      return NextResponse.json(
        { error: "Không tìm thấy người dùng" },
        { status: 404 }
      )
    }

    const normalizedPhone = parsed.data.phone?.trim() || null
    const normalizedAvatar = parsed.data.avatar?.trim() || null

    const updateData: Prisma.UserUpdateInput = {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: normalizedPhone,
      avatar: normalizedAvatar,
    }

    if (parsed.data.defaultAddress) {
      const existingAddresses = parseSavedAddresses(currentUser.savedAddresses)
      const incoming = parsed.data.defaultAddress
      const existingDefault = getDefaultAddress(currentUser.savedAddresses)
      const addressId = incoming.id ?? existingDefault?.id ?? `addr_${Date.now()}`

      const nextAddress = {
        id: addressId,
        name: incoming.name,
        phone: incoming.phone || normalizedPhone || sessionUser.phone || "",
        address: incoming.address,
        city: incoming.city || "",
        district: incoming.district || "",
        ward: incoming.ward || "",
        isDefault: true,
      }

      const remainingAddresses = existingAddresses.filter(
        (address) => address.id !== addressId
      )

      updateData.savedAddresses = [
        nextAddress,
        ...remainingAddresses.map((address) => ({
          ...address,
          isDefault: false,
        })),
      ] as Prisma.InputJsonValue
    }

    const updatedUser = await prisma.user.update({
      where: { id: sessionUser.id },
      data: updateData,
    })

    return NextResponse.json({ user: sanitizeUser(updatedUser) })
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

    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: "Không thể cập nhật hồ sơ" },
      { status: 500 }
    )
  }
}

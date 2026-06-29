import { NextResponse } from "next/server"
import { requireSeller } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const normalizeText = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : null

const placeholderReturnAddressValues = new Set([
  "Chưa cập nhật",
  "Địa chỉ shop chưa cập nhật",
  "Chua cap nhat",
  "Dia chi shop chua cap nhat",
])

const isPlaceholderValue = (value: string | null) =>
  value ? placeholderReturnAddressValues.has(value) : false

const sellerProfileSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  avatar: true,
  shopName: true,
  shopDescription: true,
  shopLogo: true,
  shopBanner: true,
  shopReturnName: true,
  shopReturnPhone: true,
  shopReturnAddress: true,
  shopReturnCity: true,
  shopReturnDistrict: true,
  shopReturnWard: true,
  shopReturnNote: true,
  businessLicense: true,
  taxCode: true,
  bankName: true,
  bankAccount: true,
  bankAccountName: true,
  sellerStatus: true,
  sellerRating: true,
  sellerTotalReviews: true,
  sellerTotalSales: true,
} as const

export async function GET() {
  try {
    const seller = await requireSeller()
    if (!seller) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const profile = await prisma.user.findUniqueOrThrow({
      where: { id: seller.id },
      select: sellerProfileSelect,
    })

    return NextResponse.json({ data: profile })
  } catch (error) {
    console.error("GET /api/seller/profile error:", error)
    return NextResponse.json(
      { error: "Không thể lấy hồ sơ seller" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const seller = await requireSeller()
    if (!seller) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const name = normalizeText(body.name)
    const shopName = normalizeText(body.shopName)
    const shopReturnName = normalizeText(body.shopReturnName)
    const shopReturnPhone = normalizeText(body.shopReturnPhone)
    const shopReturnAddress = normalizeText(body.shopReturnAddress)
    const shopReturnCity = normalizeText(body.shopReturnCity)
    const shopReturnDistrict = normalizeText(body.shopReturnDistrict)
    const shopReturnWard = normalizeText(body.shopReturnWard)

    if (!name || !shopName) {
      return NextResponse.json(
        { error: "Tên người đại diện và tên shop là bắt buộc" },
        { status: 400 }
      )
    }

    const rentalItemCount = await prisma.rentalItem.count({
      where: { sellerId: seller.id },
    })
    const hasUsableReturnAddress =
      Boolean(
        shopReturnName &&
        shopReturnPhone &&
        shopReturnAddress &&
        shopReturnCity &&
        shopReturnDistrict &&
        shopReturnWard
      ) &&
      ![
        shopReturnName,
        shopReturnPhone,
        shopReturnAddress,
        shopReturnCity,
        shopReturnDistrict,
        shopReturnWard,
      ].some(isPlaceholderValue)

    if (rentalItemCount > 0 && !hasUsableReturnAddress) {
      return NextResponse.json(
        {
          error:
            "Seller có đồ cho thuê phải cập nhật đầy đủ địa chỉ nhận đồ trả về",
        },
        { status: 400 }
      )
    }

    const profile = await prisma.user.update({
      where: { id: seller.id },
      data: {
        name,
        phone: normalizeText(body.phone),
        avatar: normalizeText(body.avatar),
        shopName,
        shopDescription: normalizeText(body.shopDescription),
        shopLogo: normalizeText(body.shopLogo),
        shopBanner: normalizeText(body.shopBanner),
        shopReturnName,
        shopReturnPhone,
        shopReturnAddress,
        shopReturnCity,
        shopReturnDistrict,
        shopReturnWard,
        shopReturnNote: normalizeText(body.shopReturnNote),
        businessLicense: normalizeText(body.businessLicense),
        taxCode: normalizeText(body.taxCode),
        bankName: normalizeText(body.bankName),
        bankAccount: normalizeText(body.bankAccount),
        bankAccountName: normalizeText(body.bankAccountName),
      },
      select: sellerProfileSelect,
    })

    return NextResponse.json({ data: profile })
  } catch (error) {
    console.error("PATCH /api/seller/profile error:", error)
    return NextResponse.json(
      { error: "Không thể cập nhật hồ sơ seller" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

// PATCH /api/cart/:itemId
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    if (itemId === "all") {
      return NextResponse.json(
        { error: "Thao tác không hợp lệ" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { quantity } = body

    if (typeof quantity !== "number" || quantity < 1) {
      return NextResponse.json(
        { error: "Số lượng không hợp lệ" },
        { status: 400 }
      )
    }

    const id = parseInt(itemId, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 })
    }

    // Verify ownership
    const item = await prisma.cartItem.findUnique({
      where: { id },
    })

    if (!item || item.userId !== user.id) {
      return NextResponse.json(
        { error: "Không tìm thấy sản phẩm trong giỏ hàng" },
        { status: 404 }
      )
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
    })

    return NextResponse.json({ success: true, item: updatedItem })
  } catch (error) {
    console.error("PATCH /api/cart error:", error)
    return NextResponse.json(
      { error: "Không thể cập nhật số lượng" },
      { status: 500 }
    )
  }
}

// DELETE /api/cart/:itemId or DELETE /api/cart/all
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    if (itemId === "all") {
      await prisma.cartItem.deleteMany({
        where: { userId: user.id },
      })
      return NextResponse.json({
        success: true,
        message: "Đã xóa toàn bộ giỏ hàng",
      })
    }

    const id = parseInt(itemId, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 })
    }

    // Verify ownership
    const item = await prisma.cartItem.findUnique({
      where: { id },
    })

    if (!item || item.userId !== user.id) {
      return NextResponse.json(
        { error: "Không tìm thấy sản phẩm trong giỏ hàng" },
        { status: 404 }
      )
    }

    await prisma.cartItem.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "Đã xóa sản phẩm khỏi giỏ hàng",
    })
  } catch (error) {
    console.error("DELETE /api/cart error:", error)
    return NextResponse.json(
      { error: "Không thể xóa sản phẩm" },
      { status: 500 }
    )
  }
}

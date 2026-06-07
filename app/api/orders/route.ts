import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  PaymentType,
  EscrowStatus,
} from "@/app/generated/prisma/enums"

function getPaymentMethodEnum(method: string): PaymentMethod {
  switch (method) {
    case "cod":
      return PaymentMethod.COD
    case "bank_transfer":
      return PaymentMethod.BANK_TRANSFER
    case "e_wallet":
      return PaymentMethod.MOMO
    case "credit_card":
      return PaymentMethod.CREDIT_CARD
    default:
      return PaymentMethod.COD
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const body = await request.json()
    const {
      fullName,
      email,
      phone,
      address,
      city,
      district,
      ward,
      paymentMethod,
      items,
    } = body

    // Validation
    if (
      !fullName ||
      !email ||
      !phone ||
      !address ||
      !city ||
      !district ||
      !ward ||
      !paymentMethod ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "Thiếu thông tin đặt hàng" },
        { status: 400 }
      )
    }

    const dbPaymentMethod = getPaymentMethodEnum(paymentMethod)

    interface SellerGroupEntry {
      item: {
        productSlug: string
        size: string
        quantity: number
        productName?: string
      }
      product: {
        id: number
        sellerId: number
        name: string
        price: unknown
      }
      variant: {
        id: number
        price: unknown
        stock: number
        name: string
      }
    }

    const groupedBySeller: Record<number, SellerGroupEntry[]> = {}

    // Verify stock and products
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { slug: item.productSlug },
      })

      if (!product) {
        return NextResponse.json(
          {
            error: `Không tìm thấy sản phẩm: ${item.name || item.productSlug}`,
          },
          { status: 400 }
        )
      }

      // Find variant by size
      const variants = await prisma.productVariant.findMany({
        where: { productId: product.id },
      })

      const variant = variants.find((v) => {
        const attrs = (
          typeof v.attributes === "string"
            ? JSON.parse(v.attributes)
            : v.attributes
        ) as Record<string, unknown> | null
        return attrs?.size === item.size
      })

      if (!variant) {
        return NextResponse.json(
          {
            error: `Sản phẩm "${product.name}" không có kích thước ${item.size}`,
          },
          { status: 400 }
        )
      }

      if (variant.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Sản phẩm "${product.name}" (Size ${item.size}) không đủ số lượng trong kho (còn lại: ${variant.stock})`,
          },
          { status: 400 }
        )
      }

      const { sellerId } = product
      if (!groupedBySeller[sellerId]) {
        groupedBySeller[sellerId] = []
      }

      groupedBySeller[sellerId].push({
        item,
        product,
        variant,
      })
    }

    let primaryOrderId = ""
    const createdOrders: unknown[] = []

    await prisma.$transaction(async (tx) => {
      for (const sellerIdStr in groupedBySeller) {
        const sellerId = parseInt(sellerIdStr, 10)
        const sellerGroup = groupedBySeller[sellerId]!

        // Generate unique order number
        const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
        if (!primaryOrderId) {
          primaryOrderId = orderNumber
        }

        let subtotal = 0
        const orderItemsData = []

        for (const entry of sellerGroup) {
          const itemPrice = entry.variant.price
            ? Number(entry.variant.price)
            : Number(entry.product.price)
          const itemSubtotal = itemPrice * entry.item.quantity
          subtotal += itemSubtotal

          orderItemsData.push({
            productId: entry.product.id,
            variantId: entry.variant.id,
            productName: entry.product.name,
            variantName: entry.variant.name,
            price: itemPrice,
            quantity: entry.item.quantity,
            subtotal: itemSubtotal,
          })

          // Reduce variant stock
          await tx.productVariant.update({
            where: { id: entry.variant.id },
            data: { stock: entry.variant.stock - entry.item.quantity },
          })
        }

        const shippingFee = 35000
        const tax = Math.round(subtotal * 0.1)
        const total = subtotal + shippingFee + tax

        // Create order
        const order = await tx.order.create({
          data: {
            userId: user.id,
            sellerId,
            orderNumber,
            shippingName: fullName,
            shippingPhone: phone,
            shippingAddress: address,
            shippingCity: city,
            shippingDistrict: district,
            shippingWard: ward,
            shippingNote: null,
            subtotal,
            shippingFee,
            discount: 0,
            tax,
            total,
            status: OrderStatus.PENDING,
            paymentStatus: PaymentStatus.PENDING,
            paymentMethod: dbPaymentMethod,
            escrowStatus: EscrowStatus.HOLDING,
            customerNote: null,
          },
        })

        // Create order items
        for (const itemData of orderItemsData) {
          await tx.orderItem.create({
            data: {
              orderId: order.id,
              ...itemData,
            },
          })
        }

        // Create payment entry
        await tx.payment.create({
          data: {
            orderId: order.id,
            amount: total,
            paymentMethod: dbPaymentMethod,
            paymentType: PaymentType.ORDER,
            status: PaymentStatus.PENDING,
          },
        })

        createdOrders.push(order)
      }

      // Clear cart items in database
      await tx.cartItem.deleteMany({
        where: { userId: user.id },
      })
    })

    // Determine mock payment url if it is an online method
    let paymentUrl: string | null = null
    if (paymentMethod === "e_wallet") {
      paymentUrl = `https://test-payment.momo.vn/pay/mock?orderId=${primaryOrderId}`
    } else if (paymentMethod === "credit_card") {
      paymentUrl = `https://checkout.stripe.com/pay/mock?orderId=${primaryOrderId}`
    }

    return NextResponse.json({
      orderId: primaryOrderId,
      status: "pending",
      paymentMethod,
      paymentUrl,
    })
  } catch (error) {
    console.error("POST /api/orders error:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi xử lý đơn hàng" },
      { status: 500 }
    )
  }
}

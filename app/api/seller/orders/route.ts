import { NextResponse } from "next/server"
import { CustomOrderStatus, OrderStatus } from "@/app/generated/prisma/enums"
import { requireSeller } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sellerOrderInclude, serializeSellerOrder } from "@/lib/seller-order"
import { customOrderStatusLabels } from "@/components/seller/orders/order-constants"

export async function GET(request: Request) {
  try {
    const seller = await requireSeller()
    if (!seller) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const type = searchParams.get("type")

    const statusFilter =
      status && Object.values(OrderStatus).includes(status as OrderStatus)
        ? (status as OrderStatus)
        : undefined

    const orders = await prisma.order.findMany({
      where: {
        sellerId: seller.id,
        status: statusFilter,
        ...(type === "custom" ? { id: -1 } : {}),
        ...(type === "sale"
          ? { items: { every: { product: { type: "SALE" } } } }
          : {}),
        ...(type === "rental"
          ? {
              items: {
                some: { product: { type: { in: ["RENTAL", "BOTH"] } } },
              },
            }
          : {}),
      },
      include: sellerOrderInclude,
      orderBy: { createdAt: "desc" },
    })

    const customOrders = await prisma.customOrder.findMany({
      where: {
        sellerId: seller.id,
        ...(type === "custom" ? {} : type ? { id: -1 } : {}),
        status:
          status &&
          Object.values(CustomOrderStatus).includes(status as CustomOrderStatus)
            ? (status as CustomOrderStatus)
            : undefined,
      },
      include: {
        user: { select: { id: true, name: true, phone: true, email: true } },
        progressUpdates: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    })

    const customData = customOrders.map((order) => ({
      id: order.id,
      source: "CUSTOM_ORDER" as const,
      orderNumber: order.orderNumber,
      orderType: "CUSTOM" as const,
      customer: {
        id: order.user.id,
        name: order.user.name,
        phone: order.user.phone,
        email: order.user.email,
      },
      shipping: {
        name: order.user.name,
        phone: order.user.phone ?? "",
        address: "Đơn đặt may",
        city: "",
        district: "",
        ward: "",
        note: order.specialRequests,
      },
      subtotal: Number(order.finalAmount ?? order.estimatedPrice ?? 0),
      shippingFee: Number(order.shippingFee ?? 0),
      discount: 0,
      tax: 0,
      total: Number(order.finalAmount ?? order.estimatedPrice ?? 0),
      status: order.status,
      statusLabel: customOrderStatusLabels[order.status],
      paymentStatus: order.totalPaid.greaterThan(0) ? "PARTIAL" : "PENDING",
      paymentMethod: "CUSTOM_ORDER",
      escrowStatus: "CUSTOM_ORDER",
      customerNote: order.description,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: [
        {
          id: order.id,
          productId: order.id,
          productSlug: `custom-order-${order.id}`,
          productName: order.title,
          variantId: null,
          variantName: order.characterName ?? order.animeName,
          image: order.referenceImages[0] ?? null,
          price: Number(order.finalAmount ?? order.estimatedPrice ?? 0),
          quantity: 1,
          subtotal: Number(order.finalAmount ?? order.estimatedPrice ?? 0),
        },
      ],
      statusHistory: order.progressUpdates.map((progress) => ({
        id: progress.id,
        status: order.status,
        statusLabel: customOrderStatusLabels[order.status],
        note: `${progress.title}: ${progress.description}`,
        createdBy: null,
        createdAt: progress.createdAt.toISOString(),
      })),
      nextStatuses: [],
    }))

    const data = [...orders.map(serializeSellerOrder), ...customData].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    return NextResponse.json({
      data: {
        orders: data,
        stats: {
          total: data.length,
          sale: data.filter((order) => order.orderType === "SALE").length,
          rental: data.filter((order) => order.orderType === "RENTAL").length,
          custom: data.filter((order) => order.orderType === "CUSTOM").length,
          byStatus: Object.fromEntries(
            Array.from(
              new Set([
                ...Object.values(OrderStatus),
                ...Object.values(CustomOrderStatus),
              ])
            ).map((orderStatus) => [
              orderStatus,
              data.filter((order) => order.status === orderStatus).length,
            ])
          ),
        },
      },
    })
  } catch (error) {
    console.error("GET /api/seller/orders error:", error)
    return NextResponse.json(
      { error: "Không thể lấy danh sách đơn hàng" },
      { status: 500 }
    )
  }
}

import OrderManagement from "@/components/admin/orders/order-management"
import { prisma } from "@/lib/prisma"

export default async function OrdersPage() {
  const [orders, customOrders, rentalOrders] = await Promise.all([
    prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        seller: { select: { name: true, shopName: true } },
        items: { select: { productName: true, quantity: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.customOrder.findMany({
      include: {
        user: { select: { name: true, email: true } },
        seller: { select: { name: true, shopName: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.rentalOrder.findMany({
      include: {
        user: { select: { name: true, email: true } },
        rentalItem: {
          include: {
            product: { select: { name: true } },
            seller: { select: { name: true, shopName: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ])

  const rows = [
    ...orders.map((order) => ({
      id: order.orderNumber,
      customer: order.shippingName || order.user.name,
      seller: order.seller.shopName ?? order.seller.name,
      type: "Mua hàng" as const,
      item:
        order.items
          .map((item) => `${item.productName} x${item.quantity}`)
          .join(", ") || "Đơn mua sản phẩm",
      amount: Number(order.total),
      status: order.status,
      createdAt: order.createdAt,
      deadline: null,
    })),
    ...customOrders.map((order) => ({
      id: order.orderNumber,
      customer: order.user.name,
      seller: order.seller.shopName ?? order.seller.name,
      type: "Đặt may" as const,
      item: order.title,
      amount: Number(order.totalPaid || order.finalAmount || 0),
      status: order.status,
      createdAt: order.createdAt,
      deadline: order.deadline,
    })),
    ...rentalOrders.map((order) => ({
      id: order.orderNumber,
      customer: order.user.name,
      seller: order.rentalItem.seller.shopName ?? order.rentalItem.seller.name,
      type: "Thuê đồ" as const,
      item: order.rentalItem.product.name,
      amount: Number(order.rentalFee),
      status: order.status,
      createdAt: order.createdAt,
      deadline: order.endDate,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  return <OrderManagement orders={rows} />
}

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
      type: "Mua hang" as const,
      item:
        order.items
          .map((item) => `${item.productName} x${item.quantity}`)
          .join(", ") || "Don mua san pham",
      amount: Number(order.total),
      status: order.status,
      createdAt: order.createdAt,
      deadline: null,
    })),
    ...customOrders.map((order) => ({
      id: order.orderNumber,
      customer: order.user.name,
      seller: order.seller.shopName ?? order.seller.name,
      type: "Dat may" as const,
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
      type: "Thue do" as const,
      item: order.rentalItem.product.name,
      amount: Number(order.rentalFee),
      deposit: Number(order.depositAmount),
      refundAmount: Number(order.refundAmount),
      shippingName: order.shippingName,
      shippingPhone: order.shippingPhone,
      shippingAddress: order.shippingAddress,
      shippingCity: order.shippingCity,
      shippingDistrict: order.shippingDistrict,
      shippingWard: order.shippingWard,
      shippingNote: order.shippingNote,
      returnName: order.returnName,
      returnPhone: order.returnPhone,
      returnAddress: order.returnAddress,
      returnCity: order.returnCity,
      returnDistrict: order.returnDistrict,
      returnWard: order.returnWard,
      returnAddressNote: order.returnAddressNote,
      pickupImages: order.pickupImages,
      returnImages: order.returnImages,
      status: order.status,
      createdAt: order.createdAt,
      deadline: order.endDate,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  return <OrderManagement orders={rows} />
}

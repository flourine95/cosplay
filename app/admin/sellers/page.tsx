import SellerManagement from "@/components/admin/sellers/seller-management"
import { UserRole } from "@/app/generated/prisma/enums"
import { prisma } from "@/lib/prisma"

export default async function SellersPage() {
  const sellers = await prisma.user.findMany({
    where: { role: UserRole.SELLER },
    include: {
      products: { select: { id: true } },
      ordersAsSeller: { select: { total: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const sellerRows = sellers.map((seller) => ({
    id: seller.id,
    name: seller.name,
    email: seller.email,
    shopName: seller.shopName,
    sellerStatus: seller.sellerStatus,
    sellerRating: seller.sellerRating,
    sellerTotalSales: seller.sellerTotalSales,
    createdAt: seller.createdAt,
    productCount: seller.products.length,
    revenue: seller.ordersAsSeller.reduce(
      (sum, order) => sum + Number(order.total),
      0
    ),
  }))

  return <SellerManagement sellers={sellerRows} />
}

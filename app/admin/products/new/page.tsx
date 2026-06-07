import { UserRole } from "@/app/generated/prisma/enums"
import { ProductCreateForm } from "@/components/admin/products/product-create-form"
import { prisma } from "@/lib/prisma"

export default async function NewAdminProductPage() {
  const [categories, sellers] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    }),
    prisma.user.findMany({
      where: { role: UserRole.SELLER },
      select: { id: true, name: true, email: true, shopName: true },
      orderBy: { createdAt: "desc" },
    }),
  ])

  return <ProductCreateForm categories={categories} sellers={sellers} />
}

import CategoryManagement from "@/components/admin/categories/category-management"
import { prisma } from "@/lib/prisma"

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      parent: { select: { id: true, name: true } },
      _count: { select: { products: true, children: true } },
    },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  })

  return <CategoryManagement categories={categories} />
}

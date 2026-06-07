import { notFound } from "next/navigation"
import { UserRole } from "@/app/generated/prisma/enums"
import { ProductCreateForm } from "@/components/admin/products/product-create-form"
import { prisma } from "@/lib/prisma"

interface EditAdminProductPageProps {
  params: Promise<{ id: string }>
}

export default async function EditAdminProductPage({
  params,
}: EditAdminProductPageProps) {
  const { id } = await params
  const productId = Number(id)

  if (!Number.isInteger(productId) || productId <= 0) {
    notFound()
  }

  const [product, categories, sellers] = await Promise.all([
    prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: { orderBy: { order: "asc" } },
        variants: { orderBy: { id: "asc" } },
        rentalItem: true,
      },
    }),
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

  if (!product) {
    notFound()
  }

  const defaultVariant =
    product.variants.find((variant) => variant.isDefault) ?? product.variants[0]

  return (
    <ProductCreateForm
      mode="edit"
      productId={product.id}
      categories={categories}
      sellers={sellers}
      initialData={{
        name: product.name,
        slug: product.slug,
        sellerId: product.sellerId,
        categoryId: product.categoryId,
        description: product.description ?? "",
        shortDescription: product.shortDescription ?? "",
        price: Number(product.price),
        comparePrice: product.comparePrice
          ? Number(product.comparePrice)
          : undefined,
        sku: product.sku ?? "",
        type: product.type,
        status: product.status,
        tags: product.tags,
        imageUrls: product.images.map((image) => image.url),
        variantName: defaultVariant?.name ?? "Mặc định",
        variantSku: defaultVariant?.sku ?? "",
        stock: defaultVariant?.stock ?? 0,
        rentalPricePerDay: product.rentalItem
          ? Number(product.rentalItem.pricePerDay)
          : undefined,
        rentalDepositAmount: product.rentalItem
          ? Number(product.rentalItem.depositAmount)
          : undefined,
        rentalMinDays: product.rentalItem?.minDays ?? 1,
        rentalMaxDays: product.rentalItem?.maxDays ?? undefined,
        rentalCondition: product.rentalItem?.condition,
      }}
    />
  )
}

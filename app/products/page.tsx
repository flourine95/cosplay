import { Navbar } from "@/components/home/navbar"
import { Footer } from "@/components/home/footer"
import { ProductCatalog } from "@/components/product/product-catalog"
import { prisma } from "@/lib/prisma"
import { mapDbProductToFrontendProduct } from "@/lib/products-server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ProductsPage() {
  const dbProducts = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
    },
    include: {
      images: true,
      category: true,
      rentalItem: true,
      variants: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const products = dbProducts.map(mapDbProductToFrontendProduct)
  const categories = Array.from(new Set(products.map((p) => p.category)))

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <ProductCatalog products={products} categories={categories} />
      </main>
      <Footer />
    </div>
  )
}

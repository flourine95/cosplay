import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { mapDbProductToFrontendProduct } from "@/lib/products-server"
import { Navbar } from "@/components/home/navbar"
import { Footer } from "@/components/home/footer"
import { ProductGallery } from "@/components/product/product-gallery"
import { ProductInfo } from "@/components/product/product-info"
import { ProductTabs } from "@/components/product/product-tabs"
import { RelatedProducts } from "@/components/product/related-products"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

type Props = {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params

  const dbProduct = await prisma.product.findUnique({
    where: {
      slug,
      status: "ACTIVE",
    },
    include: {
      images: true,
      category: true,
      rentalItem: true,
      variants: true,
      reviews: true,
      seller: true,
    },
  })

  if (!dbProduct) notFound()

  const product = mapDbProductToFrontendProduct(dbProduct)

  const dbRelated = await prisma.product.findMany({
    where: {
      categoryId: dbProduct.categoryId,
      id: { not: dbProduct.id },
      status: "ACTIVE",
    },
    take: 4,
    include: {
      images: true,
      category: true,
      rentalItem: true,
      variants: true,
    },
  })

  const related = dbRelated.map(mapDbProductToFrontendProduct)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/products">Sản phẩm</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Main product section */}
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={product.images} name={product.name} />
          <ProductInfo product={product} />
        </div>

        {/* Tabs: mô tả, chi tiết, đánh giá */}
        <div className="mt-16">
          <ProductTabs product={product} />
        </div>

        {/* Related */}
        <div className="mt-20">
          <RelatedProducts products={related} />
        </div>
      </main>

      <Footer />
    </div>
  )
}

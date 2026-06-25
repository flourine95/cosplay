import { prisma } from "@/lib/prisma"
import { mapDbProductToFrontendProduct } from "@/lib/products-server"
import { Navbar } from "@/components/home/navbar"
import { AnnouncementBar } from "@/components/home/announcement-bar"
import { Footer } from "@/components/home/footer"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SearchForm } from "@/components/search/search-form"
import { SearchFilters } from "@/components/search/search-filters"
import { SearchResults } from "@/components/search/search-results"
import Link from "next/link"

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    sort?: string
    minPrice?: string
    maxPrice?: string
  }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedParams = await searchParams
  const {
    q: query = "",
    category,
    sort: sortBy,
    minPrice,
    maxPrice,
  } = resolvedParams

  let orderBy: Record<string, "asc" | "desc"> = { reviewCount: "desc" }
  if (sortBy === "price-asc") {
    orderBy = { price: "asc" }
  } else if (sortBy === "price-desc") {
    orderBy = { price: "desc" }
  } else if (sortBy === "rating") {
    orderBy = { rating: "desc" }
  } else if (sortBy === "newest") {
    orderBy = { createdAt: "desc" }
  }

  const dbProducts = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      AND: [
        query.trim()
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
                { tags: { has: query } },
              ],
            }
          : {},
        category && category !== "all"
          ? {
              category: {
                name: { equals: category, mode: "insensitive" },
              },
            }
          : {},
        minPrice ? { price: { gte: parseFloat(minPrice) } } : {},
        maxPrice ? { price: { lte: parseFloat(maxPrice) } } : {},
      ],
    },
    include: {
      images: true,
      category: true,
      rentalItem: true,
      variants: true,
    },
    orderBy,
  })

  const products = dbProducts.map(mapDbProductToFrontendProduct)

  return (
    <main className="min-h-screen">
      <AnnouncementBar />
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Trang chủ</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Tìm kiếm</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page title and search form */}
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Tìm kiếm sản phẩm
          </h1>
          <div className="max-w-2xl">
            <SearchForm />
          </div>
        </div>

        {/* Results summary */}
        {query && (
          <p className="mb-6 text-sm text-muted-foreground">
            Tìm thấy <span className="font-semibold">{products.length}</span>{" "}
            sản phẩm cho &quot;{query}&quot;
          </p>
        )}

        {/* Filters and Results */}
        <div className="grid gap-8 md:grid-cols-4">
          {/* Filters sidebar */}
          <div className="md:col-span-1">
            <SearchFilters />
          </div>

          {/* Results */}
          <div className="md:col-span-3">
            <SearchResults products={products} query={query} />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

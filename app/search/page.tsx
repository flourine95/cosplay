"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
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
import { searchProducts } from "@/lib/products"
import Link from "next/link"

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const category = searchParams.get("category")
  const sortBy = searchParams.get("sort")
  const minPrice = searchParams.get("minPrice")
  const maxPrice = searchParams.get("maxPrice")

  const products = searchProducts(query, {
    ...(category ? { category } : {}),
    priceRange:
      minPrice && maxPrice ? [Number(minPrice), Number(maxPrice)] : undefined,
    ...(sortBy ? { sortBy } : {}),
  })

  return (
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
          Tìm thấy <span className="font-semibold">{products.length}</span> sản
          phẩm
          {query && <span> cho &quot;{query}&quot;</span>}
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
  )
}

export default function SearchPage() {
  return (
    <main className="min-h-screen">
      <AnnouncementBar />
      <Navbar />

      <Suspense fallback={<div className="py-20 text-center">Đang tải...</div>}>
        <SearchContent />
      </Suspense>

      <Footer />
    </main>
  )
}

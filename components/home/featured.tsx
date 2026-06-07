"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, ArrowRight } from "lucide-react"
import { Button } from "components/ui/button"

const products = [
  {
    id: 1,
    slug: "nezuko-kamado",
    name: "Nezuko Kamado",
    series: "Demon Slayer",
    price: 850000,
    originalPrice: 1200000,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=600&h=800&fit=crop",
    badge: "Bán chạy",
    canRent: true,
    rentPrice: 150000,
  },
  {
    id: 2,
    slug: "rem-rezero",
    name: "Rem",
    series: "Re:Zero",
    price: 920000,
    originalPrice: null,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&h=800&fit=crop",
    badge: "Mới",
    canRent: true,
    rentPrice: 180000,
  },
  {
    id: 3,
    slug: "batman",
    name: "Batman",
    series: "DC Comics",
    price: 1100000,
    originalPrice: 1400000,
    rating: 5.0,
    image:
      "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=600&h=800&fit=crop",
    badge: "Hot",
    canRent: false,
    rentPrice: null,
  },
  {
    id: 4,
    slug: "sailor-moon",
    name: "Sailor Moon",
    series: "Sailor Moon",
    price: 750000,
    originalPrice: null,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=600&h=800&fit=crop",
    badge: "Thuê được",
    canRent: true,
    rentPrice: 120000,
  },
  {
    id: 5,
    slug: "hu-tao",
    name: "Hu Tao",
    series: "Genshin Impact",
    price: 980000,
    originalPrice: 1300000,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=600&h=900&fit=crop&crop=bottom",
    badge: "Giảm giá",
    canRent: true,
    rentPrice: 160000,
  },
]

import { formatPrice } from "lib/utils"

export function Featured() {
  return (
    <section id="shop" className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-[clamp(1.875rem,4vw,2.5rem)] font-extrabold tracking-tight text-foreground">
              Đang được săn đón
            </h2>
          </div>
          <Button
            variant="outline"
            className="hidden rounded-full md:flex"
            asChild
          >
            <Link href="/products">
              Xem tất cả <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
        {/* 5-column uniform grid — all cards same aspect ratio */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group flex flex-col gap-3"
            >
              {/* Image */}
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />

                {/* Hover overlay — visible on hover OR focus-within for keyboard users */}
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 group-hover:opacity-100">
                  <div className="flex flex-col gap-2 p-3">
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        className="flex flex-1 items-center justify-center gap-1 rounded-full bg-primary py-2 text-xs font-semibold text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      >
                        <ShoppingCart className="size-3" />
                        Mua ngay
                      </button>
                      {product.canRent && (
                        <button
                          type="button"
                          className="flex flex-1 items-center justify-center rounded-full bg-white/20 py-2 text-xs font-semibold text-white backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        >
                          Thuê
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Badge */}
                <span className="absolute top-2.5 left-2.5 rounded-full border border-border/40 bg-background/90 px-2 py-0.5 text-xs font-semibold text-foreground backdrop-blur-sm">
                  {product.badge}
                </span>
              </div>

              {/* Info */}
              <div>
                <p className="text-sm text-muted-foreground">
                  {product.series}
                </p>
                <h3 className="mt-0.5 text-base font-semibold text-foreground">
                  {product.name}
                </h3>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-base font-bold text-foreground">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
                {product.canRent && product.rentPrice && (
                  <p className="mt-0.5 text-sm text-primary">
                    Thuê từ {formatPrice(product.rentPrice)}/ngày
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center md:hidden">
          <Button variant="outline" className="rounded-full" asChild>
            <Link href="/products">Xem tất cả sản phẩm</Link>
          </Button>
        </div>{" "}
      </div>
    </section>
  )
}

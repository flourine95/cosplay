import { Package, Star } from "lucide-react"
import Image from "next/image"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"
import { StatisticsEmpty } from "./statistics-empty"
import type { StatisticsData } from "./statistics-types"

export function TopProductsCard({
  products,
}: {
  products: StatisticsData["topProducts"]
}) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-2">
            <Package className="size-4 text-primary" />
          </div>
          <div>
            <CardTitle>Sản phẩm hiệu quả</CardTitle>
            <p className="text-sm text-muted-foreground">
              Xếp theo doanh thu từ order items.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {products.length === 0 ? (
          <StatisticsEmpty text="Chưa có sản phẩm phát sinh doanh thu." />
        ) : (
          products.map((product, index) => (
            <div
              key={product.id}
              className="flex items-center gap-4 rounded-lg border border-border/60 p-4"
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-bold">
                {index + 1}
              </div>
              <div className="relative size-12 overflow-hidden rounded-lg bg-muted">
                {product.image && (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{product.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="secondary">{product.orders} lượt</Badge>
                  <span className="flex items-center gap-1 text-xs">
                    <Star className="size-3 fill-primary text-primary" />
                    {product.rating.toFixed(1)}
                  </span>
                </div>
              </div>
              <p className="font-semibold text-primary">
                {formatCurrency(product.revenue)}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

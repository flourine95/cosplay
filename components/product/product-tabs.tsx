import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductReviews } from "@/components/reviews/product-reviews"
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/products"

export function ProductTabs({ product }: { product: Product }) {
  const reviewLabel =
    product.reviewCount > 0 ? `Đánh giá (${product.reviewCount})` : "Đánh giá"

  const tabs = [
    { value: "description", label: "Mô tả" },
    { value: "details", label: "Chi tiết" },
    { value: "reviews", label: reviewLabel },
  ]

  return (
    <Tabs defaultValue="description" className="gap-0">
      <TabsList className="h-auto w-full justify-start rounded-none border-b border-border bg-transparent p-0">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="h-full rounded-none border-0 border-b-2 border-transparent bg-transparent px-6 py-3 text-sm font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none!"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="description" className="mt-6 bg-transparent">
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          {product.description}
        </p>
      </TabsContent>

      <TabsContent value="details" className="mt-6 bg-transparent">
        <div className="max-w-md">
          {product.details.map((d, i) => (
            <div
              key={d.label}
              className={cn(
                "grid grid-cols-2 py-3 text-sm",
                i < product.details.length - 1
                  ? "border-b border-border/60"
                  : ""
              )}
            >
              <span className="font-medium text-foreground">{d.label}</span>
              <span className="text-muted-foreground">{d.value}</span>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="reviews" className="mt-6 bg-transparent">
        <ProductReviews product={product} />
      </TabsContent>
    </Tabs>
  )
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductReviews } from "@/components/reviews/product-reviews"
import type { Product } from "@/lib/products"

export function ProductTabs({ product }: { product: Product }) {
  return (
    <Tabs defaultValue="description">
      <TabsList className="h-auto w-full justify-start gap-0 border-b border-border bg-transparent p-0">
        {["description", "details", "reviews"].map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            className="rounded-none border-b-2 border-transparent bg-transparent px-6 py-3 text-sm font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            {tab === "description" && "Mô tả"}
            {tab === "details" && "Chi tiết"}
            {tab === "reviews" && `Đánh giá (${product.reviewCount})`}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="description" className="mt-6">
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          {product.description}
        </p>
      </TabsContent>

      <TabsContent value="details" className="mt-6">
        <div className="max-w-md">
          {product.details.map((d, i) => (
            <div
              key={d.label}
              className={`flex justify-between py-3 text-sm ${
                i < product.details.length - 1
                  ? "border-b border-border/60"
                  : ""
              }`}
            >
              <span className="font-medium text-foreground">{d.label}</span>
              <span className="text-muted-foreground">{d.value}</span>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="reviews" className="mt-6">
        <ProductReviews product={product} />
      </TabsContent>
    </Tabs>
  )
}

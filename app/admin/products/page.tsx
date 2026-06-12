import Link from "next/link"
import { Package, Pencil, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      category: { select: { name: true } },
      seller: { select: { name: true, shopName: true } },
      variants: { select: { stock: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Quản lý sản phẩm
          </h1>
          <p className="text-sm text-muted-foreground">
            Xem sản phẩm mới nhất và thêm sản phẩm vào marketplace.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" />
            Thêm sản phẩm
          </Link>
        </Button>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Danh sách gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/80 text-center">
              <Package className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Chưa có sản phẩm nào.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border/60">
              <div className="grid grid-cols-[1fr_140px_140px_120px_80px] gap-4 border-b border-border/60 bg-muted/40 px-4 py-2 text-sm font-medium text-muted-foreground">
                <span>Sản phẩm</span>
                <span>Danh mục</span>
                <span>Seller</span>
                <span className="text-right">Tồn kho</span>
                <span className="text-right">Sửa</span>
              </div>
              {products.map((product) => {
                const totalStock = product.variants.reduce(
                  (sum, variant) => sum + variant.stock,
                  0
                )

                return (
                  <div
                    key={product.id}
                    className="grid grid-cols-[1fr_140px_140px_120px_80px] gap-4 border-b border-border/40 px-4 py-3 text-sm last:border-b-0"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.slug} · {product.status}
                      </p>
                    </div>
                    <span className="text-muted-foreground">
                      {product.category.name}
                    </span>
                    <span className="text-muted-foreground">
                      {product.seller.shopName ?? product.seller.name}
                    </span>
                    <span className="text-right font-medium">{totalStock}</span>
                    <span className="text-right">
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

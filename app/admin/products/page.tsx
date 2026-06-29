import Link from "next/link"
import {
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  Package,
  Pencil,
  Plus,
} from "lucide-react"
import { ProductStatus } from "@/app/generated/prisma/enums"
import { ProductModerationActions } from "@/components/admin/products/product-moderation-actions"
import { ProductStatusSelect } from "@/components/admin/products/product-status-select"
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
    take: 50,
  })

  const pendingCount = products.filter(
    (product) => product.status === ProductStatus.DRAFT
  ).length
  const activeCount = products.filter(
    (product) => product.status === ProductStatus.ACTIVE
  ).length
  const hiddenCount = products.filter(
    (product) => product.status === ProductStatus.DISCONTINUED
  ).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Kiểm duyệt sản phẩm
          </h1>
          <p className="text-sm text-muted-foreground">
            Tạo, sửa và cập nhật trạng thái hiển thị của sản phẩm trên
            marketplace.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" />
            Thêm sản phẩm
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Chờ duyệt
            </CardTitle>
            <Clock3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {pendingCount}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đã duyệt
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {activeCount}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Từ chối/Ẩn
            </CardTitle>
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              {hiddenCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Danh sách sản phẩm</CardTitle>
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
              <div className="grid grid-cols-[1fr_140px_140px_150px_100px_180px_120px] gap-4 border-b border-border/60 bg-muted/40 px-4 py-2 text-sm font-medium text-muted-foreground">
                <span>Sản phẩm</span>
                <span>Danh mục</span>
                <span>Seller</span>
                <span>Trạng thái</span>
                <span className="text-right">Tồn kho</span>
                <span className="text-right">Kiểm duyệt</span>
                <span className="text-right">Thao tác</span>
              </div>
              {products.map((product) => {
                const totalStock = product.variants.reduce(
                  (sum, variant) => sum + variant.stock,
                  0
                )

                return (
                  <div
                    key={product.id}
                    className="grid grid-cols-[1fr_140px_140px_150px_100px_180px_120px] items-center gap-4 border-b border-border/40 px-4 py-3 text-sm last:border-b-0"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.slug}
                      </p>
                    </div>
                    <span className="text-muted-foreground">
                      {product.category.name}
                    </span>
                    <span className="text-muted-foreground">
                      {product.seller.shopName ?? product.seller.name}
                    </span>
                    <ProductStatusSelect
                      productId={product.id}
                      status={product.status}
                    />
                    <span className="text-right font-medium">{totalStock}</span>
                    <ProductModerationActions
                      productId={product.id}
                      status={product.status}
                    />
                    <span className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link href={`/admin/products/${product.id}/preview`}>
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
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

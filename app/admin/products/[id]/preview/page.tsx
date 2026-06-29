import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { prisma } from "@/lib/prisma"

type Props = {
  params: Promise<{ id: string }>
}

const statusLabels: Record<string, string> = {
  DRAFT: "Chờ duyệt",
  ACTIVE: "Đã duyệt",
  OUT_OF_STOCK: "Hết hàng",
  DISCONTINUED: "Từ chối/Ẩn",
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)

export default async function AdminProductPreviewPage({ params }: Props) {
  const { id } = await params
  const productId = Number(id)
  if (!Number.isInteger(productId) || productId <= 0) notFound()

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: { select: { name: true } },
      seller: { select: { name: true, shopName: true } },
      images: { orderBy: [{ isPrimary: "desc" }, { order: "asc" }] },
      variants: true,
      rentalItem: true,
    },
  })

  if (!product) notFound()

  const primaryImage = product.images[0]?.url ?? "/images/placeholder.jpg"

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2">
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4" />
              Quay lại kiểm duyệt
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Xem sản phẩm</h1>
          <p className="text-sm text-muted-foreground">
            Preview nội bộ cho admin, xem được cả sản phẩm chưa duyệt.
          </p>
        </div>
        <Button asChild>
          <Link href={`/admin/products/${product.id}/edit`}>
            <Pencil className="h-4 w-4" />
            Sửa sản phẩm
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <Image
                src={primaryImage}
                alt={product.name}
                fill
                sizes="420px"
                className="object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {product.images.slice(0, 5).map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-square overflow-hidden rounded-md bg-muted"
                  >
                    <Image
                      src={image.url}
                      alt={image.alt ?? product.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/60">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {statusLabels[product.status] ?? product.status}
                </Badge>
                <Badge variant="outline">{product.type}</Badge>
              </div>
              <CardTitle className="text-2xl">{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <Info label="Danh mục" value={product.category.name} />
                <Info
                  label="Seller"
                  value={product.seller.shopName ?? product.seller.name}
                />
                <Info
                  label="Giá"
                  value={formatCurrency(Number(product.price))}
                />
                <Info
                  label="Giá so sánh"
                  value={
                    product.comparePrice
                      ? formatCurrency(Number(product.comparePrice))
                      : "Không có"
                  }
                />
              </div>
              <Separator />
              <div>
                <h2 className="mb-2 font-semibold">Mô tả ngắn</h2>
                <p className="text-sm text-muted-foreground">
                  {product.shortDescription ?? "Chưa có mô tả ngắn."}
                </p>
              </div>
              <div>
                <h2 className="mb-2 font-semibold">Mô tả chi tiết</h2>
                <p className="text-sm whitespace-pre-line text-muted-foreground">
                  {product.description ?? "Chưa có mô tả chi tiết."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Biến thể & tồn kho</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {product.variants.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Chưa có biến thể.
                </p>
              ) : (
                product.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="flex items-center justify-between rounded-lg border border-border/60 p-3 text-sm"
                  >
                    <div>
                      <p className="font-semibold">{variant.name}</p>
                      <p className="text-xs text-muted-foreground">
                        SKU: {variant.sku ?? "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">Tồn: {variant.stock}</p>
                      {variant.price && (
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(Number(variant.price))}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  )
}

import { SellerProductForm } from "@/components/seller/products/product-form"

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const productId = Number(id)

  return (
    <div className="mx-auto max-w-[1280px]">
      <SellerProductForm productId={productId} />
    </div>
  )
}

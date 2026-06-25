import ProductForm from "@/components/seller/product-form"

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const productId = Number(id)

  return (
    <div className="mx-auto max-w-[1280px]">
      <ProductForm productId={productId} />
    </div>
  )
}

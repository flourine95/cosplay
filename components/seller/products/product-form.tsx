"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Save } from "lucide-react"
import { useEffect, useState } from "react"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { ProductType } from "@/app/generated/prisma/enums"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { formatCurrency } from "@/lib/format"
import { slugify } from "@/lib/slug"
import type { SellerProductFormValues } from "@/schemas/seller-product"
import { sellerProductSchema } from "@/schemas/seller-product"
import { sellerProductRoutes } from "./product-constants"
import {
  ProductBasicFields,
  ProductPricingFields,
  ProductRentalFields,
  ProductVisibilityFields,
} from "./product-form-fields"
import {
  defaultProductFormValues,
  normalizeProductPayload,
  toProductFormValues,
} from "./product-form-utils"
import { ProductImageField } from "./product-image-field"
import { ProductVariantFields } from "./product-variant-fields"
import type {
  SellerProductCategory,
  SellerProductResponse,
} from "./product-types"

export function SellerProductForm({ productId }: { productId?: number }) {
  const router = useRouter()
  const [categories, setCategories] = useState<SellerProductCategory[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(productId))
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm<SellerProductFormValues>({
    resolver: zodResolver(sellerProductSchema),
    defaultValues: defaultProductFormValues,
  })

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setValue,
  } = form

  const { append, fields, remove } = useFieldArray({
    control,
    name: "variants",
  })

  const imageUrls = useWatch({ control, name: "imageUrls" }) ?? []
  const watchedName = useWatch({ control, name: "name" })
  const watchedPrice = useWatch({ control, name: "price" })
  const watchedSlug = useWatch({ control, name: "slug" })
  const watchedType = useWatch({ control, name: "type" })
  const hasRental =
    watchedType === ProductType.RENTAL || watchedType === ProductType.BOTH
  const price = Number(watchedPrice || 0)
  const pricePreview = price > 0 ? formatCurrency(price) : null
  const title = productId ? "Sửa thông tin sản phẩm" : "Thêm sản phẩm mới"
  const submitLabel = productId ? "Lưu thay đổi" : "Lưu sản phẩm"

  useEffect(() => {
    let ignore = false

    async function loadBaseData() {
      try {
        const [categoriesResponse, productResponse] = await Promise.all([
          fetch("/api/seller/categories"),
          productId ? fetch(`/api/seller/products/${productId}`) : null,
        ])

        const categoriesJson = await categoriesResponse.json()
        if (!categoriesResponse.ok) {
          throw new Error(categoriesJson.error ?? "Không thể lấy danh mục")
        }

        if (!ignore) {
          setCategories(categoriesJson.data)
          if (!productId && categoriesJson.data[0]) {
            setValue("categoryId", categoriesJson.data[0].id)
          }
        }

        if (productResponse) {
          const productJson = await productResponse.json()
          if (!productResponse.ok) {
            throw new Error(productJson.error ?? "Không thể lấy sản phẩm")
          }
          if (!ignore) {
            reset(
              toProductFormValues(productJson.data as SellerProductResponse)
            )
          }
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    void loadBaseData()
    return () => {
      ignore = true
    }
  }, [productId, reset, setValue])

  useEffect(() => {
    if (!productId && watchedName && !watchedSlug) {
      setValue("slug", slugify(watchedName), { shouldValidate: true })
    }
  }, [productId, setValue, watchedName, watchedSlug])

  async function handleUploadImages(files: FileList | null) {
    if (!files?.length) return
    setIsUploading(true)
    try {
      const formData = new FormData()
      Array.from(files).forEach((file) => formData.append("files", file))

      const response = await fetch("/api/seller/product-images", {
        method: "POST",
        body: formData,
      })
      const json = await response.json()
      if (!response.ok) throw new Error(json.error ?? "Không thể tải ảnh lên")

      setValue("imageUrls", [...imageUrls, ...json.data.urls], {
        shouldDirty: true,
        shouldValidate: true,
      })
      toast.success("Đã tải ảnh lên")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải ảnh")
    } finally {
      setIsUploading(false)
    }
  }

  function handleRemoveImage(url: string) {
    setValue(
      "imageUrls",
      imageUrls.filter((item) => item !== url),
      { shouldDirty: true, shouldValidate: true }
    )
  }

  async function handleValidSubmit(values: SellerProductFormValues) {
    const payload = normalizeProductPayload(values)
    const response = await fetch(
      productId ? `/api/seller/products/${productId}` : "/api/seller/products",
      {
        method: productId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    )
    const json = await response.json()
    if (!response.ok) throw new Error(json.error ?? "Không thể lưu sản phẩm")

    toast.success(productId ? "Đã cập nhật sản phẩm" : "Đã tạo sản phẩm")
    router.push(sellerProductRoutes.list)
    router.refresh()
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="text-primary" />
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(handleValidSubmit, (formErrors) => {
        const [firstError] = Object.values(formErrors)
        if (firstError?.message) toast.error(String(firstError.message))
      })}
      className="relative min-h-[calc(100vh-100px)] pb-24"
    >
      <div className="mb-6 flex items-center gap-4">
        <Button asChild variant="outline" size="icon" className="rounded-full">
          <Link href={sellerProductRoutes.list} aria-label="Quay lại">
            <ArrowLeft />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">
            Quản lý thông tin, ảnh, size, tồn kho và cấu hình bán/thuê.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">
        <div className="flex flex-col gap-6">
          <ProductFormCard
            title="Thông tin cơ bản"
            description="Tên, danh mục và mô tả giúp khách hiểu trang phục phù hợp sự kiện nào."
          >
            <ProductBasicFields
              categories={categories}
              errors={errors}
              register={register}
            />
          </ProductFormCard>

          <ProductFormCard>
            <ProductImageField
              imageUrls={imageUrls}
              isUploading={isUploading}
              error={String(errors.imageUrls?.message ?? "") || undefined}
              onRemoveImage={handleRemoveImage}
              onUploadImages={handleUploadImages}
            />
          </ProductFormCard>

          <ProductFormCard>
            <ProductVariantFields
              errors={errors}
              fields={fields}
              register={register}
              onAppend={append}
              onRemove={remove}
            />
          </ProductFormCard>

          <ProductFormCard
            title="Cấu hình giá bán"
            description="Giá bán dùng cho sản phẩm bán đứt hoặc sản phẩm hỗ trợ cả bán và thuê."
          >
            <ProductPricingFields
              errors={errors}
              pricePreview={pricePreview}
              register={register}
            />
          </ProductFormCard>

          {hasRental && (
            <ProductFormCard
              title="Cấu hình cho thuê"
              description="Cọc, số ngày thuê và phụ kiện giúp giảm tranh chấp khi nhận trả đồ."
            >
              <ProductRentalFields errors={errors} register={register} />
            </ProductFormCard>
          )}
        </div>

        <aside className="flex flex-col gap-6">
          <ProductFormCard
            className="sticky top-24"
            title="Thiết lập hiển thị"
            description="Chọn mô hình kinh doanh trước, sau đó hoàn thiện các trường bắt buộc."
          >
            <ProductVisibilityFields
              errors={errors}
              register={register}
              setValue={setValue}
            />
          </ProductFormCard>
        </aside>
      </div>

      <div className="fixed right-0 bottom-0 z-40 flex w-full border-t border-border bg-background/90 p-4 backdrop-blur-md lg:w-[calc(100%-16rem)]">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-end gap-3 px-4 lg:px-10">
          <Button type="button" variant="outline" asChild>
            <Link href={sellerProductRoutes.list}>Hủy bỏ</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting || isUploading}>
            {isSubmitting ? <Spinner /> : <Save data-icon="inline-start" />}
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  )
}

function ProductFormCard({
  children,
  className,
  description,
  title,
}: {
  children: React.ReactNode
  className?: string
  description?: string
  title?: string
}) {
  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  )
}

"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Trash2,
  UploadCloud,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import type React from "react"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import {
  ProductStatus,
  ProductType,
  RentalItemCondition,
} from "@/app/generated/prisma/enums"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"
import type {
  SellerProductFormValues,
  SellerProductInput,
} from "@/schemas/seller-product"
import { sellerProductSchema } from "@/schemas/seller-product"

type Category = {
  id: number
  name: string
  slug: string
  parentId: number | null
}

type SellerProductResponse = {
  id: number
  slug: string
  name: string
  sku: string | null
  categoryId: number
  type: ProductType
  status: ProductStatus
  description: string | null
  shortDescription: string | null
  condition: string | undefined
  price: number
  comparePrice: number | null
  tags: string[]
  images: string[]
  variants: { id: number; size: string; sku: string | null; stock: number }[]
  rental: {
    pricePerDay: number
    depositAmount: number
    minDays: number
    maxDays: number | null
    condition: RentalItemCondition
  } | null
}

const defaultValues: SellerProductFormValues = {
  name: "",
  slug: "",
  categoryId: 0,
  description: "",
  shortDescription: "",
  condition: "Mới 100%",
  price: "",
  comparePrice: undefined,
  sku: "",
  type: ProductType.SALE,
  status: ProductStatus.DRAFT,
  tags: [],
  imageUrls: [],
  variants: [{ size: "Free-size", sku: "", stock: 1 }],
  rentalPricePerDay: undefined,
  rentalDepositAmount: undefined,
  rentalAccessories: "",
  rentalMinDays: 1,
  rentalMaxDays: undefined,
  rentalCondition: RentalItemCondition.EXCELLENT,
}

const conditionOptions = [
  "Mới 100%",
  "Như mới 95%",
  "Đã sử dụng 80%",
  "Có lỗi nhẹ",
]

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const toFormValues = (
  product: SellerProductResponse
): SellerProductFormValues => ({
  name: product.name,
  slug: product.slug,
  categoryId: product.categoryId,
  description: product.description ?? "",
  shortDescription: product.shortDescription ?? "",
  condition: product.condition ?? "Mới 100%",
  price: product.price,
  comparePrice: product.comparePrice ?? undefined,
  sku: product.sku ?? "",
  type: product.type,
  status:
    product.status === ProductStatus.ACTIVE
      ? ProductStatus.ACTIVE
      : ProductStatus.DRAFT,
  tags: product.tags.filter((tag) => !tag.startsWith("condition:")),
  imageUrls: product.images,
  variants:
    product.variants.length > 0
      ? product.variants.map((variant) => ({
          size: variant.size,
          sku: variant.sku ?? "",
          stock: variant.stock,
        }))
      : [{ size: "Free-size", sku: "", stock: 1 }],
  rentalPricePerDay: product.rental?.pricePerDay ?? undefined,
  rentalDepositAmount: product.rental?.depositAmount ?? undefined,
  rentalAccessories: "",
  rentalMinDays: product.rental?.minDays ?? 1,
  rentalMaxDays: product.rental?.maxDays ?? undefined,
  rentalCondition: product.rental?.condition ?? RentalItemCondition.EXCELLENT,
})

const normalizePayload = (
  values: SellerProductFormValues
): SellerProductInput => {
  const cleaned = {
    ...values,
    comparePrice: values.comparePrice || undefined,
    sku: values.sku?.trim() || undefined,
    description: values.description?.trim() || undefined,
    shortDescription: values.shortDescription?.trim() || undefined,
    condition: values.condition?.trim() || undefined,
    rentalPricePerDay: values.rentalPricePerDay || undefined,
    rentalDepositAmount: values.rentalDepositAmount || undefined,
    rentalAccessories: values.rentalAccessories?.trim() || undefined,
    rentalMaxDays: values.rentalMaxDays || undefined,
    tags: values.tags ?? [],
    imageUrls: values.imageUrls.filter(Boolean),
    variants: values.variants.map((variant) => ({
      size: variant.size.trim(),
      sku: variant.sku?.trim() || undefined,
      stock: variant.stock,
    })),
  }

  return sellerProductSchema.parse(cleaned)
}

export default function ProductForm({ productId }: { productId?: number }) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(productId))
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm<SellerProductFormValues>({
    resolver: zodResolver(sellerProductSchema),
    defaultValues,
  })

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setValue,
  } = form

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  })

  const watchedName = useWatch({ control, name: "name" })
  const watchedSlug = useWatch({ control, name: "slug" })
  const watchedType = useWatch({ control, name: "type" })
  const imageUrls = useWatch({ control, name: "imageUrls" }) ?? []
  const watchedPrice = useWatch({ control, name: "price" })
  const price = Number(watchedPrice || 0)
  const hasRental =
    watchedType === ProductType.RENTAL || watchedType === ProductType.BOTH

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
          if (!ignore) reset(toFormValues(productJson.data))
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadBaseData()
    return () => {
      ignore = true
    }
  }, [productId, reset, setValue])

  useEffect(() => {
    if (!productId && watchedName && !watchedSlug) {
      setValue("slug", slugify(watchedName), { shouldValidate: true })
    }
  }, [productId, setValue, watchedName, watchedSlug])

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => (
        <NativeSelectOption key={category.id} value={String(category.id)}>
          {category.name}
        </NativeSelectOption>
      )),
    [categories]
  )

  async function uploadImages(files: FileList | null) {
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

  function removeImage(url: string) {
    setValue(
      "imageUrls",
      imageUrls.filter((item) => item !== url),
      { shouldDirty: true, shouldValidate: true }
    )
  }

  async function onSubmit(values: SellerProductFormValues) {
    const payload = normalizePayload(values)
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
    router.push("/seller/products")
    router.refresh()
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (formErrors) => {
        const [firstError] = Object.values(formErrors)
        if (firstError?.message) toast.error(String(firstError.message))
      })}
      className="relative min-h-[calc(100vh-100px)] pb-24"
    >
      <div className="mb-6 flex items-center gap-4">
        <Button asChild variant="outline" size="icon" className="rounded-full">
          <Link href="/seller/products" aria-label="Quay lại">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-black text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">
            Quản lý thông tin, ảnh, size, tồn kho và cấu hình bán/thuê.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <h2 className="mb-4 text-lg font-black text-slate-900">
              Thông tin cơ bản
            </h2>
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <FieldError label="Tên sản phẩm *" error={errors.name?.message}>
                  <Input
                    placeholder="VD: Set Hầu Gái Maid Cosplay"
                    {...register("name")}
                  />
                </FieldError>
                <FieldError label="Slug *" error={errors.slug?.message}>
                  <Input placeholder="set-hau-gai-maid" {...register("slug")} />
                </FieldError>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <FieldError label="SKU" error={errors.sku?.message}>
                  <Input placeholder="SP-001" {...register("sku")} />
                </FieldError>
                <FieldError
                  label="Danh mục *"
                  error={errors.categoryId?.message}
                >
                  <NativeSelect {...register("categoryId")}>
                    {categoryOptions}
                  </NativeSelect>
                </FieldError>
                <FieldError
                  label="Tình trạng"
                  error={errors.condition?.message}
                >
                  <NativeSelect {...register("condition")}>
                    {conditionOptions.map((condition) => (
                      <NativeSelectOption key={condition} value={condition}>
                        {condition}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </FieldError>
              </div>

              <FieldError
                label="Mô tả ngắn"
                error={errors.shortDescription?.message}
              >
                <Input
                  placeholder="Tối đa 180 ký tự, hiển thị ở danh sách"
                  {...register("shortDescription")}
                />
              </FieldError>

              <FieldError
                label="Mô tả chi tiết"
                error={errors.description?.message}
              >
                <Textarea
                  className="min-h-[140px]"
                  placeholder="Chất liệu, form dáng, phụ kiện, lưu ý bảo quản..."
                  {...register("description")}
                />
              </FieldError>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Ảnh sản phẩm
                </h2>
                <p className="text-sm text-slate-500">
                  Ảnh đầu tiên sẽ là ảnh đại diện.
                </p>
              </div>
              <Button type="button" variant="outline" disabled={isUploading}>
                <Label className="flex cursor-pointer items-center gap-2">
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ImagePlus className="h-4 w-4" />
                  )}
                  Tải ảnh
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) => uploadImages(event.target.files)}
                  />
                </Label>
              </Button>
            </div>

            {imageUrls.length === 0 ? (
              <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center">
                <UploadCloud className="mb-2 h-8 w-8 text-slate-400" />
                <p className="text-sm font-bold text-slate-600">
                  Chưa có ảnh sản phẩm
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {imageUrls.map((url) => (
                  <div
                    key={url}
                    className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100"
                  >
                    <Image src={url} alt="" fill className="object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 opacity-0 transition group-hover:opacity-100"
                      onClick={() => removeImage(url)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {errors.imageUrls?.message && (
              <p className="mt-2 text-sm text-destructive">
                {String(errors.imageUrls.message)}
              </p>
            )}
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Size và tồn kho
                </h2>
                <p className="text-sm text-slate-500">
                  Mỗi size là một biến thể riêng.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ size: "", sku: "", stock: 0 })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Thêm size
              </Button>
            </div>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid gap-3 rounded-xl border border-slate-200 p-3 md:grid-cols-[1fr_1fr_120px_auto]"
                >
                  <FieldError
                    label="Size"
                    error={errors.variants?.[index]?.size?.message}
                  >
                    <Input
                      placeholder="S, M, L, Free-size"
                      {...register(`variants.${index}.size`)}
                    />
                  </FieldError>
                  <FieldError
                    label="SKU biến thể"
                    error={errors.variants?.[index]?.sku?.message}
                  >
                    <Input
                      placeholder="SP-001-M"
                      {...register(`variants.${index}.sku`)}
                    />
                  </FieldError>
                  <FieldError
                    label="Tồn kho"
                    error={errors.variants?.[index]?.stock?.message}
                  >
                    <Input
                      type="number"
                      min={0}
                      {...register(`variants.${index}.stock`)}
                    />
                  </FieldError>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="self-end text-destructive"
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-black text-emerald-800">
              Cấu hình giá bán
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <FieldError label="Giá bán *" error={errors.price?.message}>
                <Input type="number" min={0} {...register("price")} />
              </FieldError>
              <FieldError
                label="Giá so sánh"
                error={errors.comparePrice?.message}
              >
                <Input type="number" min={0} {...register("comparePrice")} />
              </FieldError>
            </div>
            {price > 0 && (
              <p className="mt-3 text-sm font-semibold text-emerald-700">
                Giá hiển thị: {formatCurrency(price)}
              </p>
            )}
          </section>

          {hasRental && (
            <section className="rounded-2xl border border-sky-100 bg-sky-50/30 p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-black text-sky-800">
                Cấu hình cho thuê
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <FieldError
                  label="Giá thuê/ngày *"
                  error={errors.rentalPricePerDay?.message}
                >
                  <Input
                    type="number"
                    min={0}
                    {...register("rentalPricePerDay")}
                  />
                </FieldError>
                <FieldError
                  label="Tiền cọc *"
                  error={errors.rentalDepositAmount?.message}
                >
                  <Input
                    type="number"
                    min={0}
                    {...register("rentalDepositAmount")}
                  />
                </FieldError>
                <FieldError
                  label="Số ngày tối thiểu"
                  error={errors.rentalMinDays?.message}
                >
                  <Input type="number" min={1} {...register("rentalMinDays")} />
                </FieldError>
                <FieldError
                  label="Số ngày tối đa"
                  error={errors.rentalMaxDays?.message}
                >
                  <Input type="number" min={1} {...register("rentalMaxDays")} />
                </FieldError>
                <FieldError
                  label="Tình trạng đồ thuê"
                  error={errors.rentalCondition?.message}
                >
                  <NativeSelect {...register("rentalCondition")}>
                    {Object.values(RentalItemCondition).map((condition) => (
                      <NativeSelectOption key={condition} value={condition}>
                        {condition}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </FieldError>
              </div>
              <div className="mt-4">
                <FieldError
                  label="Phụ kiện bao gồm"
                  error={errors.rentalAccessories?.message}
                >
                  <Textarea
                    placeholder="VD: 1 váy chính, 1 tạp dề, 1 nơ cổ, 1 wig..."
                    {...register("rentalAccessories")}
                  />
                </FieldError>
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className="sticky top-24 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <h2 className="mb-4 text-lg font-black text-slate-900">
              Thiết lập hiển thị
            </h2>
            <div className="space-y-4">
              <FieldError label="Loại sản phẩm" error={errors.type?.message}>
                <NativeSelect {...register("type")}>
                  <NativeSelectOption value={ProductType.SALE}>
                    Chỉ bán
                  </NativeSelectOption>
                  <NativeSelectOption value={ProductType.RENTAL}>
                    Chỉ thuê
                  </NativeSelectOption>
                  <NativeSelectOption value={ProductType.BOTH}>
                    Bán và thuê
                  </NativeSelectOption>
                </NativeSelect>
              </FieldError>
              <FieldError label="Trạng thái" error={errors.status?.message}>
                <NativeSelect {...register("status")}>
                  <NativeSelectOption value={ProductStatus.DRAFT}>
                    Nháp
                  </NativeSelectOption>
                  <NativeSelectOption value={ProductStatus.ACTIVE}>
                    Hoạt động
                  </NativeSelectOption>
                </NativeSelect>
              </FieldError>
            </div>
          </section>
        </aside>
      </div>

      <div className="fixed right-0 bottom-0 z-40 flex w-full border-t border-slate-200 bg-white/80 p-4 shadow-lg backdrop-blur-md lg:w-[calc(100%-240px)]">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-end gap-3 px-4 lg:px-10">
          <Button type="button" variant="outline" asChild>
            <Link href="/seller/products">Hủy bỏ</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting || isUploading}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  )
}

function FieldError({
  children,
  error,
  label,
}: {
  children: React.ReactNode
  error?: string
  label: string
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { ArrowLeft, ImagePlus, Loader2, Save, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import {
  ProductStatus,
  ProductType,
  RentalItemCondition,
} from "@/app/generated/prisma/enums"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  adminProductSchema,
  type AdminProductFormValues,
  type AdminProductInput,
} from "@/schemas/admin-product"

interface ProductCreateFormProps {
  categories: {
    id: number
    name: string
  }[]
  sellers: {
    id: number
    name: string
    email: string
    shopName: string | null
  }[]
  mode?: "create" | "edit"
  productId?: number
  initialData?: Partial<AdminProductInput>
}

type SelectedImageFile = {
  file: File
  previewUrl: string
}

const createSlug = (value: string): string => {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

const splitTags = (value: string): string[] => {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

const normalizeOptionalNumber = (
  value: number | undefined
): number | undefined => {
  return value === undefined || Number.isNaN(value) ? undefined : value
}

const optionalNumberRegister = {
  setValueAs: (value: string) => (value === "" ? undefined : Number(value)),
}

export const ProductCreateForm = ({
  categories,
  sellers,
  mode = "create",
  productId,
  initialData,
}: ProductCreateFormProps) => {
  const router = useRouter()
  const [imageUrls, setImageUrls] = useState<string[]>(
    initialData?.imageUrls ?? []
  )
  const [imageFiles, setImageFiles] = useState<SelectedImageFile[]>([])
  const imageFilesRef = useRef<SelectedImageFile[]>([])
  const [tagsText, setTagsText] = useState(initialData?.tags?.join(", ") ?? "")

  const defaultSellerId = initialData?.sellerId ?? sellers[0]?.id ?? 0
  const defaultCategoryId = initialData?.categoryId ?? categories[0]?.id ?? 0
  const isEditMode = mode === "edit"

  const {
    formState: { errors },
    handleSubmit,
    control,
    register,
    setValue,
  } = useForm<AdminProductFormValues, unknown, AdminProductInput>({
    resolver: zodResolver(adminProductSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      sellerId: defaultSellerId,
      categoryId: defaultCategoryId,
      description: initialData?.description ?? "",
      shortDescription: initialData?.shortDescription ?? "",
      price: initialData?.price ?? 0,
      comparePrice: initialData?.comparePrice,
      sku: initialData?.sku ?? "",
      type: initialData?.type ?? ProductType.SALE,
      status: initialData?.status ?? ProductStatus.DRAFT,
      tags: initialData?.tags ?? [],
      imageUrls: initialData?.imageUrls ?? [],
      variantName: initialData?.variantName ?? "Mặc định",
      variantSku: initialData?.variantSku ?? "",
      stock: initialData?.stock ?? 0,
      rentalPricePerDay: initialData?.rentalPricePerDay,
      rentalDepositAmount: initialData?.rentalDepositAmount,
      rentalMinDays: initialData?.rentalMinDays ?? 1,
      rentalMaxDays: initialData?.rentalMaxDays,
      rentalCondition:
        initialData?.rentalCondition ?? RentalItemCondition.EXCELLENT,
    },
  })

  const productType = useWatch({ control, name: "type" })
  const productName = useWatch({ control, name: "name" })
  const sellerId = useWatch({ control, name: "sellerId" })
  const categoryId = useWatch({ control, name: "categoryId" })
  const productStatus = useWatch({ control, name: "status" })
  const rentalCondition = useWatch({ control, name: "rentalCondition" })
  const isRentalEnabled =
    productType === ProductType.RENTAL || productType === ProductType.BOTH

  useEffect(() => {
    return () => {
      imageFilesRef.current.forEach((item) =>
        URL.revokeObjectURL(item.previewUrl)
      )
    }
  }, [])

  const uploadImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return []

    const formData = new FormData()
    imageFiles.forEach((item) => formData.append("files", item.file))

    const res = await fetch("/api/admin/product-images", {
      method: "POST",
      body: formData,
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? "Không thể tải ảnh lên")
    return json.data.urls as string[]
  }

  const mutation = useMutation({
    mutationFn: async (data: AdminProductInput) => {
      const uploadedUrls = await uploadImages()
      const payload = {
        ...data,
        imageUrls: [...imageUrls, ...uploadedUrls],
      }
      const res = await fetch(
        isEditMode ? `/api/admin/products/${productId}` : "/api/admin/products",
        {
          method: isEditMode ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )
      const json = await res.json()
      if (!res.ok) {
        throw new Error(
          json.error ??
            (isEditMode
              ? "Không thể cập nhật sản phẩm"
              : "Không thể tạo sản phẩm")
        )
      }
      return json.data as { id: number }
    },
    onSuccess: () => {
      toast.success(isEditMode ? "Đã cập nhật sản phẩm" : "Đã thêm sản phẩm")
      router.push("/admin/products")
      router.refresh()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const selectedSeller = sellers.find((item) => item.id === sellerId)
  const selectedSellerLabel =
    selectedSeller?.shopName ?? selectedSeller?.name ?? "Chọn seller"

  const handleGenerateSlug = () => {
    setValue("slug", createSlug(productName), { shouldValidate: true })
  }

  const handleImageFilesChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files ?? [])
    setImageFiles((current) => {
      const next = [
        ...current,
        ...files.map((file) => ({
          file,
          previewUrl: URL.createObjectURL(file),
        })),
      ]
      imageFilesRef.current = next
      return next
    })
    event.target.value = ""
  }

  const handleRemoveExistingImage = (url: string) => {
    setImageUrls((current) => current.filter((item) => item !== url))
  }

  const handleRemoveNewImage = (imageFile: SelectedImageFile) => {
    URL.revokeObjectURL(imageFile.previewUrl)
    setImageFiles((current) => {
      const next = current.filter((item) => item !== imageFile)
      imageFilesRef.current = next
      return next
    })
  }

  const handleFormSubmit = (data: AdminProductInput) => {
    mutation.mutate({
      ...data,
      comparePrice: normalizeOptionalNumber(data.comparePrice),
      rentalPricePerDay: normalizeOptionalNumber(data.rentalPricePerDay),
      rentalDepositAmount: normalizeOptionalNumber(data.rentalDepositAmount),
      rentalMaxDays: normalizeOptionalNumber(data.rentalMaxDays),
      tags: splitTags(tagsText),
      imageUrls,
    })
  }

  if (categories.length === 0 || sellers.length === 0) {
    return (
      <Card className="border-border/60">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            Cần có ít nhất một seller và một danh mục trước khi thêm sản phẩm.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEditMode ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEditMode
                ? "Cập nhật thông tin, ảnh, tồn kho và cấu hình thuê."
                : "Tạo sản phẩm mới, biến thể mặc định và cấu hình thuê nếu cần."}
            </p>
          </div>
        </div>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isEditMode ? "Cập nhật" : "Lưu sản phẩm"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên sản phẩm</Label>
                  <Input
                    id="name"
                    aria-invalid={!!errors.name}
                    placeholder="VD: Nezuko Kamado"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <div className="flex gap-2">
                    <Input
                      id="slug"
                      aria-invalid={!!errors.slug}
                      placeholder="nezuko-kamado"
                      {...register("slug")}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGenerateSlug}
                    >
                      Tạo
                    </Button>
                  </div>
                  {errors.slug && (
                    <p className="text-xs text-destructive">
                      {errors.slug.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Seller</Label>
                  <Select
                    value={String(sellerId)}
                    onValueChange={(value) =>
                      setValue("sellerId", Number(value), {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>{selectedSellerLabel}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {sellers.map((seller) => (
                        <SelectItem key={seller.id} value={String(seller.id)}>
                          {seller.shopName ?? seller.name} - {seller.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.sellerId && (
                    <p className="text-xs text-destructive">
                      {errors.sellerId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Danh mục</Label>
                  <Select
                    value={String(categoryId)}
                    onValueChange={(value) =>
                      setValue("categoryId", Number(value), {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={String(category.id)}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && (
                    <p className="text-xs text-destructive">
                      {errors.categoryId.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Mô tả ngắn</Label>
                <Input
                  id="shortDescription"
                  aria-invalid={!!errors.shortDescription}
                  placeholder="Tóm tắt ngắn hiển thị trên danh sách"
                  {...register("shortDescription")}
                />
                {errors.shortDescription && (
                  <p className="text-xs text-destructive">
                    {errors.shortDescription.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả chi tiết</Label>
                <Textarea
                  id="description"
                  className="min-h-32"
                  placeholder="Chất liệu, phụ kiện đi kèm, lưu ý bảo quản..."
                  {...register("description")}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Giá và tồn kho</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="price">Giá bán</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    aria-invalid={!!errors.price}
                    {...register("price", { valueAsNumber: true })}
                  />
                  {errors.price && (
                    <p className="text-xs text-destructive">
                      {errors.price.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comparePrice">Giá gạch</Label>
                  <Input
                    id="comparePrice"
                    type="number"
                    min="0"
                    aria-invalid={!!errors.comparePrice}
                    {...register("comparePrice", optionalNumberRegister)}
                  />
                  {errors.comparePrice && (
                    <p className="text-xs text-destructive">
                      {errors.comparePrice.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Tồn kho</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    aria-invalid={!!errors.stock}
                    {...register("stock", { valueAsNumber: true })}
                  />
                  {errors.stock && (
                    <p className="text-xs text-destructive">
                      {errors.stock.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU sản phẩm</Label>
                  <Input id="sku" placeholder="SP-001" {...register("sku")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="variantName">Tên biến thể</Label>
                  <Input
                    id="variantName"
                    aria-invalid={!!errors.variantName}
                    {...register("variantName")}
                  />
                  {errors.variantName && (
                    <p className="text-xs text-destructive">
                      {errors.variantName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="variantSku">SKU biến thể</Label>
                  <Input
                    id="variantSku"
                    placeholder="SP-001-DEFAULT"
                    {...register("variantSku")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {isRentalEnabled && (
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle>Cấu hình thuê</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="rentalPricePerDay">Giá thuê/ngày</Label>
                    <Input
                      id="rentalPricePerDay"
                      type="number"
                      min="0"
                      aria-invalid={!!errors.rentalPricePerDay}
                      {...register("rentalPricePerDay", optionalNumberRegister)}
                    />
                    {errors.rentalPricePerDay && (
                      <p className="text-xs text-destructive">
                        {errors.rentalPricePerDay.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rentalDepositAmount">Tiền cọc</Label>
                    <Input
                      id="rentalDepositAmount"
                      type="number"
                      min="0"
                      aria-invalid={!!errors.rentalDepositAmount}
                      {...register(
                        "rentalDepositAmount",
                        optionalNumberRegister
                      )}
                    />
                    {errors.rentalDepositAmount && (
                      <p className="text-xs text-destructive">
                        {errors.rentalDepositAmount.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="rentalMinDays">Số ngày tối thiểu</Label>
                    <Input
                      id="rentalMinDays"
                      type="number"
                      min="1"
                      {...register("rentalMinDays", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rentalMaxDays">Số ngày tối đa</Label>
                    <Input
                      id="rentalMaxDays"
                      type="number"
                      min="1"
                      aria-invalid={!!errors.rentalMaxDays}
                      {...register("rentalMaxDays", optionalNumberRegister)}
                    />
                    {errors.rentalMaxDays && (
                      <p className="text-xs text-destructive">
                        {errors.rentalMaxDays.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Tình trạng</Label>
                    <Select
                      value={rentalCondition}
                      onValueChange={(value) =>
                        setValue(
                          "rentalCondition",
                          value as RentalItemCondition,
                          { shouldValidate: true }
                        )
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn tình trạng" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={RentalItemCondition.EXCELLENT}>
                          Rất tốt
                        </SelectItem>
                        <SelectItem value={RentalItemCondition.GOOD}>
                          Tốt
                        </SelectItem>
                        <SelectItem value={RentalItemCondition.FAIR}>
                          Đã qua sử dụng
                        </SelectItem>
                        <SelectItem value={RentalItemCondition.DAMAGED}>
                          Có hư hại
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Trạng thái</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Loại sản phẩm</Label>
                <Select
                  value={productType}
                  onValueChange={(value) =>
                    setValue("type", value as ProductType, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ProductType.SALE}>Bán</SelectItem>
                    <SelectItem value={ProductType.RENTAL}>Cho thuê</SelectItem>
                    <SelectItem value={ProductType.BOTH}>
                      Bán và thuê
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Hiển thị</Label>
                <Select
                  value={productStatus}
                  onValueChange={(value) =>
                    setValue("status", value as ProductStatus, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ProductStatus.DRAFT}>Nháp</SelectItem>
                    <SelectItem value={ProductStatus.ACTIVE}>
                      Đang bán
                    </SelectItem>
                    <SelectItem value={ProductStatus.OUT_OF_STOCK}>
                      Hết hàng
                    </SelectItem>
                    <SelectItem value={ProductStatus.DISCONTINUED}>
                      Ngừng bán
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Ảnh và tag</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productImages">Hình ảnh sản phẩm</Label>
                <label
                  htmlFor="productImages"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center transition-colors hover:bg-muted"
                >
                  <ImagePlus className="mb-2 h-6 w-6 text-muted-foreground" />
                  <span className="text-sm font-medium">Chọn ảnh từ máy</span>
                  <span className="text-xs text-muted-foreground">
                    PNG, JPG, WEBP. Mỗi ảnh tối đa 5MB.
                  </span>
                </label>
                <Input
                  id="productImages"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageFilesChange}
                />
                {errors.imageUrls && (
                  <p className="text-xs text-destructive">
                    {errors.imageUrls.message}
                  </p>
                )}
              </div>

              {(imageUrls.length > 0 || imageFiles.length > 0) && (
                <div className="grid grid-cols-2 gap-3">
                  {imageUrls.map((url) => (
                    <div
                      key={url}
                      className="group relative overflow-hidden rounded-lg border border-border"
                    >
                      <Image
                        src={url}
                        alt="Ảnh sản phẩm"
                        width={160}
                        height={160}
                        className="aspect-square w-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon-sm"
                        className="absolute top-1 right-1 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => handleRemoveExistingImage(url)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                  {imageFiles.map((imageFile) => (
                    <div
                      key={imageFile.previewUrl}
                      className="group relative overflow-hidden rounded-lg border border-border"
                    >
                      <Image
                        src={imageFile.previewUrl}
                        alt={imageFile.file.name}
                        width={160}
                        height={160}
                        unoptimized
                        className="aspect-square w-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon-sm"
                        className="absolute top-1 right-1 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => handleRemoveNewImage(imageFile)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="tags">Tag</Label>
                <Input
                  id="tags"
                  placeholder="anime, kimono, demon slayer"
                  value={tagsText}
                  onChange={(event) => setTagsText(event.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}

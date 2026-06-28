"use client"

import { RentalItemCondition, ProductType } from "@/app/generated/prisma/enums"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"
import type { SellerProductFormValues } from "@/schemas/seller-product"
import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form"
import { productConditionOptions } from "./product-form-utils"
import type { SellerProductCategory } from "./product-types"

type ProductFieldProps = {
  errors: FieldErrors<SellerProductFormValues>
  register: UseFormRegister<SellerProductFormValues>
}

export function ProductBasicFields({
  categories,
  errors,
  register,
}: ProductFieldProps & {
  categories: SellerProductCategory[]
}) {
  return (
    <FieldGroup>
      <div className="grid gap-4 md:grid-cols-2">
        <ProductField label="Tên sản phẩm *" error={errors.name?.message}>
          <Input
            aria-invalid={!!errors.name}
            placeholder="VD: Set Hầu Gái Maid Cosplay"
            {...register("name")}
          />
        </ProductField>
        <ProductField label="Slug *" error={errors.slug?.message}>
          <Input
            aria-invalid={!!errors.slug}
            placeholder="set-hau-gai-maid"
            {...register("slug")}
          />
        </ProductField>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <ProductField label="SKU" error={errors.sku?.message}>
          <Input
            aria-invalid={!!errors.sku}
            placeholder="SP-001"
            {...register("sku")}
          />
        </ProductField>
        <ProductField label="Danh mục *" error={errors.categoryId?.message}>
          <NativeSelect
            aria-invalid={!!errors.categoryId}
            {...register("categoryId")}
          >
            {categories.map((category) => (
              <NativeSelectOption key={category.id} value={String(category.id)}>
                {category.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </ProductField>
        <ProductField label="Tình trạng" error={errors.condition?.message}>
          <NativeSelect
            aria-invalid={!!errors.condition}
            {...register("condition")}
          >
            {productConditionOptions.map((condition) => (
              <NativeSelectOption key={condition} value={condition}>
                {condition}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </ProductField>
      </div>

      <ProductField
        label="Mô tả ngắn"
        description="Dòng này xuất hiện trong danh sách sản phẩm, nên viết ngắn và rõ."
        error={errors.shortDescription?.message}
      >
        <Input
          aria-invalid={!!errors.shortDescription}
          placeholder="Tối đa 180 ký tự, hiển thị ở danh sách"
          {...register("shortDescription")}
        />
      </ProductField>

      <ProductField label="Mô tả chi tiết" error={errors.description?.message}>
        <Textarea
          aria-invalid={!!errors.description}
          className="min-h-36"
          placeholder="Chất liệu, form dáng, phụ kiện, lưu ý bảo quản..."
          {...register("description")}
        />
      </ProductField>
    </FieldGroup>
  )
}

export function ProductPricingFields({
  errors,
  pricePreview,
  register,
}: ProductFieldProps & {
  pricePreview: string | null
}) {
  return (
    <FieldGroup>
      <div className="grid gap-4 md:grid-cols-2">
        <ProductField label="Giá bán *" error={errors.price?.message}>
          <Input
            aria-invalid={!!errors.price}
            type="number"
            min={0}
            {...register("price")}
          />
        </ProductField>
        <ProductField label="Giá so sánh" error={errors.comparePrice?.message}>
          <Input
            aria-invalid={!!errors.comparePrice}
            type="number"
            min={0}
            {...register("comparePrice")}
          />
        </ProductField>
      </div>
      {pricePreview && (
        <p className="text-sm font-medium text-muted-foreground">
          Giá hiển thị: {pricePreview}
        </p>
      )}
    </FieldGroup>
  )
}

export function ProductRentalFields({ errors, register }: ProductFieldProps) {
  return (
    <FieldGroup>
      <div className="grid gap-4 md:grid-cols-2">
        <ProductField
          label="Giá thuê/ngày *"
          error={errors.rentalPricePerDay?.message}
        >
          <Input
            aria-invalid={!!errors.rentalPricePerDay}
            type="number"
            min={0}
            {...register("rentalPricePerDay")}
          />
        </ProductField>
        <ProductField
          label="Tiền cọc *"
          description="Khoản này được giữ để xử lý hư hỏng hoặc quá hạn."
          error={errors.rentalDepositAmount?.message}
        >
          <Input
            aria-invalid={!!errors.rentalDepositAmount}
            type="number"
            min={0}
            {...register("rentalDepositAmount")}
          />
        </ProductField>
        <ProductField
          label="Số ngày tối thiểu"
          error={errors.rentalMinDays?.message}
        >
          <Input
            aria-invalid={!!errors.rentalMinDays}
            type="number"
            min={1}
            {...register("rentalMinDays")}
          />
        </ProductField>
        <ProductField
          label="Số ngày tối đa"
          error={errors.rentalMaxDays?.message}
        >
          <Input
            aria-invalid={!!errors.rentalMaxDays}
            type="number"
            min={1}
            {...register("rentalMaxDays")}
          />
        </ProductField>
        <ProductField
          label="Tình trạng đồ thuê"
          error={errors.rentalCondition?.message}
        >
          <NativeSelect
            aria-invalid={!!errors.rentalCondition}
            {...register("rentalCondition")}
          >
            {Object.values(RentalItemCondition).map((condition) => (
              <NativeSelectOption key={condition} value={condition}>
                {condition}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </ProductField>
      </div>
      <ProductField
        label="Phụ kiện bao gồm"
        error={errors.rentalAccessories?.message}
      >
        <Textarea
          aria-invalid={!!errors.rentalAccessories}
          placeholder="VD: 1 váy chính, 1 tạp dề, 1 nơ cổ, 1 wig..."
          {...register("rentalAccessories")}
        />
      </ProductField>
    </FieldGroup>
  )
}

export function ProductVisibilityFields({
  errors,
  register,
}: ProductFieldProps & {
  setValue: UseFormSetValue<SellerProductFormValues>
}) {
  return (
    <FieldGroup>
      <ProductField
        label="Loại sản phẩm"
        description="Chọn đúng mô hình để hệ thống bật phần giá thuê hoặc giá bán."
        error={errors.type?.message}
      >
        <NativeSelect aria-invalid={!!errors.type} {...register("type")}>
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
      </ProductField>
      <div className="rounded-lg border border-border/70 bg-muted/35 p-3 text-sm text-muted-foreground">
        Sau khi lưu, sản phẩm sẽ chuyển sang trạng thái chờ admin duyệt trước
        khi hiển thị trên marketplace.
      </div>
    </FieldGroup>
  )
}

export function ProductField({
  children,
  description,
  error,
  label,
}: {
  children: React.ReactNode
  description?: string
  error?: string
  label: string
}) {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel>{label}</FieldLabel>
      {children}
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError>{error}</FieldError>
    </Field>
  )
}

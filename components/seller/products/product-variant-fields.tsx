"use client"

import { Plus, Trash2 } from "lucide-react"
import type {
  FieldArrayWithId,
  FieldErrors,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormRegister,
} from "react-hook-form"

import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { SellerProductFormValues } from "@/schemas/seller-product"
import { ProductField } from "./product-form-fields"

type ProductVariantFieldsProps = {
  errors: FieldErrors<SellerProductFormValues>
  fields: FieldArrayWithId<SellerProductFormValues, "variants", "id">[]
  onAppend: UseFieldArrayAppend<SellerProductFormValues, "variants">
  onRemove: UseFieldArrayRemove
  register: UseFormRegister<SellerProductFormValues>
}

export function ProductVariantFields({
  errors,
  fields,
  onAppend,
  onRemove,
  register,
}: ProductVariantFieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Size và tồn kho
          </h2>
          <p className="text-sm text-muted-foreground">
            Mỗi size là một biến thể riêng để checkout luôn có variant.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => onAppend({ size: "", sku: "", stock: 0 })}
        >
          <Plus data-icon="inline-start" />
          Thêm size
        </Button>
      </div>

      <FieldGroup>
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 md:grid-cols-[1fr_1fr_120px_auto]"
          >
            <ProductField
              label="Size"
              error={errors.variants?.[index]?.size?.message}
            >
              <Input
                aria-invalid={!!errors.variants?.[index]?.size}
                placeholder="S, M, L, Free-size"
                {...register(`variants.${index}.size`)}
              />
            </ProductField>
            <ProductField
              label="SKU biến thể"
              error={errors.variants?.[index]?.sku?.message}
            >
              <Input
                aria-invalid={!!errors.variants?.[index]?.sku}
                placeholder="SP-001-M"
                {...register(`variants.${index}.sku`)}
              />
            </ProductField>
            <ProductField
              label="Tồn kho"
              error={errors.variants?.[index]?.stock?.message}
            >
              <Input
                aria-invalid={!!errors.variants?.[index]?.stock}
                type="number"
                min={0}
                {...register(`variants.${index}.stock`)}
              />
            </ProductField>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="self-end text-destructive"
              disabled={fields.length === 1}
              onClick={() => onRemove(index)}
              aria-label="Xóa size"
            >
              <Trash2 />
            </Button>
          </div>
        ))}
      </FieldGroup>
    </div>
  )
}

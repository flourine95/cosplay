import { z } from "zod"
import {
  ProductStatus,
  ProductType,
  RentalItemCondition,
} from "@/app/generated/prisma/enums"

const imageUrlSchema = z.union([
  z.url({ error: "URL ảnh không hợp lệ" }),
  z.string().regex(/^\/[A-Za-z0-9/_\-.]+$/, {
    error: "Đường dẫn ảnh không hợp lệ",
  }),
])

const optionalPriceSchema = z.coerce
  .number({ error: "Giá phải là số" })
  .nonnegative({ error: "Giá không được âm" })
  .optional()

// Mỗi size là một biến thể (ProductVariant) riêng, có tồn kho riêng.
const variantSchema = z.object({
  size: z.string().min(1, { error: "Tên size là bắt buộc" }),
  sku: z.string().optional(),
  stock: z.coerce
    .number({ error: "Tồn kho phải là số" })
    .int({ error: "Tồn kho phải là số nguyên" })
    .min(0, { error: "Tồn kho không được âm" }),
})

export const sellerProductSchema = z
  .object({
    name: z.string().min(2, { error: "Tên sản phẩm phải có ít nhất 2 ký tự" }),
    slug: z.string().optional(),
    categoryId: z.coerce
      .number({ error: "Vui lòng chọn danh mục" })
      .int({ error: "Danh mục không hợp lệ" })
      .positive({ error: "Vui lòng chọn danh mục" }),
    description: z.string().optional(),
    shortDescription: z
      .string()
      .max(180, { error: "Mô tả ngắn tối đa 180 ký tự" })
      .optional(),
    condition: z.string().optional(),
    price: z.coerce
      .number({ error: "Giá bán phải là số" })
      .positive({ error: "Giá bán phải lớn hơn 0" }),
    comparePrice: optionalPriceSchema,
    sku: z.string().optional(),
    // Chỉ Bán / Thuê / Cả hai — KHÔNG có may đo (may đo đi theo luồng CustomOrder riêng)
    type: z.enum([ProductType.SALE, ProductType.RENTAL, ProductType.BOTH], {
      error: "Loại sản phẩm không hợp lệ",
    }),
    status: z
      .enum([ProductStatus.DRAFT, ProductStatus.ACTIVE], {
        error: "Trạng thái không hợp lệ",
      })
      .default(ProductStatus.DRAFT),
    tags: z.array(z.string()).default([]),
    imageUrls: z
      .array(imageUrlSchema)
      .min(1, { error: "Vui lòng tải lên ít nhất một ảnh" }),
    variants: z
      .array(variantSchema)
      .min(1, { error: "Vui lòng thêm ít nhất một size" }),
    // Cấu hình cho thuê (bắt buộc khi type là RENTAL hoặc BOTH)
    rentalPricePerDay: optionalPriceSchema,
    rentalDepositAmount: optionalPriceSchema,
    rentalAccessories: z.string().optional(),
    rentalMinDays: z.coerce
      .number({ error: "Số ngày thuê tối thiểu phải là số" })
      .int({ error: "Số ngày thuê tối thiểu phải là số nguyên" })
      .positive({ error: "Số ngày thuê tối thiểu phải lớn hơn 0" })
      .default(1),
    rentalMaxDays: z.coerce
      .number({ error: "Số ngày thuê tối đa phải là số" })
      .int({ error: "Số ngày thuê tối đa phải là số nguyên" })
      .positive({ error: "Số ngày thuê tối đa phải lớn hơn 0" })
      .optional(),
    rentalCondition: z
      .enum(RentalItemCondition, { error: "Tình trạng đồ thuê không hợp lệ" })
      .default(RentalItemCondition.EXCELLENT),
  })
  .refine(
    (data) => data.type === ProductType.SALE || data.rentalPricePerDay != null,
    {
      message: "Sản phẩm cho thuê cần có giá thuê/ngày",
      path: ["rentalPricePerDay"],
    }
  )
  .refine(
    (data) => !data.rentalMaxDays || data.rentalMaxDays >= data.rentalMinDays,
    {
      message: "Số ngày thuê tối đa phải lớn hơn hoặc bằng tối thiểu",
      path: ["rentalMaxDays"],
    }
  )

export type SellerProductInput = z.infer<typeof sellerProductSchema>
export type SellerProductFormValues = z.input<typeof sellerProductSchema>

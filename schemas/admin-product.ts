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

export const adminProductSchema = z
  .object({
    name: z.string().min(2, { error: "Tên sản phẩm phải có ít nhất 2 ký tự" }),
    slug: z
      .string()
      .min(2, { error: "Slug phải có ít nhất 2 ký tự" })
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        error: "Slug chỉ gồm chữ thường, số và dấu gạch ngang",
      }),
    sellerId: z.coerce
      .number({ error: "Vui lòng chọn seller" })
      .int({ error: "Seller không hợp lệ" })
      .positive({ error: "Vui lòng chọn seller" }),
    categoryId: z.coerce
      .number({ error: "Vui lòng chọn danh mục" })
      .int({ error: "Danh mục không hợp lệ" })
      .positive({ error: "Vui lòng chọn danh mục" }),
    description: z.string().optional(),
    shortDescription: z
      .string()
      .max(180, {
        error: "Mô tả ngắn tối đa 180 ký tự",
      })
      .optional(),
    price: z.coerce
      .number({ error: "Giá bán phải là số" })
      .positive({ error: "Giá bán phải lớn hơn 0" }),
    comparePrice: optionalPriceSchema,
    sku: z.string().optional(),
    type: z.enum(ProductType, { error: "Loại sản phẩm không hợp lệ" }),
    status: z.enum(ProductStatus, { error: "Trạng thái không hợp lệ" }),
    tags: z.array(z.string()).default([]),
    imageUrls: z.array(imageUrlSchema).default([]),
    variantName: z.string().min(1, { error: "Tên biến thể là bắt buộc" }),
    variantSku: z.string().optional(),
    stock: z.coerce
      .number({ error: "Tồn kho phải là số" })
      .int({ error: "Tồn kho phải là số nguyên" })
      .min(0, { error: "Tồn kho không được âm" }),
    rentalPricePerDay: optionalPriceSchema,
    rentalDepositAmount: optionalPriceSchema,
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
    (data) =>
      data.type === ProductType.SALE ||
      (data.rentalPricePerDay && data.rentalDepositAmount),
    {
      message: "Sản phẩm cho thuê cần có giá thuê/ngày và tiền cọc",
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

export type AdminProductInput = z.infer<typeof adminProductSchema>
export type AdminProductFormValues = z.input<typeof adminProductSchema>

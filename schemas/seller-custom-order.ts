import { z } from "zod"
import { CustomOrderStatus } from "@/app/generated/prisma/enums"

export const sellerCustomQuoteSchema = z.object({
  quotedPrice: z.coerce
    .number({ error: "Giá báo phải là số" })
    .positive({ error: "Giá báo phải lớn hơn 0" }),
  depositAmount: z.coerce
    .number({ error: "Tiền cọc phải là số" })
    .nonnegative({ error: "Tiền cọc không được âm" }),
  estimatedDays: z.coerce
    .number({ error: "Số ngày dự kiến phải là số" })
    .int({ error: "Số ngày dự kiến phải là số nguyên" })
    .positive({ error: "Số ngày dự kiến phải lớn hơn 0" }),
  description: z
    .string()
    .max(1000, { error: "Mô tả tối đa 1000 ký tự" })
    .optional(),
})

export const sellerCustomProgressSchema = z.object({
  title: z.string().min(2, { error: "Tiêu đề tiến độ là bắt buộc" }),
  description: z.string().min(2, { error: "Mô tả tiến độ là bắt buộc" }),
  progressPercent: z.coerce
    .number({ error: "Tiến độ phải là số" })
    .int({ error: "Tiến độ phải là số nguyên" })
    .min(0, { error: "Tiến độ không được âm" })
    .max(100, { error: "Tiến độ tối đa là 100%" }),
  images: z.array(z.string()).default([]),
  videos: z.array(z.string()).default([]),
  status: z
    .enum([CustomOrderStatus.IN_PROGRESS, CustomOrderStatus.READY], {
      error: "Trạng thái tiến độ không hợp lệ",
    })
    .optional(),
})

export const sellerCustomRevisionResponseSchema = z.object({
  sellerResponse: z
    .string()
    .min(2, { error: "Phản hồi là bắt buộc" })
    .max(1000, { error: "Phản hồi tối đa 1000 ký tự" }),
})

export type SellerCustomQuoteInput = z.infer<typeof sellerCustomQuoteSchema>
export type SellerCustomProgressInput = z.infer<
  typeof sellerCustomProgressSchema
>
export type SellerCustomRevisionResponseInput = z.infer<
  typeof sellerCustomRevisionResponseSchema
>

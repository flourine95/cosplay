import { z } from "zod"
import { ReturnReason, ReturnStatus } from "@/app/generated/prisma/enums"

const evidenceUrlSchema = z
  .string()
  .trim()
  .url({ error: "Link bằng chứng không hợp lệ" })
  .max(500, { error: "Link bằng chứng quá dài" })

export const createReturnRequestSchema = z.object({
  orderNumber: z.string().trim().min(1, { error: "Thiếu mã đơn hàng" }),
  reason: z.enum(ReturnReason, { error: "Lý do không hợp lệ" }),
  description: z
    .string()
    .trim()
    .min(10, { error: "Mô tả cần ít nhất 10 ký tự" })
    .max(1000, { error: "Mô tả tối đa 1000 ký tự" }),
  images: z.array(evidenceUrlSchema).max(5).default([]),
  videos: z.array(evidenceUrlSchema).max(3).default([]),
})

export const adminUpdateReturnRequestSchema = z.object({
  status: z.enum(ReturnStatus, { error: "Trạng thái yêu cầu không hợp lệ" }),
  adminNote: z.string().trim().max(1000).optional(),
  refundAmount: z.coerce.number().positive().optional(),
})

export type CreateReturnRequestInput = z.infer<typeof createReturnRequestSchema>
export type AdminUpdateReturnRequestInput = z.infer<
  typeof adminUpdateReturnRequestSchema
>

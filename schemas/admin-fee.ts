import { z } from "zod"

export const adminFeeSchema = z.object({
  name: z
    .string()
    .min(2, { error: "Tên phí phải có ít nhất 2 ký tự" })
    .max(80, { error: "Tên phí tối đa 80 ký tự" })
    .regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/, {
      error: "Mã phí chỉ gồm chữ thường, số và dấu gạch dưới",
    }),
  description: z
    .string()
    .max(240, { error: "Mô tả tối đa 240 ký tự" })
    .optional(),
  feeType: z.enum(["percentage", "fixed"], {
    error: "Loại phí không hợp lệ",
  }),
  feeValue: z.coerce
    .number({ error: "Giá trị phí phải là số" })
    .nonnegative({ error: "Giá trị phí không được âm" }),
  isActive: z.boolean().default(true),
})

export type AdminFeeInput = z.infer<typeof adminFeeSchema>
export type AdminFeeFormValues = z.input<typeof adminFeeSchema>

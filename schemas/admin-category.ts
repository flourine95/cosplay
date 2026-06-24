import { z } from "zod"

export const adminCategorySchema = z.object({
  name: z
    .string()
    .min(2, { error: "Tên danh mục phải có ít nhất 2 ký tự" })
    .max(80, { error: "Tên danh mục tối đa 80 ký tự" }),
  slug: z
    .string()
    .min(2, { error: "Slug phải có ít nhất 2 ký tự" })
    .max(100, { error: "Slug tối đa 100 ký tự" })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      error: "Slug chỉ gồm chữ thường, số và dấu gạch ngang",
    }),
  description: z
    .string()
    .max(240, { error: "Mô tả tối đa 240 ký tự" })
    .optional(),
  parentId: z.coerce
    .number({ error: "Danh mục cha không hợp lệ" })
    .int({ error: "Danh mục cha không hợp lệ" })
    .positive({ error: "Danh mục cha không hợp lệ" })
    .optional(),
  order: z.coerce
    .number({ error: "Thứ tự phải là số" })
    .int({ error: "Thứ tự phải là số nguyên" })
    .min(0, { error: "Thứ tự không được âm" })
    .default(0),
  isActive: z.boolean().default(true),
})

export type AdminCategoryInput = z.infer<typeof adminCategorySchema>
export type AdminCategoryFormValues = z.input<typeof adminCategorySchema>

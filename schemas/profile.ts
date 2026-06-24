import { z } from "zod"

export const savedAddressSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, { error: "Vui lòng nhập tên người nhận" }),
  phone: z.string().trim().min(1, { error: "Vui lòng nhập số điện thoại" }),
  address: z.string().trim().min(1, { error: "Vui lòng nhập địa chỉ" }),
  city: z.string().trim().optional(),
  district: z.string().trim().optional(),
  ward: z.string().trim().optional(),
  isDefault: z.boolean().optional(),
})

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2, { error: "Tên phải có ít nhất 2 ký tự" }),
  email: z.email({ error: "Email không hợp lệ" }),
  phone: z.string().trim().optional(),
  avatar: z.string().trim().optional(),
  defaultAddress: savedAddressSchema.optional(),
})

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type SavedAddressInput = z.infer<typeof savedAddressSchema>

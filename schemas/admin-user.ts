import { z } from "zod"
import { UserRole, UserStatus } from "@/app/generated/prisma/enums"

export const adminUserCreateSchema = z.object({
  name: z.string().min(2, { error: "Tên phải có ít nhất 2 ký tự" }),
  email: z.email({ error: "Email không hợp lệ" }),
  password: z.string().min(8, { error: "Mật khẩu phải có ít nhất 8 ký tự" }),
  phone: z.string().optional(),
  role: z.enum(UserRole, { error: "Vai trò không hợp lệ" }),
  status: z.enum(UserStatus, { error: "Trạng thái không hợp lệ" }),
})

export const adminUserUpdateSchema = z.object({
  name: z.string().min(2, { error: "Tên phải có ít nhất 2 ký tự" }),
  email: z.email({ error: "Email không hợp lệ" }),
  phone: z.string().optional(),
  role: z.enum(UserRole, { error: "Vai trò không hợp lệ" }),
  status: z.enum(UserStatus, { error: "Trạng thái không hợp lệ" }),
})

export type AdminUserCreateInput = z.infer<typeof adminUserCreateSchema>
export type AdminUserUpdateInput = z.infer<typeof adminUserUpdateSchema>

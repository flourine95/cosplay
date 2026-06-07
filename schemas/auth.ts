import { z } from "zod"

export const loginSchema = z.object({
  email: z.email({ error: "Email không hợp lệ" }),
  password: z.string().min(1, { error: "Vui lòng nhập mật khẩu" }),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, { error: "Tên phải có ít nhất 2 ký tự" }),
    email: z.email({ error: "Email không hợp lệ" }),
    password: z
      .string()
      .min(8, { error: "Mật khẩu phải có ít nhất 8 ký tự" })
      .regex(/[A-Z]/, { error: "Mật khẩu phải chứa ít nhất 1 chữ hoa" })
      .regex(/[0-9]/, { error: "Mật khẩu phải chứa ít nhất 1 số" }),
    confirmPassword: z.string().min(1, { error: "Vui lòng xác nhận mật khẩu" }),
    role: z.enum(["CUSTOMER", "SELLER"], {
      error: "Vui lòng chọn loại tài khoản",
    }),
    agreed: z.boolean().refine((value) => value, {
      message: "Vui lòng đồng ý với điều khoản sử dụng",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  })

export const forgotPasswordSchema = z.object({
  email: z.email({ error: "Email không hợp lệ" }),
})

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, { error: "Token đặt lại mật khẩu không hợp lệ" }),
    password: z
      .string()
      .min(8, { error: "Mật khẩu phải có ít nhất 8 ký tự" })
      .regex(/[A-Z]/, { error: "Mật khẩu phải chứa ít nhất 1 chữ hoa" })
      .regex(/[0-9]/, { error: "Mật khẩu phải chứa ít nhất 1 số" }),
    confirmPassword: z.string().min(1, { error: "Vui lòng xác nhận mật khẩu" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  })

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { error: "Vui lòng nhập mật khẩu hiện tại" }),
    newPassword: z
      .string()
      .min(8, { error: "Mật khẩu phải có ít nhất 8 ký tự" })
      .regex(/[A-Z]/, { error: "Mật khẩu phải chứa ít nhất 1 chữ hoa" })
      .regex(/[0-9]/, { error: "Mật khẩu phải chứa ít nhất 1 số" }),
    confirmPassword: z.string().min(1, { error: "Vui lòng xác nhận mật khẩu" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  })

// Infer types
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

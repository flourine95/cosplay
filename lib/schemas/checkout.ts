import { z } from "zod"

export const checkoutSchema = z.object({
  fullName: z
    .string()
    .min(1, "Họ và tên không được để trống")
    .refine(
      (val) => val.trim().split(/\s+/).length >= 2,
      "Họ và tên phải có tối thiểu 2 từ"
    ),
  email: z
    .string()
    .min(1, "Email không được để trống")
    .email("Email không đúng định dạng"),
  phone: z
    .string()
    .min(1, "Số điện thoại không được để trống")
    .regex(/^0\d{9}$/, "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0"),
  address: z.string().min(1, "Địa chỉ chi tiết không được để trống"),
  city: z.string().min(1, "Thành phố/Tỉnh không được để trống"),
  district: z.string().min(1, "Quận/Huyện không được để trống"),
  ward: z.string().min(1, "Phường/Xã không được để trống"),
  paymentMethod: z.enum(["cod", "bank_transfer", "e_wallet", "credit_card"], {
    message: "Vui lòng chọn phương thức thanh toán",
  }),
})

export type CheckoutFormData = z.infer<typeof checkoutSchema>

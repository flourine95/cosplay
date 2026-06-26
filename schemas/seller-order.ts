import { z } from "zod"
import { OrderStatus } from "@/app/generated/prisma/enums"

export const sellerOrderStatusSchema = z.object({
  status: z.enum(OrderStatus, { error: "Trạng thái đơn hàng không hợp lệ" }),
  note: z.string().max(500, { error: "Ghi chú tối đa 500 ký tự" }).optional(),
})

export type SellerOrderStatusInput = z.infer<typeof sellerOrderStatusSchema>

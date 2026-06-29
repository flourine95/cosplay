import { z } from "zod"
import { PayoutStatus } from "@/app/generated/prisma/enums"

export const adminCreatePayoutSchema = z.object({
  sellerId: z.coerce
    .number({ error: "Seller không hợp lệ" })
    .int({ error: "Seller không hợp lệ" })
    .positive({ error: "Seller không hợp lệ" }),
})

export const adminUpdatePayoutSchema = z.object({
  status: z.enum(PayoutStatus, { error: "Trạng thái payout không hợp lệ" }),
  transferProof: z.string().max(500).optional(),
  transferNote: z.string().max(500).optional(),
})

export type AdminCreatePayoutInput = z.infer<typeof adminCreatePayoutSchema>
export type AdminUpdatePayoutInput = z.infer<typeof adminUpdatePayoutSchema>

import { z } from "zod"

export const createCustomOrderSchema = z.object({
  sellerId: z.coerce.number().int().positive().optional(),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().min(10).max(2000),
  characterName: z.string().trim().max(120).optional(),
  animeName: z.string().trim().max(120).optional(),
  specialRequests: z.string().trim().max(1000).optional(),
  deadline: z.coerce.date().optional(),
  estimatedPrice: z.coerce.number().positive().optional(),
  referenceImages: z.array(z.string().trim()).max(5).default([]),
  measurement: z
    .object({
      height: z.coerce.number().positive().optional(),
      weight: z.coerce.number().positive().optional(),
      chest: z.coerce.number().positive().optional(),
      waist: z.coerce.number().positive().optional(),
      hips: z.coerce.number().positive().optional(),
      shoulder: z.coerce.number().positive().optional(),
      armLength: z.coerce.number().positive().optional(),
      legLength: z.coerce.number().positive().optional(),
      notes: z.string().trim().max(500).optional(),
    })
    .optional(),
})

export const sellerCustomOrderDecisionSchema = z.object({
  action: z.enum(["accept", "reject"]),
  note: z.string().trim().max(500).optional(),
})

export type CreateCustomOrderInput = z.infer<typeof createCustomOrderSchema>
export type SellerCustomOrderDecisionInput = z.infer<
  typeof sellerCustomOrderDecisionSchema
>

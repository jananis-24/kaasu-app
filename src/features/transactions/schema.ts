import { z } from "zod"

export const transactionSchema = z.object({
  id: z.number().int(),
  type: z.enum(["in", "out"]),
  /** Whole minor units (paise, cents). Never a float. */
  amountMinor: z.number().int().positive(),
  categoryId: z.number().int(),
  /** "2026-09-26". Dates after today are "Upcoming" and left out of totals. */
  date: z.iso.date(),
  note: z.string().max(200),
  createdAt: z.number(),
})

export type Transaction = z.infer<typeof transactionSchema>

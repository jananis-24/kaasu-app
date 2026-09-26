import { z } from "zod"
import { CATEGORY_ICONS, type CategoryIcon } from "./icons"

/** Keys match the --cat-* variables in styles/tokens/categories.css */
export const CATEGORY_COLORS = [
  "violet",
  "orange",
  "olive",
  "blue",
  "amber",
  "pink",
  "teal",
  "grey",
  "green",
  "indigo",
  "brown",
  "plum",
] as const

export const categorySchema = z.object({
  id: z.number().int(),
  type: z.enum(["in", "out"]),
  name: z.string().trim().min(1).max(30),
  icon: z.enum(Object.keys(CATEGORY_ICONS) as [CategoryIcon, ...CategoryIcon[]]),
  color: z.enum(CATEGORY_COLORS),
  /** "Other" can't be renamed or deleted: deleted categories move their entries there */
  permanent: z.boolean(),
  /** Position in lists (drag to reorder) */
  order: z.number(),
})

export type Category = z.infer<typeof categorySchema>
export type CategoryColor = Category["color"]
export type TransactionType = Category["type"]

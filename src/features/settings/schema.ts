import { z } from "zod"

export const THEMES = ["light", "dark", "system"] as const

/** Keys match the [data-accent] blocks in styles/tokens/accents.css */
export const ACCENTS = ["berry", "ocean", "teal", "leaf", "sun", "coral", "rose", "slate"] as const

export const settingsSchema = z.object({
  id: z.literal(1),
  theme: z.enum(THEMES),
  accent: z.enum(ACCENTS),
  currency: z.string().length(3),
})

export type Settings = z.infer<typeof settingsSchema>
export type Theme = Settings["theme"]
export type Accent = Settings["accent"]

export const DEFAULT_SETTINGS: Settings = {
  id: 1,
  theme: "system",
  accent: "berry",
  currency: "INR",
}

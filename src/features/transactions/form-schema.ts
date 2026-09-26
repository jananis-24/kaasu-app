import { z } from "zod"
import { currencySymbol } from "@/lib/money"

const MAX_AMOUNT = 1_000_000_000

/** Form fields are strings/nullable while typing; this turns them into valid values. */
export function transactionFormSchema(currency: string) {
  const symbol = currencySymbol(currency)
  return z.object({
    type: z.enum(["in", "out"]),
    amount: z
      .string()
      .refine((value) => Number(value) > 0, `Enter an amount more than ${symbol}0`)
      .refine((value) => Number(value) <= MAX_AMOUNT, "That amount is too large")
      .refine((value) => !/\.\d{3,}$/.test(value), "Use at most 2 decimal places"),
    categoryId: z
      .number({ error: "Pick a category" })
      .nullable()
      .refine((id) => id !== null, "Pick a category"),
    date: z.iso.date(),
    note: z.string().max(200, "Keep the note under 200 characters"),
  })
}

/** What the fields hold while typing */
export type TransactionFormInput = z.input<ReturnType<typeof transactionFormSchema>>
/** What a valid form gives on submit */
export type TransactionFormValues = z.output<ReturnType<typeof transactionFormSchema>>

/** Keeps only digits and one decimal point, so "1,250" becomes "1250". */
export function cleanAmountInput(raw: string) {
  const digits = raw.replace(/[^\d.]/g, "")
  const [whole = "", ...decimals] = digits.split(".")
  return decimals.length ? `${whole}.${decimals.join("")}` : whole
}

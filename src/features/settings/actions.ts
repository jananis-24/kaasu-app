import { db } from "@/lib/db"
import { fractionDigits } from "@/lib/money"
import type { Settings } from "./schema"

export function updateSettings(changes: Partial<Omit<Settings, "id">>) {
  return db.settings.update(1, changes)
}

/**
 * Switches currency without converting: ₹650 becomes $650.
 * Amounts are stored in minor units, so when the currencies use a different number of
 * decimals (INR 2, JPY 0, KWD 3) the stored numbers are rescaled to keep the same value.
 */
export async function changeCurrency(from: string, to: string) {
  const scale = 10 ** (fractionDigits(to) - fractionDigits(from))
  await db.transaction("rw", db.transactions, db.settings, async () => {
    if (scale !== 1) {
      await db.transactions.toCollection().modify((tx) => {
        tx.amountMinor = Math.max(1, Math.round(tx.amountMinor * scale))
      })
    }
    await db.settings.update(1, { currency: to })
  })
}

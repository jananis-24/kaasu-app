import { getDaysInMonth, setDate, startOfMonth, subMonths } from "date-fns"
import Dexie, { type EntityTable } from "dexie"
import { DEFAULT_CATEGORIES } from "@/features/categories/defaults"
import type { Category } from "@/features/categories/schema"
import { DEFAULT_SETTINGS, type Settings } from "@/features/settings/schema"
import type { Transaction } from "@/features/transactions/schema"
import { toDateKey } from "./dates"
import { toMinor } from "./money"
import { LAST_MONTH, THIS_MONTH } from "./sample-data"

export const db = new Dexie("kaasu") as Dexie & {
  transactions: EntityTable<Transaction, "id">
  categories: EntityTable<Category, "id">
  settings: EntityTable<Settings, "id">
}

// Only indexed fields are listed. Add a new version() when changing this, never edit v1.
db.version(1).stores({
  transactions: "++id, date, categoryId",
  categories: "++id, type",
  settings: "id",
})

// First launch: default categories, settings and sample data.
db.on("populate", () => resetDatabase({ withSampleData: true }))

/** Clears everything and puts back the defaults. Used on first launch and by "Erase all data". */
export async function resetDatabase({ withSampleData }: { withSampleData: boolean }) {
  await db.transaction("rw", db.transactions, db.categories, db.settings, async () => {
    await Promise.all([db.transactions.clear(), db.categories.clear(), db.settings.clear()])
    await db.settings.add(DEFAULT_SETTINGS)
    const ids = await db.categories.bulkAdd(DEFAULT_CATEGORIES as Category[], { allKeys: true })
    if (withSampleData) await addSampleData(ids)
  })
}

async function addSampleData(categoryIds: number[]) {
  const idFor = (name: string, type: "in" | "out") => {
    const index = DEFAULT_CATEGORIES.findIndex((c) => c.name === name && c.type === type)
    return categoryIds[index] ?? 0
  }
  const thisMonth = startOfMonth(new Date())
  const months = [
    { start: subMonths(thisMonth, 1), rows: LAST_MONTH },
    { start: thisMonth, rows: THIS_MONTH },
  ]
  const now = Date.now()
  const transactions = months.flatMap(({ start, rows }) =>
    rows.map(([day, category, amount, note, income], i) => ({
      type: income ?? "out",
      amountMinor: toMinor(amount, DEFAULT_SETTINGS.currency),
      categoryId: idFor(category, income ?? "out"),
      date: toDateKey(setDate(start, Math.min(day, getDaysInMonth(start)))),
      note,
      createdAt: now + i,
    })),
  )
  await db.transactions.bulkAdd(transactions as Transaction[])
}

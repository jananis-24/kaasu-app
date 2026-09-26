import { z } from "zod"
import { categorySchema } from "@/features/categories/schema"
import { transactionSchema } from "@/features/transactions/schema"
import { todayKey } from "@/lib/dates"
import { db, resetDatabase } from "@/lib/db"
import { settingsSchema } from "./schema"

// A backup is one JSON file with everything in the database.
const backupSchema = z.object({
  app: z.literal("kaasu"),
  version: z.literal(1),
  exportedAt: z.string(),
  settings: settingsSchema,
  categories: z.array(categorySchema),
  transactions: z.array(transactionSchema),
})

/** Downloads kaasu-backup-2026-09-26.json */
export async function exportBackup() {
  const backup: z.infer<typeof backupSchema> = {
    app: "kaasu",
    version: 1,
    exportedAt: new Date().toISOString(),
    settings: (await db.settings.get(1)) as z.infer<typeof settingsSchema>,
    categories: await db.categories.toArray(),
    transactions: await db.transactions.toArray(),
  }
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = `kaasu-backup-${todayKey()}.json`
  link.click()
  URL.revokeObjectURL(link.href)
}

/** Reads and checks a backup file. Throws if it isn't a valid Kaasu backup. */
export async function readBackup(file: File) {
  const json = JSON.parse(await file.text())
  return backupSchema.parse(json)
}

export type Backup = z.infer<typeof backupSchema>

/** Replaces everything in the database with the backup */
export async function restoreBackup(backup: Backup) {
  await db.transaction("rw", db.transactions, db.categories, db.settings, async () => {
    await Promise.all([db.transactions.clear(), db.categories.clear(), db.settings.clear()])
    await db.settings.put(backup.settings)
    await db.categories.bulkPut(backup.categories)
    await db.transactions.bulkPut(backup.transactions)
  })
}

/** Deletes every transaction and category, then puts back the default categories */
export function eraseAllData() {
  return resetDatabase({ withSampleData: false })
}

import { db } from "@/lib/db"
import { toMinor } from "@/lib/money"
import type { TransactionFormValues } from "./form-schema"
import type { Transaction } from "./schema"

/** Adds a new transaction, or updates `id` when given. */
export async function saveTransaction(
  values: TransactionFormValues,
  currency: string,
  id?: number,
) {
  const data = {
    type: values.type,
    amountMinor: toMinor(Number(values.amount), currency),
    categoryId: values.categoryId,
    date: values.date,
    note: values.note.trim(),
  }
  if (id) await db.transactions.update(id, data)
  else await db.transactions.add({ ...data, createdAt: Date.now() } as Transaction)
}

/** Deletes and returns the transaction, so it can be put back with restoreTransaction (Undo). */
export async function deleteTransaction(id: number) {
  const transaction = await db.transactions.get(id)
  await db.transactions.delete(id)
  return transaction
}

export function restoreTransaction(transaction: Transaction) {
  return db.transactions.put(transaction)
}

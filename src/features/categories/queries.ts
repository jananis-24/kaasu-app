import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import type { Category, TransactionType } from "./schema"

/** All categories (or one type), in the user's order */
export function useCategories(type?: TransactionType) {
  return (
    useLiveQuery(async () => {
      const all = type
        ? await db.categories.where({ type }).toArray()
        : await db.categories.toArray()
      return all.sort((a, b) => a.order - b.order)
    }, [type]) ?? []
  )
}

/** Look up a category by id */
export function useCategoryMap() {
  const categories = useCategories()
  return new Map<number, Category>(categories.map((c) => [c.id, c]))
}

/** How many transactions each category has: Map<categoryId, count> */
export function useEntryCounts() {
  return (
    useLiveQuery(async () => {
      const counts = new Map<number, number>()
      await db.transactions.each((tx) =>
        counts.set(tx.categoryId, (counts.get(tx.categoryId) ?? 0) + 1),
      )
      return counts
    }) ?? new Map<number, number>()
  )
}

export function useCategory(id: number | undefined) {
  return useLiveQuery(() => (id ? db.categories.get(id) : undefined), [id])
}

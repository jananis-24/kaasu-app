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

import { db } from "@/lib/db"
import type { Category } from "./schema"

type CategoryFields = Pick<Category, "name" | "icon" | "color">

/** Adds a category at the end of its type's list. Returns the new id. */
export async function createCategory(type: Category["type"], fields: CategoryFields) {
  const sameType = await db.categories.where({ type }).toArray()
  const order = Math.max(-1, ...sameType.map((c) => c.order)) + 1
  return db.categories.add({
    ...fields,
    name: fields.name.trim(),
    type,
    permanent: false,
    order,
  } as Category)
}

export function updateCategory(id: number, fields: Partial<CategoryFields>) {
  return db.categories.update(id, fields.name ? { ...fields, name: fields.name.trim() } : fields)
}

/** Saves a new order after drag-and-drop: ids in their new order */
export function reorderCategories(ids: number[]) {
  return db.transaction("rw", db.categories, () =>
    Promise.all(ids.map((id, order) => db.categories.update(id, { order }))),
  )
}

/**
 * Deletes a category. Its transactions move to `moveTo` first.
 * Returns what's needed to undo it.
 */
export async function deleteCategory(id: number, moveTo?: number) {
  return db.transaction("rw", db.categories, db.transactions, async () => {
    const category = await db.categories.get(id)
    const moved = await db.transactions.where({ categoryId: id }).primaryKeys()
    if (moved.length && moveTo)
      await db.transactions.where({ categoryId: id }).modify({ categoryId: moveTo })
    await db.categories.delete(id)
    return { category, moved }
  })
}

export async function undoDeleteCategory({
  category,
  moved,
}: Awaited<ReturnType<typeof deleteCategory>>) {
  if (!category) return
  await db.transaction("rw", db.categories, db.transactions, async () => {
    await db.categories.put(category)
    await db.transactions.bulkUpdate(
      moved.map((key) => ({ key, changes: { categoryId: category.id } })),
    )
  })
}

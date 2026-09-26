import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { useSearchParams } from "react-router"
import { toast } from "sonner"
import { CategoryTile } from "@/components/CategoryTile"
import { ResponsiveSheet } from "@/components/ResponsiveSheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { createCategory, deleteCategory, undoDeleteCategory, updateCategory } from "./actions"
import { CategoryForm, type CategoryFormValues } from "./CategoryForm"
import { useCategories, useCategory, useEntryCounts } from "./queries"
import type { Category } from "./schema"

const entries = (count: number) => (count === 1 ? "1 entry" : `${count} entries`)

/**
 * New / edit category sheet. Lives in the app shell and opens from the URL:
 * ?newCategory=out|in or ?editCategory=<id>. Opening it from the transaction form
 * (?add=1&newCategory=out) picks the new category there when saved (?picked=<id>).
 */
export function CategorySheet() {
  const [params, setParams] = useSearchParams()
  const newType = params.get("newCategory")
  const editId = Number(params.get("editCategory")) || undefined
  const editing = useCategory(editId)
  const all = useCategories()
  const counts = useEntryCounts()
  const [deleting, setDeleting] = useState<Category | null>(null)
  const [moveTo, setMoveTo] = useState<number | null>(null)

  const type = editing?.type ?? (newType === "in" ? "in" : "out")
  const open = newType !== null || editing !== undefined

  const close = (picked?: number) => {
    const next = new URLSearchParams(params)
    next.delete("newCategory")
    next.delete("editCategory")
    if (picked && (next.has("add") || next.has("edit"))) next.set("picked", String(picked))
    setParams(next, { replace: true })
  }

  const save = async (values: CategoryFormValues) => {
    if (editing) {
      await updateCategory(
        editing.id,
        editing.permanent ? { icon: values.icon, color: values.color } : values,
      )
      close()
    } else {
      close(await createCategory(values.type, values))
    }
  }

  const remove = async (category: Category, target?: number) => {
    const undo = await deleteCategory(category.id, target)
    setDeleting(null)
    close()
    toast(`“${category.name}” deleted`, {
      action: { label: "Undo", onClick: () => undoDeleteCategory(undo) },
    })
  }

  const startDelete = () => {
    if (!editing) return
    if (!counts.get(editing.id)) return remove(editing)
    // Entries go to the permanent "Other" of the same type unless the user picks another
    const other = all.find((c) => c.type === editing.type && c.permanent)
    setMoveTo(other?.id ?? null)
    setDeleting(editing)
    close()
  }

  const targets = all.filter((c) => c.type === deleting?.type && c.id !== deleting?.id)
  const target = targets.find((c) => c.id === moveTo)
  const count = deleting ? (counts.get(deleting.id) ?? 0) : 0

  return (
    <>
      <ResponsiveSheet
        open={open}
        onOpenChange={(next) => !next && close()}
        className="h-[770px] gap-3.5 lg:h-auto lg:w-[520px]"
      >
        {open && (
          <CategoryForm
            key={editId ?? `new-${type}`}
            category={editing}
            type={type}
            others={all.filter((c) => c.id !== editId)}
            onSubmit={save}
            onClose={() => close()}
            onDelete={startDelete}
          />
        )}
      </ResponsiveSheet>

      <AlertDialog open={deleting !== null} onOpenChange={(next) => !next && setDeleting(null)}>
        {deleting && (
          <AlertDialogContent className="gap-3">
            <AlertDialogHeader className="gap-3">
              <AlertDialogTitle>Delete “{deleting.name}”?</AlertDialogTitle>
              <AlertDialogDescription>
                {deleting.name} has {entries(count)}. Move {entries(count)} to:
              </AlertDialogDescription>
            </AlertDialogHeader>
            {/* Styled row on top, a native select underneath does the picking */}
            <label className="field relative flex min-h-14 items-center gap-3 px-3.5">
              <CategoryTile
                category={target}
                className="size-9 rounded-[12px]"
                iconClassName="size-[18px]"
              />
              <span className="grow font-bold">{target?.name}</span>
              <ChevronDown className="size-[18px]" strokeWidth={2.2} aria-hidden />
              <select
                aria-label="Move entries to"
                value={moveTo ?? ""}
                onChange={(event) => setMoveTo(Number(event.target.value))}
                className="absolute inset-0 cursor-pointer opacity-0"
              >
                {targets.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <AlertDialogFooter className="mt-2">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                className="flex-[1.4]"
                disabled={!moveTo}
                onClick={() => moveTo && remove(deleting, moveTo)}
              >
                Move and delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </>
  )
}

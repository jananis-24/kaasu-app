import { useState } from "react"
import { useSearchParams } from "react-router"
import { toast } from "sonner"
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
import { useCurrency } from "@/features/settings/queries"
import { deleteTransaction, restoreTransaction, saveTransaction } from "./actions"
import { useTransaction } from "./queries"
import { TransactionForm } from "./TransactionForm"

/**
 * The add / edit sheet. Lives in the app shell and opens from the URL:
 * ?add=1 for a new transaction, ?edit=<id> to change one. Closing removes the param.
 * Mobile: bottom sheet. Desktop: centred popup.
 */
export function TransactionSheet() {
  const [params, setParams] = useSearchParams()
  const editId = Number(params.get("edit")) || undefined
  const isAdding = params.has("add")
  const transaction = useTransaction(editId)
  const currency = useCurrency()
  const [dirty, setDirty] = useState(false)
  const [confirmingDiscard, setConfirmingDiscard] = useState(false)

  const open = isAdding || (editId !== undefined && transaction !== undefined)

  const close = () => {
    const next = new URLSearchParams(params)
    next.delete("add")
    next.delete("edit")
    setParams(next, { replace: true })
    setDirty(false)
    setConfirmingDiscard(false)
  }
  const requestClose = () => (dirty ? setConfirmingDiscard(true) : close())

  const remove = async () => {
    if (!editId) return
    const deleted = await deleteTransaction(editId)
    close()
    if (deleted) {
      toast("Transaction deleted", {
        action: { label: "Undo", onClick: () => restoreTransaction(deleted) },
      })
    }
  }

  return (
    <>
      <ResponsiveSheet
        open={open}
        onOpenChange={(next) => !next && requestClose()}
        className="h-[720px] gap-3.5 lg:h-[700px] lg:w-[520px]"
      >
        {open && (
          <TransactionForm
            key={editId ?? "new"}
            transaction={editId ? transaction : undefined}
            currency={currency}
            onDirtyChange={setDirty}
            onClose={requestClose}
            onDelete={remove}
            onSubmit={async (values, addAnother) => {
              await saveTransaction(values, currency, editId)
              if (!addAnother) close()
              else toast("Saved. Add the next one.")
            }}
          />
        )}
      </ResponsiveSheet>

      <AlertDialog open={confirmingDiscard} onOpenChange={setConfirmingDiscard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard this entry?</AlertDialogTitle>
            <AlertDialogDescription>
              The amount, category and note you added will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={close}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

import { useState } from "react"
import { useSearchParams } from "react-router"
import { toast } from "sonner"
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
import { Dialog, DialogContent } from "@/components/ui/dialog"
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
      <Dialog open={open} onOpenChange={(next) => !next && requestClose()}>
        <DialogContent
          showCloseButton={false}
          className="data-closed:slide-out-to-bottom data-open:slide-in-from-bottom data-closed:zoom-out-100 data-open:zoom-in-100 lg:data-closed:slide-out-to-bottom-0 lg:data-open:slide-in-from-bottom-0 top-auto bottom-0 left-0 flex h-[720px] max-h-[calc(100svh-24px)] w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none rounded-t-2xl px-5 pt-2.5 pb-6 shadow-sheet lg:top-1/2 lg:bottom-auto lg:left-1/2 lg:h-[700px] lg:w-[520px] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-2xl lg:px-7 lg:pt-6 lg:pb-7 lg:shadow-dialog"
        >
          <span
            aria-hidden
            className="mb-3.5 h-[5px] w-10 shrink-0 self-center rounded-pill bg-track lg:hidden"
          />
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
        </DialogContent>
      </Dialog>

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

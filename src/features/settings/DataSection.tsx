import { Download, Trash2, Upload } from "lucide-react"
import { useRef, useState } from "react"
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
import { cn } from "@/lib/utils"
import { type Backup, eraseAllData, exportBackup, readBackup, restoreBackup } from "./backup"

/**
 * Backup and reset. Not on the boards: data lives only on this device,
 * so people need a way to keep a copy. Styled like the Money rows.
 */
export function DataSection({ className }: { className?: string }) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [backup, setBackup] = useState<Backup | null>(null)
  const [confirmingErase, setConfirmingErase] = useState(false)

  const pickFile = async (file: File | undefined) => {
    if (!file) return
    try {
      setBackup(await readBackup(file))
    } catch {
      toast("That file isn't a Kaasu backup")
    }
    if (fileInput.current) fileInput.current.value = "" // allow picking the same file again
  }

  return (
    <section
      aria-labelledby="data-h"
      className={cn("glass flex flex-col rounded-xl px-4 py-2 lg:px-5.5 lg:py-2.5", className)}
    >
      <h2 id="data-h" className="pt-2.5 pb-0.5 text-lg lg:text-[19px]">
        Data
      </h2>
      <Row
        label="Export backup"
        hint="Save a copy as a file"
        icon={Download}
        onClick={exportBackup}
      />
      <Row
        label="Import backup"
        hint="Replace everything"
        icon={Upload}
        onClick={() => fileInput.current?.click()}
      />
      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        className="hidden"
        aria-label="Backup file"
        onChange={(event) => pickFile(event.target.files?.[0])}
      />
      <Row label="Erase all data" icon={Trash2} danger onClick={() => setConfirmingErase(true)} />

      <AlertDialog open={backup !== null} onOpenChange={(open) => !open && setBackup(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace all data?</AlertDialogTitle>
            <AlertDialogDescription>
              This backup has {backup?.transactions.length ?? 0} transactions. Everything on this
              device now will be replaced by it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={async () => {
                if (backup) await restoreBackup(backup)
                setBackup(null)
                toast("Backup restored")
              }}
            >
              Replace
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmingErase} onOpenChange={setConfirmingErase}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Erase all data?</AlertDialogTitle>
            <AlertDialogDescription>
              Every transaction and category is deleted and can't be brought back. Export a backup
              first if you might need it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={async () => {
                await eraseAllData()
                setConfirmingErase(false)
                toast("All data erased")
              }}
            >
              Erase
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}

type RowProps = {
  label: string
  hint?: string
  icon: typeof Download
  danger?: boolean
  onClick: () => void
}

function Row({ label, hint, icon: Icon, danger, onClick }: RowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-15 items-center gap-3 border-divider border-t text-left first-of-type:border-t-0",
        danger && "text-expense",
      )}
    >
      <span className="grow font-semibold">{label}</span>
      {hint && <span className="text-fg-muted">{hint}</span>}
      <Icon className="size-[18px]" strokeWidth={2.2} aria-hidden />
    </button>
  )
}

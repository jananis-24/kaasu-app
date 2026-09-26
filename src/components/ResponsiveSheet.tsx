import { X } from "lucide-react"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type Props = {
  open: boolean
  /** Called with false when the user presses Esc or taps the dimmed background */
  onOpenChange: (open: boolean) => void
  /** Heights/widths and the gap between rows, e.g. "h-[720px] gap-3.5 lg:h-[700px] lg:w-[520px]" */
  className?: string
  children: ReactNode
}

/** Bottom sheet on mobile, centred popup on desktop (≥1024px). Solid surface, never glass. */
export function ResponsiveSheet({ open, onOpenChange, className, children }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          // Mobile: pinned to the bottom, slides up
          "data-closed:slide-out-to-bottom data-open:slide-in-from-bottom data-closed:zoom-out-100 data-open:zoom-in-100 top-auto bottom-0 left-0 flex max-h-[calc(100svh-24px)] w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none rounded-t-2xl px-5 pt-2.5 pb-6 shadow-sheet",
          // Desktop: centred popup
          "lg:data-closed:slide-out-to-bottom-0 lg:data-open:slide-in-from-bottom-0 lg:top-1/2 lg:bottom-auto lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-2xl lg:px-7 lg:pt-6 lg:pb-7 lg:shadow-dialog",
          className,
        )}
      >
        <span
          aria-hidden
          className="h-[5px] w-10 shrink-0 self-center rounded-pill bg-track lg:hidden"
        />
        {children}
      </DialogContent>
    </Dialog>
  )
}

/** Close button · title · optional action on the right (e.g. Delete) */
export function SheetHeader(props: { title: string; onClose: () => void; action?: ReactNode }) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-2">
      <Button type="button" variant="subtle" size="icon" aria-label="Close" onClick={props.onClose}>
        <X strokeWidth={2.2} />
      </Button>
      <DialogTitle className="font-bold font-display text-[19px]">{props.title}</DialogTitle>
      {props.action || <span aria-hidden className="w-tap" />}
    </div>
  )
}

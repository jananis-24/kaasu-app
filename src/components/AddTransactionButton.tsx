import { Plus } from "lucide-react"
import { Link, useLocation } from "react-router"
import { cn } from "@/lib/utils"

/** Floating add button: square icon button on mobile, labelled pill on desktop. Opens ?add=1. */
export function AddTransactionButton({ className }: { className?: string }) {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  params.set("add", "1")

  return (
    <Link
      to={{ search: params.toString() }}
      aria-label="Add transaction"
      className={cn(
        "glass-chip fixed right-5 bottom-24 z-30 flex size-fab items-center justify-center rounded-[22px] text-fg shadow-glass backdrop-blur-xl",
        "lg:right-10 lg:bottom-9 lg:size-auto lg:h-14 lg:gap-2.5 lg:rounded-lg lg:pr-6 lg:pl-4.5 lg:font-bold lg:text-base",
        className,
      )}
    >
      <Plus className="size-[26px] lg:size-5" strokeWidth={2.6} aria-hidden />
      <span className="hidden lg:inline">Add transaction</span>
    </Link>
  )
}

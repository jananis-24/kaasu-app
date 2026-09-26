import { addMonths, format, parse, subMonths } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useSearchParams } from "react-router"
import { toMonthKey } from "@/lib/dates"
import { cn } from "@/lib/utils"

/** The month in the URL (?month=2026-09), or this month. */
export function useSelectedMonth() {
  const [params] = useSearchParams()
  const month = params.get("month") ?? toMonthKey(new Date())
  return { month, date: parse(month, "yyyy-MM", new Date()) }
}

/** ‹ September 2026 › — mobile: spread across the width; desktop: grouped on the left. */
export function MonthSwitcher({ className }: { className?: string }) {
  const [params, setParams] = useSearchParams()
  const { date } = useSelectedMonth()
  const prev = subMonths(date, 1)
  const next = addMonths(date, 1)

  const goTo = (month: Date) => {
    const nextParams = new URLSearchParams(params)
    nextParams.set("month", toMonthKey(month))
    nextParams.delete("day")
    setParams(nextParams)
  }

  return (
    <div
      className={cn("flex items-center justify-between gap-2 lg:justify-start lg:gap-3", className)}
    >
      <ArrowButton
        label={`Previous month, ${format(prev, "MMMM yyyy")}`}
        onClick={() => goTo(prev)}
      >
        <ChevronLeft className="size-icon" strokeWidth={2.2} />
      </ArrowButton>
      <h1 className="text-center text-xl tracking-[-0.01em] lg:min-w-[220px] lg:text-2xl">
        {format(date, "MMMM yyyy")}
      </h1>
      <ArrowButton label={`Next month, ${format(next, "MMMM yyyy")}`} onClick={() => goTo(next)}>
        <ChevronRight className="size-icon" strokeWidth={2.2} />
      </ArrowButton>
    </div>
  )
}

function ArrowButton(props: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={props.label}
      onClick={props.onClick}
      className="glass flex size-tap items-center justify-center rounded-pill text-fg"
    >
      {props.children}
    </button>
  )
}

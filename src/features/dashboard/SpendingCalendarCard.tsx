import { format, parseISO } from "date-fns"
import { type DayButtonProps, DayPicker } from "react-day-picker"
import { useNavigate } from "react-router"
import { toDateKey } from "@/lib/dates"
import { formatMoney } from "@/lib/money"
import { cn } from "@/lib/utils"
import { SectionCard } from "./SectionCard"
import { heatLevel } from "./stats"

type Props = {
  /** First day of the month shown */
  month: Date
  /** Spending per day, from spendingByDay() */
  byDay: Record<string, number>
  today: string
  currency: string
  className?: string
}

const HEAT_CLASS = ["glass-chip", "heat-1", "heat-2", "heat-3", "heat-4"]

/** Month grid shaded by how much was spent each day. Clicking a day opens that day's transactions. */
export function SpendingCalendarCard({ month, byDay, today, currency, className }: Props) {
  const navigate = useNavigate()
  const biggest = Math.max(0, ...Object.values(byDay))
  const biggestDay = Object.entries(byDay).find(([, total]) => total === biggest)?.[0]
  const levelOf = (date: Date) => heatLevel(byDay[toDateKey(date)] ?? 0, biggest)
  const isFuture = (date: Date) => toDateKey(date) > today

  function HeatDayButton({ day, modifiers, className: _, ...props }: DayButtonProps) {
    const future = isFuture(day.date)
    return (
      <button
        {...props}
        type="button"
        className={cn(
          "num h-11 w-full rounded-md p-0 font-semibold text-md lg:h-[46px]",
          future
            ? "cursor-default border border-divider border-dashed text-fg-disabled"
            : HEAT_CLASS[levelOf(day.date)],
          modifiers.today && "border-2 border-fg font-extrabold",
        )}
      />
    )
  }

  return (
    <SectionCard
      id="cal-h"
      title="Spending calendar"
      aside={
        <>
          <span className="lg:hidden">Tap a day</span>
          <span className="hidden lg:inline">Click a day</span>
        </>
      }
      className={cn("gap-2.5 px-3 pt-4.5 pb-4 lg:px-4.5 lg:pt-5 lg:pb-4.5", className)}
      headerClassName="px-1"
    >
      <DayPicker
        month={month}
        today={parseISO(today)}
        hideNavigation
        weekStartsOn={1}
        disabled={{ after: parseISO(today) }}
        onDayClick={(date) => {
          if (!isFuture(date))
            navigate(`/transactions?month=${format(date, "yyyy-MM")}&day=${toDateKey(date)}`)
        }}
        formatters={{ formatWeekdayName: (date) => format(date, "EEEEEE") }}
        labels={{
          labelDayButton: (date, modifiers) => {
            const spent = byDay[toDateKey(date)] ?? 0
            const what = isFuture(date)
              ? "upcoming"
              : spent
                ? `spent ${formatMoney(spent, currency)}`
                : "no spending"
            return `${format(date, "d MMMM")}, ${what}${modifiers.today ? ", today" : ""}`
          },
        }}
        components={{ DayButton: HeatDayButton }}
        classNames={{
          root: "w-full",
          months: "w-full",
          month: "w-full",
          month_caption: "sr-only",
          month_grid:
            "-m-1 w-[calc(100%+8px)] table-fixed border-separate border-spacing-1 lg:-m-1.5 lg:w-[calc(100%+12px)] lg:border-spacing-1.5",
          weekday: "px-0 pt-0.5 pb-1 text-center font-semibold text-fg-muted text-xs",
          day: "p-0",
        }}
      />
      <div className="flex items-center justify-between gap-2 px-1 pt-1 text-fg-muted text-sm">
        <span>
          Biggest day:{" "}
          <strong className="font-semibold text-fg">
            {biggestDay
              ? `${format(parseISO(biggestDay), "d MMM")} · ${formatMoney(biggest, currency)}`
              : "none yet"}
          </strong>
        </span>
        <span className="flex items-center gap-1" aria-hidden>
          Less
          {[1, 2, 3, 4].map((level) => (
            <span
              key={level}
              className={cn("size-3.5 rounded-xs border border-glass-border", HEAT_CLASS[level])}
            />
          ))}
          More
        </span>
      </div>
    </SectionCard>
  )
}

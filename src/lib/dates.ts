import { format, isThisYear, isToday, isYesterday, parseISO } from "date-fns"

/** Dates are stored as "yyyy-MM-dd" strings; months as "yyyy-MM". */
export const toDateKey = (date: Date) => format(date, "yyyy-MM-dd")
export const toMonthKey = (date: Date) => format(date, "yyyy-MM")
export const todayKey = () => toDateKey(new Date())

/** "Today", "Yesterday", "5 Sep", or "5 Sep 2025" for another year */
export function dayLabel(dateKey: string) {
  const date = parseISO(dateKey)
  if (isToday(date)) return "Today"
  if (isYesterday(date)) return "Yesterday"
  return format(date, isThisYear(date) ? "d MMM" : "d MMM yyyy")
}

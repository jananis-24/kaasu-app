import { format, subMonths } from "date-fns"
import { AddTransactionButton } from "@/components/AddTransactionButton"
import { MonthSwitcher, useSelectedMonth } from "@/components/MonthSwitcher"
import { useCategoryMap } from "@/features/categories/queries"
import { useCurrency } from "@/features/settings/queries"
import { useMonthTransactions } from "@/features/transactions/queries"
import { toDateKey, todayKey, toMonthKey } from "@/lib/dates"
import { RecentCard } from "./RecentCard"
import { SpendingByCategoryCard } from "./SpendingByCategoryCard"
import { SpendingCalendarCard } from "./SpendingCalendarCard"
import { SummaryCards } from "./SummaryCards"
import { monthTotals, spendingByDay, topCategories, whatChanged } from "./stats"
import { WhatChangedCard } from "./WhatChangedCard"

export function DashboardPage() {
  const { month, date } = useSelectedMonth()
  const previousMonth = subMonths(date, 1)
  const current = useMonthTransactions(month)
  const previous = useMonthTransactions(toMonthKey(previousMonth))
  const categories = useCategoryMap()
  const currency = useCurrency()
  const today = todayKey()

  if (!current || !previous) return null

  // This month is compared with the same days of last month (1–26 Aug vs 1–26 Sep).
  const isThisMonth = month === toMonthKey(new Date())
  const sameDayLastMonth = toDateKey(subMonths(new Date(), 1))
  const previousSoFar = isThisMonth
    ? previous.filter((tx) => tx.date <= sameDayLastMonth)
    : previous
  const comparedTo = isThisMonth
    ? `vs 1–${format(new Date(), "d")} ${format(previousMonth, "MMM")}`
    : `vs ${format(previousMonth, "MMMM")}`

  const recent = current
    .filter((tx) => tx.date <= today)
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
    .slice(0, 5)

  return (
    <div className="flex flex-col gap-4 pb-[98px] lg:gap-6 lg:pb-0">
      <MonthSwitcher />
      <SummaryCards {...monthTotals(current, today)} currency={currency} />

      {/* Mobile: one column in the order below. Desktop: two columns. */}
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1.2fr_1fr] lg:items-start lg:gap-6">
        <div className="contents lg:flex lg:flex-col lg:gap-6">
          <SpendingByCategoryCard
            rows={topCategories(current, today)}
            categories={categories}
            month={month}
            currency={currency}
            className="order-2 lg:order-none"
          />
          <RecentCard
            transactions={recent}
            categories={categories}
            month={month}
            currency={currency}
            className="order-4 lg:order-none"
          />
        </div>
        <div className="contents lg:flex lg:flex-col lg:gap-6">
          <WhatChangedCard
            changes={whatChanged(current, previousSoFar, today)}
            categories={categories}
            comparedTo={comparedTo}
            currency={currency}
            className="order-1 lg:order-none"
          />
          <SpendingCalendarCard
            month={date}
            byDay={spendingByDay(current, today)}
            today={today}
            currency={currency}
            className="order-3 lg:order-none"
          />
        </div>
      </div>

      <AddTransactionButton />
    </div>
  )
}

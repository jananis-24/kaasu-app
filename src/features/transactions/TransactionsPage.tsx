import { format, parseISO } from "date-fns"
import { FileText, Plus, X } from "lucide-react"
import { Link, useLocation, useSearchParams } from "react-router"
import { AddTransactionButton } from "@/components/AddTransactionButton"
import { MonthSwitcher, useSelectedMonth } from "@/components/MonthSwitcher"
import { TransactionRow } from "@/components/TransactionRow"
import { useCategoryMap } from "@/features/categories/queries"
import { monthTotals } from "@/features/dashboard/stats"
import { useCurrency } from "@/features/settings/queries"
import { dayLabel, todayKey } from "@/lib/dates"
import { formatMoney, fromMinor } from "@/lib/money"
import { cn } from "@/lib/utils"
import { useAllTransactions, useMonthTransactions } from "./queries"
import type { Transaction } from "./schema"
import { TransactionFilters } from "./TransactionFilters"

export function TransactionsPage() {
  const [params, setParams] = useSearchParams()
  const { month, date } = useSelectedMonth()
  const categories = useCategoryMap()
  const currency = useCurrency()
  const today = todayKey()

  // Filters live in the URL: ?q=swiggy (searches every month), ?category=<id>, ?day=2026-09-14
  const search = params.get("q") ?? ""
  const categoryFilter = Number(params.get("category")) || undefined
  const dayFilter = params.get("day") ?? undefined
  const setParam = (key: "q" | "category" | "day", value: string | undefined) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    // Typing shouldn't add a history entry per letter
    setParams(next, { replace: key === "q" })
  }

  const monthTransactions = useMonthTransactions(month)
  const everything = useAllTransactions(search !== "")
  const all = search ? everything : monthTransactions

  if (!all) return null

  const shown = all
    .filter((tx) => !categoryFilter || tx.categoryId === categoryFilter)
    .filter((tx) => !dayFilter || tx.date === dayFilter)
    .filter((tx) => matchesSearch(search, tx, categories.get(tx.categoryId)?.name, currency))
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
  const groups = Object.entries(Object.groupBy(shown, (tx) => tx.date))
  const { moneyIn, moneyOut, left } = monthTotals(shown, today)
  const filtered = Boolean(categoryFilter || dayFilter || search)

  return (
    <div className="flex flex-col gap-3.5 pb-[98px] lg:gap-5 lg:pb-24">
      {search ? (
        <h1 className="flex min-h-tap items-center px-1 text-xl lg:text-2xl">
          {shown.length === 1 ? "1 result" : `${shown.length} results`} in all months
        </h1>
      ) : (
        <MonthSwitcher />
      )}

      <TransactionFilters
        search={search}
        onSearchChange={(text) => setParam("q", text)}
        categoryId={categoryFilter}
        onCategoryChange={(id) => setParam("category", id ? String(id) : undefined)}
      />

      {dayFilter && (
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label={format(parseISO(dayFilter), "d MMM")}
            onClear={() => setParam("day", undefined)}
          />
        </div>
      )}

      {all.length === 0 && !search ? (
        <EmptyMonth monthName={format(date, "MMMM")} />
      ) : (
        <>
          <section
            aria-label="Month summary"
            className="glass grid grid-cols-3 rounded-[22px] px-1.5 py-3 lg:gap-4 lg:border-0 lg:bg-none lg:p-0 lg:shadow-none lg:backdrop-filter-none"
          >
            <SummaryItem
              label="Money in"
              value={formatMoney(moneyIn, currency, "+")}
              className="text-income"
            />
            <SummaryItem
              label="Money out"
              value={formatMoney(moneyOut, currency, "-")}
              className="text-expense"
              divided
            />
            <SummaryItem label="Balance" value={formatMoney(left, currency)} />
          </section>

          {shown.length === 0 && filtered && (
            <p className="glass rounded-[22px] px-4 py-6 text-center text-fg-muted">
              {search ? `Nothing matches “${search}”.` : "No transactions match this filter."}
            </p>
          )}

          {/* Mobile: a card per day. Desktop: one card, days split by a line. */}
          <section
            aria-label="Transactions"
            className="lg:glass flex flex-col gap-3.5 lg:gap-0 lg:rounded-xl lg:px-6 lg:py-1"
          >
            {groups.map(([day, list], index) => (
              <section
                key={day}
                aria-label={dayLabel(day)}
                className="flex flex-col gap-1.5 lg:gap-0"
              >
                <h2
                  className={cn(
                    "px-1.5 font-body font-bold text-sm lg:px-0 lg:pt-4 lg:pb-1.5",
                    index > 0 && "lg:border-divider lg:border-t",
                  )}
                >
                  {dayLabel(day)}
                </h2>
                <div className="max-lg:glass flex flex-col rounded-[22px] px-3 lg:px-0">
                  {list?.map((tx, rowIndex) => (
                    <TransactionRow
                      key={tx.id}
                      transaction={tx}
                      category={categories.get(tx.categoryId)}
                      currency={currency}
                      upcoming={tx.date > today}
                      layout="table"
                      className={cn(rowIndex > 0 && "border-divider border-t lg:border-t-0")}
                    />
                  ))}
                </div>
              </section>
            ))}
          </section>
        </>
      )}

      {all.length > 0 && <AddTransactionButton />}
    </div>
  )
}

function SummaryItem(props: {
  label: string
  value: string
  className?: string
  divided?: boolean
}) {
  return (
    <span
      className={cn(
        "flex flex-col items-center gap-0.5",
        props.divided && "border-divider border-x lg:border-x",
        "lg:glass lg:flex-row lg:items-baseline lg:justify-between lg:gap-3 lg:rounded-[22px] lg:px-5.5 lg:py-4.5",
      )}
    >
      <span className="text-fg-muted text-sm lg:font-semibold lg:text-base">{props.label}</span>
      <span className={cn("num font-bold lg:font-display lg:text-[24px]", props.className)}>
        {props.value}
      </span>
    </span>
  )
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <button
      type="button"
      onClick={onClear}
      aria-label={`Showing ${label} only. Clear filter`}
      className="glass-chip inline-flex h-9 items-center gap-1.5 rounded-pill pr-2.5 pl-3.5 font-semibold text-sm"
    >
      {label}
      <X className="size-4" strokeWidth={2.4} aria-hidden />
    </button>
  )
}

function EmptyMonth({ monthName }: { monthName: string }) {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  params.set("add", "1")
  return (
    <section className="glass mt-15 flex flex-col items-center gap-3.5 rounded-2xl px-6 py-9 text-center">
      <span className="glass-chip flex size-16 items-center justify-center rounded-[22px]">
        <FileText className="size-[30px]" strokeWidth={1.8} aria-hidden />
      </span>
      <h2 className="text-[20px]">No transactions yet</h2>
      <p className="text-fg-muted">
        Nothing added for {monthName}. Add your first one and it shows up here.
      </p>
      <Link
        to={{ search: params.toString() }}
        className="inline-flex h-13 items-center gap-2 rounded-[18px] bg-action px-5.5 font-bold text-on-action"
      >
        <Plus className="size-5" strokeWidth={2.6} aria-hidden />
        Add transaction
      </Link>
    </section>
  )
}

/** Case-insensitive match on note, category name or amount ("650" finds ₹650) */
function matchesSearch(search: string, tx: Transaction, categoryName = "", currency: string) {
  const needle = search.trim().toLowerCase()
  if (!needle) return true
  const digits = needle.replace(/[^\d.]/g, "")
  const amount = String(fromMinor(tx.amountMinor, currency))
  return (
    tx.note.toLowerCase().includes(needle) ||
    categoryName.toLowerCase().includes(needle) ||
    (digits !== "" && amount.includes(digits))
  )
}

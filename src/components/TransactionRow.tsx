import { Clock } from "lucide-react"
import { Link, useLocation } from "react-router"
import type { Category } from "@/features/categories/schema"
import type { Transaction } from "@/features/transactions/schema"
import { formatMoney } from "@/lib/money"
import { cn } from "@/lib/utils"
import { CategoryTile } from "./CategoryTile"

type Props = {
  transaction: Transaction
  category: Category | undefined
  currency: string
  /** Small grey line under the amount ("Today"). Dashboard shows it, the list doesn't. */
  when?: string
  upcoming?: boolean
  /** "table": on desktop, lays out as columns (icon · name · note · amount) like the list board */
  layout?: "stacked" | "table"
  className?: string
}

/** One transaction. Opens the edit sheet (?edit=id on the current page). */
export function TransactionRow({
  transaction,
  category,
  currency,
  when,
  upcoming,
  layout = "stacked",
  className,
}: Props) {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  params.set("edit", String(transaction.id))

  const income = transaction.type === "in"
  const amount = formatMoney(transaction.amountMinor, currency, income ? "+" : "-")
  const table = layout === "table"
  const label = [
    category?.name,
    transaction.note,
    `${income ? "income" : "expense"} ${formatMoney(transaction.amountMinor, currency)}`,
    when,
    upcoming && "upcoming",
  ]
    .filter(Boolean)
    .join(", ")

  return (
    <Link
      to={{ search: params.toString() }}
      aria-label={`${label}. Edit`}
      className={cn(
        "box-content flex min-h-16 items-center gap-3 py-2 text-fg",
        table &&
          "lg:grid lg:min-h-14 lg:grid-cols-[40px_180px_minmax(0,1fr)_140px] lg:gap-4 lg:py-0",
        className,
      )}
    >
      <CategoryTile category={category} />
      <span className={cn("flex min-w-0 grow flex-col", table && "lg:contents")}>
        <span className="flex items-center gap-2">
          <span className="font-semibold">{category?.name}</span>
          {upcoming && (
            <span className="inline-flex items-center gap-1 rounded-pill bg-track px-2 py-0.5 font-semibold text-xs">
              <Clock className="size-3" strokeWidth={2.4} aria-hidden />
              Upcoming
            </span>
          )}
        </span>
        <span className={cn("truncate text-fg-muted text-sm", table && "lg:text-base")}>
          {transaction.note}
        </span>
      </span>
      <span className="flex flex-col items-end">
        <span className={cn("num font-bold", income ? "text-income" : "text-expense")}>
          {amount}
        </span>
        {when && <span className="text-fg-muted text-sm">{when}</span>}
      </span>
    </Link>
  )
}

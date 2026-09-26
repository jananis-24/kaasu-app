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
  className?: string
}

/** One transaction. Opens the edit sheet (?edit=id on the current page). */
export function TransactionRow({
  transaction,
  category,
  currency,
  when,
  upcoming,
  className,
}: Props) {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  params.set("edit", String(transaction.id))

  const income = transaction.type === "in"
  const amount = formatMoney(transaction.amountMinor, currency, income ? "+" : "-")
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
      className={cn("box-content flex min-h-16 items-center gap-3 py-2 text-fg", className)}
    >
      <CategoryTile category={category} />
      <span className="flex min-w-0 grow flex-col">
        <span className="flex items-center gap-2">
          <span className="font-semibold">{category?.name}</span>
          {upcoming && (
            <span className="inline-flex items-center gap-1 rounded-pill bg-track px-2 py-0.5 font-semibold text-xs">
              <Clock className="size-3" strokeWidth={2.4} aria-hidden />
              Upcoming
            </span>
          )}
        </span>
        <span className="truncate text-fg-muted text-sm">{transaction.note}</span>
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

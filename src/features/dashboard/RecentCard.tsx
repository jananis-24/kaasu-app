import { Link } from "react-router"
import { TransactionRow } from "@/components/TransactionRow"
import type { Category } from "@/features/categories/schema"
import type { Transaction } from "@/features/transactions/schema"
import { dayLabel } from "@/lib/dates"
import { cn } from "@/lib/utils"

type Props = {
  transactions: Transaction[]
  categories: Map<number, Category>
  month: string
  currency: string
  className?: string
}

export function RecentCard({ transactions, categories, month, currency, className }: Props) {
  return (
    <section
      aria-labelledby="recent-h"
      className={cn("glass flex flex-col rounded-xl px-4 pt-3.5 pb-2 lg:px-5", className)}
    >
      <div className="flex items-center justify-between gap-2 pb-1 pl-1">
        <h2 id="recent-h" className="text-lg lg:text-[19px]">
          Recent
        </h2>
        <Link
          to={`/transactions?month=${month}`}
          className="inline-flex min-h-tap items-center px-2 font-bold text-accent"
        >
          See all
        </Link>
      </div>
      {transactions.length === 0 && (
        <p className="border-divider border-t px-1 py-4 text-fg-muted">Nothing added yet.</p>
      )}
      {transactions.map((tx) => (
        <TransactionRow
          key={tx.id}
          transaction={tx}
          category={categories.get(tx.categoryId)}
          currency={currency}
          when={dayLabel(tx.date)}
          className="border-divider border-t px-1 lg:gap-3.5"
        />
      ))}
    </section>
  )
}

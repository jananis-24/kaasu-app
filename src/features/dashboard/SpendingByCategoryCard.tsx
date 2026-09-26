import type { CSSProperties } from "react"
import { Link } from "react-router"
import { CategoryTile } from "@/components/CategoryTile"
import type { Category } from "@/features/categories/schema"
import { formatMoney } from "@/lib/money"
import { cn } from "@/lib/utils"
import { SectionCard } from "./SectionCard"
import type { topCategories } from "./stats"

type Props = {
  rows: ReturnType<typeof topCategories>
  categories: Map<number, Category>
  month: string
  currency: string
  className?: string
}

const OTHERS = { name: "Others", icon: "dots", color: "grey" } as const

/** Horizontal bars, longest = biggest category. Each row opens the filtered transaction list. */
export function SpendingByCategoryCard({ rows, categories, month, currency, className }: Props) {
  const total = rows.reduce((sum, row) => sum + row.total, 0)
  const biggest = rows[0]?.total ?? 0

  return (
    <SectionCard
      id="cat-h"
      title="Spending by category"
      aside={
        <>
          <span className="lg:hidden">Tap for details</span>
          <span className="hidden lg:inline">Click a bar for details</span>
        </>
      }
      className={cn("gap-0.5 px-2 pt-4.5 pb-2.5 lg:px-2.5 lg:pt-5 lg:pb-3", className)}
      headerClassName="px-3 pb-1.5 lg:px-3.5"
    >
      {rows.length === 0 && <p className="px-3 py-4 text-fg-muted">No spending this month yet.</p>}
      {rows.map((row) => {
        const category = row.categoryId === null ? OTHERS : categories.get(row.categoryId)
        const name = category?.name ?? ""
        const amount = formatMoney(row.total, currency)
        const share = `${Math.round((row.total / total) * 100)}%`
        const href =
          row.categoryId === null
            ? `/transactions?month=${month}`
            : `/transactions?month=${month}&category=${row.categoryId}`
        return (
          <Link
            key={row.categoryId ?? "others"}
            to={href}
            aria-label={`${name}, ${amount}, ${share} of spending. Show transactions`}
            className="flex min-h-15 w-full flex-col gap-2 rounded-[16px] px-3 py-2.5 hover:bg-track lg:px-3.5"
          >
            <span className="flex w-full items-center gap-2.5 lg:gap-3">
              <CategoryTile
                category={category}
                className="size-[30px] rounded-sm lg:size-8 lg:rounded-[11px]"
                iconClassName="size-4 lg:size-[17px]"
              />
              <span className="grow font-semibold">{name}</span>
              <span className="num font-semibold">{amount}</span>
              <span className="num w-10 text-right text-fg-muted text-sm lg:w-11">{share}</span>
            </span>
            <span className="block h-2.5 w-full rounded-pill bg-track">
              <span
                className="block h-2.5 rounded-pill bg-(--cat)"
                style={
                  {
                    width: `${(row.total / biggest) * 100}%`,
                    "--cat": `var(--cat-${category?.color ?? "grey"})`,
                  } as CSSProperties
                }
              />
            </span>
          </Link>
        )
      })}
    </SectionCard>
  )
}

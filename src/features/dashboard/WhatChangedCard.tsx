import { ArrowDown, ArrowUp } from "lucide-react"
import { CategoryTile } from "@/components/CategoryTile"
import type { Category } from "@/features/categories/schema"
import { formatMoney } from "@/lib/money"
import { cn } from "@/lib/utils"
import { SectionCard } from "./SectionCard"
import type { whatChanged } from "./stats"

type Props = {
  changes: ReturnType<typeof whatChanged>
  categories: Map<number, Category>
  comparedTo: string
  currency: string
  className?: string
}

export function WhatChangedCard({ changes, categories, comparedTo, currency, className }: Props) {
  return (
    <SectionCard
      id="changed-h"
      title="What changed"
      aside={comparedTo}
      className={cn("gap-1 px-4 pt-4.5 pb-2 lg:px-4.5 lg:pt-5", className)}
      headerClassName="px-1 pb-1.5"
    >
      {changes.length === 0 && (
        <p className="border-divider border-t px-1 py-4 text-fg-muted">
          Spending is the same as last month so far.
        </p>
      )}
      {changes.map((change) => {
        const category = categories.get(change.categoryId)
        const more = change.diff > 0
        return (
          <div
            key={change.categoryId}
            className="box-content flex min-h-15 items-center gap-3 border-divider border-t px-1 py-1.5"
          >
            <CategoryTile category={category} />
            <span className="flex min-w-0 grow flex-col">
              <span className="font-semibold">{category?.name}</span>
              <span className="num text-fg-muted text-sm">
                {formatMoney(change.now, currency)} vs {formatMoney(change.before, currency)}
              </span>
            </span>
            <span
              className={cn(
                "num flex items-center gap-1.5 whitespace-nowrap rounded-pill px-2.5 py-1.5 font-bold text-md",
                more ? "bg-expense-soft text-expense" : "bg-income-soft text-income",
              )}
            >
              {more ? (
                <ArrowUp className="size-3.5" strokeWidth={2.6} aria-hidden />
              ) : (
                <ArrowDown className="size-3.5" strokeWidth={2.6} aria-hidden />
              )}
              {formatMoney(Math.abs(change.diff), currency)} {more ? "more" : "less"}
            </span>
          </div>
        )
      })}
    </SectionCard>
  )
}

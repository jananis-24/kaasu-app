import { ChevronDown, Search, X } from "lucide-react"
import { useCategories } from "@/features/categories/queries"
import { cn } from "@/lib/utils"

type Props = {
  search: string
  onSearchChange: (text: string) => void
  categoryId: number | undefined
  onCategoryChange: (id: number | undefined) => void
}

/** Search box + category picker above the transaction list. */
export function TransactionFilters({
  search,
  onSearchChange,
  categoryId,
  onCategoryChange,
}: Props) {
  const expense = useCategories("out")
  const income = useCategories("in")
  const selected = [...expense, ...income].find((c) => c.id === categoryId)

  return (
    <div className="flex gap-2">
      <label className="glass flex h-12 min-w-0 grow items-center gap-2 rounded-[16px] pr-1 pl-3.5 text-fg-muted focus-within:outline-2 focus-within:outline-fg">
        <Search className="size-[18px] shrink-0" strokeWidth={2.2} aria-hidden />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search notes, categories, amounts"
          aria-label="Search transactions"
          className="h-11 min-w-0 grow bg-transparent text-fg outline-none placeholder:text-fg-muted [&::-webkit-search-cancel-button]:hidden"
        />
        {search && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onSearchChange("")}
            className="flex size-10 shrink-0 items-center justify-center rounded-pill text-fg"
          >
            <X className="size-[18px]" strokeWidth={2.2} aria-hidden />
          </button>
        )}
      </label>

      {/* Styled pill on top, native select underneath does the picking (best picker on phones) */}
      <label
        className={cn(
          "glass relative flex h-12 max-w-[45%] shrink-0 items-center gap-1.5 rounded-[16px] px-3.5 font-semibold",
          selected ? "text-fg" : "text-fg-muted",
        )}
      >
        <span className="truncate">{selected?.name ?? "All categories"}</span>
        <ChevronDown className="size-4 shrink-0" strokeWidth={2.4} aria-hidden />
        <select
          aria-label="Filter by category"
          value={categoryId ?? ""}
          onChange={(event) => onCategoryChange(Number(event.target.value) || undefined)}
          className="absolute inset-0 cursor-pointer opacity-0"
        >
          <option value="">All categories</option>
          <optgroup label="Expense">
            {expense.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Income">
            {income.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </optgroup>
        </select>
      </label>
    </div>
  )
}

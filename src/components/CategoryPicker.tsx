import { Check, Plus } from "lucide-react"
import { Link } from "react-router"
import type { Category, TransactionType } from "@/features/categories/schema"
import { cn } from "@/lib/utils"
import { CategoryTile } from "./CategoryTile"

type Props = {
  categories: Category[]
  value: number | null
  onChange: (id: number) => void
  type: TransactionType
  invalid?: boolean
  errorId?: string
}

/** 5-column grid of category tiles plus a "New" tile that opens the category form. */
export function CategoryPicker({ categories, value, onChange, type, invalid, errorId }: Props) {
  return (
    <div
      className="grid grid-cols-5 gap-1.5"
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? errorId : undefined}
    >
      {categories.map((category) => {
        const selected = category.id === value
        return (
          <button
            key={category.id}
            type="button"
            aria-pressed={selected}
            aria-label={`${category.name}${selected ? ", selected" : ""}`}
            onClick={() => onChange(category.id)}
            className={cn(
              "relative flex flex-col items-center gap-1 rounded-[16px] border-2 border-transparent py-1.5 font-semibold text-xs",
              selected && "border-fg",
            )}
          >
            <CategoryTile category={category} className="size-tap" />
            <span className="w-full truncate px-0.5">{category.name}</span>
            {selected && (
              <span
                aria-hidden
                className="absolute top-0.5 right-1.5 flex size-[18px] items-center justify-center rounded-pill bg-action text-on-action"
              >
                <Check className="size-3" strokeWidth={3} />
              </span>
            )}
          </button>
        )
      })}
      <Link
        to={`/settings/categories?new=${type}`}
        aria-label="New category"
        className="flex flex-col items-center gap-1 rounded-[16px] border-2 border-transparent py-1.5 font-semibold text-xs"
      >
        <span className="flex size-tap items-center justify-center rounded-md border-[1.5px] border-outline border-dashed">
          <Plus className="size-icon" strokeWidth={2} aria-hidden />
        </span>
        New
      </Link>
    </div>
  )
}

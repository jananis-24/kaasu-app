import type { CSSProperties } from "react"
import { CATEGORY_ICONS } from "@/features/categories/icons"
import type { Category } from "@/features/categories/schema"
import { cn } from "@/lib/utils"

type Props = {
  category: Pick<Category, "icon" | "color"> | undefined
  /** Tile size classes, e.g. "size-10 rounded-md". Icon size via iconClassName. */
  className?: string
  iconClassName?: string
}

/** Tinted square with the category's icon (the .cat-tile recipe). */
export function CategoryTile({ category, className, iconClassName }: Props) {
  const Icon = CATEGORY_ICONS[category?.icon ?? "dots"]
  const style = { "--cat": `var(--cat-${category?.color ?? "grey"})` } as CSSProperties
  return (
    <span
      className={cn(
        "cat-tile flex size-tile shrink-0 items-center justify-center rounded-md",
        className,
      )}
      style={style}
      aria-hidden
    >
      <Icon className={cn("size-icon", iconClassName)} strokeWidth={2} />
    </span>
  )
}

"use client"

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Segmented control items (Expense | Income, Light | Dark | System).
// Put them in a <ToggleGroup className="segmented"> for the grey track.
const toggleVariants = cva(
  "group/toggle data-pressed:glass-chip inline-flex h-tap items-center justify-center gap-1.5 whitespace-nowrap rounded-[12px] border border-transparent font-body font-semibold text-base text-fg-muted outline-none transition-colors disabled:pointer-events-none disabled:opacity-50 data-pressed:font-bold data-pressed:text-fg data-pressed:shadow-chip-strong [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: { default: "" },
      size: { default: "px-3" },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

function Toggle({
  className,
  variant = "default",
  size = "default",
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }

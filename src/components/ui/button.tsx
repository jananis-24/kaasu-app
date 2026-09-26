import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Button styles from the design boards. Use these instead of styling buttons by hand.
const buttonVariants = cva(
  "group/button inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap border border-transparent font-body font-bold outline-none transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /** Main action (Save). One per view. */
        default: "bg-action text-on-action",
        /** Second choice next to the main action (Save & add another, Cancel) */
        outline: "border-outline bg-transparent text-fg hover:bg-track",
        /** Confirms something that deletes data (Discard, Move and delete) */
        destructive: "bg-expense text-on-expense",
        /** Text-only red action (Delete in a sheet header) */
        "destructive-ghost": "bg-transparent text-expense hover:bg-expense-soft",
        /** Glass button inside a card (Add category) */
        chip: "glass-chip text-fg",
        /** Plain round icon button (Close) */
        subtle: "bg-track text-fg",
        ghost: "bg-transparent text-fg hover:bg-track",
      },
      size: {
        /** 52px tall, full-width actions at the bottom of sheets and dialogs */
        lg: "h-13 rounded-[18px] px-4 text-base [&_svg:not([class*='size-'])]:size-5",
        /** 44px tall, header and inline buttons */
        default: "h-tap rounded-md px-3 text-base [&_svg:not([class*='size-'])]:size-[18px]",
        /** 44px circle */
        icon: "size-tap rounded-pill [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

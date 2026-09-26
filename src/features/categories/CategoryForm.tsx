import { zodResolver } from "@hookform/resolvers/zod"
import { Check, CircleAlert, Lock, Trash2 } from "lucide-react"
import type { CSSProperties } from "react"
import { useId } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { SheetBody, SheetFooter, SheetHeader } from "@/components/ResponsiveSheet"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { CATEGORY_ICONS, type CategoryIcon } from "./icons"
import { CATEGORY_COLORS, type Category, type CategoryColor, type TransactionType } from "./schema"

const TYPE_NAME = { out: "expense", in: "income" } as const

function categoryFormSchema(others: Category[]) {
  return z
    .object({
      type: z.enum(["in", "out"]),
      name: z.string().trim().min(1, "Give it a name").max(30, "Keep it under 30 characters"),
      icon: z.enum(Object.keys(CATEGORY_ICONS) as [CategoryIcon, ...CategoryIcon[]]),
      color: z.enum(CATEGORY_COLORS),
    })
    .superRefine((values, ctx) => {
      const taken = others.some(
        (c) => c.type === values.type && c.name.toLowerCase() === values.name.trim().toLowerCase(),
      )
      if (taken) {
        ctx.addIssue({
          code: "custom",
          path: ["name"],
          message: `You already have an ${TYPE_NAME[values.type]} category called ${values.name.trim()}`,
        })
      }
    })
}

export type CategoryFormValues = z.infer<ReturnType<typeof categoryFormSchema>>

type Props = {
  /** Given when editing */
  category?: Category
  /** Type for a new category */
  type: TransactionType
  /** Every other category, to catch duplicate names */
  others: Category[]
  onSubmit: (values: CategoryFormValues) => Promise<void>
  onClose: () => void
  onDelete?: () => void
}

/** New / edit category form from the Categories boards (CatAdd, CatEditOther). */
export function CategoryForm({ category, type, others, onSubmit, onClose, onDelete }: Props) {
  const ids = useId()
  const isEdit = Boolean(category)
  const permanent = category?.permanent ?? false
  const usedColors = new Set(others.filter((c) => c.type === type).map((c) => c.color))

  const { register, control, handleSubmit, watch, formState } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema(others)),
    defaultValues: category
      ? { type: category.type, name: category.name, icon: category.icon, color: category.color }
      : {
          type,
          name: "",
          icon: "star",
          color: CATEGORY_COLORS.find((color) => !usedColors.has(color)) ?? "grey",
        },
  })
  const selectedColor = watch("color")
  const nameError = formState.errors.name?.message

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex min-h-0 flex-1 flex-col gap-3.5"
    >
      <SheetHeader
        title={isEdit ? "Edit category" : "New category"}
        onClose={onClose}
        action={
          isEdit &&
          !permanent && (
            <Button
              type="button"
              variant="destructive-ghost"
              onClick={onDelete}
              className="gap-1.5"
            >
              <Trash2 strokeWidth={2.2} />
              Delete
            </Button>
          )
        }
      />

      <SheetBody>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${ids}-name`} className="font-bold text-sm">
            Name
          </label>
          <input
            id={`${ids}-name`}
            disabled={permanent}
            maxLength={30}
            autoComplete="off"
            aria-invalid={Boolean(nameError)}
            aria-describedby={`${ids}-name-msg`}
            className={cn(
              "h-13 rounded-[16px] border-2 border-transparent bg-track px-3.5 font-semibold outline-none focus-visible:border-fg disabled:text-fg-muted",
              nameError && "border-expense focus-visible:border-expense",
            )}
            {...register("name")}
          />
          {nameError && (
            <span
              id={`${ids}-name-msg`}
              className="flex items-center gap-1.5 font-semibold text-expense text-sm"
            >
              <CircleAlert className="size-4" strokeWidth={2.2} aria-hidden />
              {nameError}
            </span>
          )}
          {permanent && (
            <span
              id={`${ids}-name-msg`}
              className="flex items-center gap-1.5 text-fg-muted text-sm"
            >
              <Lock className="size-4 shrink-0" strokeWidth={2.2} aria-hidden />“{category?.name}”
              is permanent. You can change its icon and colour only.
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <span id={`${ids}-type`} className="font-bold text-sm">
            Type
          </span>
          {isEdit ? (
            <span className="flex h-13 items-center justify-between rounded-[16px] bg-track px-3.5">
              <span className="font-semibold">
                {category?.type === "in" ? "Income" : "Expense"}
              </span>
              <span className="text-fg-muted text-sm">Can't change after creating</span>
            </span>
          ) : (
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <ToggleGroup
                  aria-labelledby={`${ids}-type`}
                  spacing={1}
                  className="segmented grid w-full"
                  value={[field.value]}
                  onValueChange={(values) => values[0] && field.onChange(values[0])}
                >
                  <ToggleGroupItem value="out">Expense</ToggleGroupItem>
                  <ToggleGroupItem value="in">Income</ToggleGroupItem>
                </ToggleGroup>
              )}
            />
          )}
        </div>

        <fieldset className="flex min-w-0 flex-col gap-1.5">
          <legend className="pb-1.5 font-bold text-sm">Icon</legend>
          <div className="relative">
            <Controller
              control={control}
              name="icon"
              render={({ field }) => (
                <div className="grid h-[150px] grid-cols-7 content-start gap-[7px] overflow-y-auto pb-8">
                  {(Object.keys(CATEGORY_ICONS) as CategoryIcon[]).map((key) => {
                    const Icon = CATEGORY_ICONS[key]
                    const selected = field.value === key
                    return (
                      <button
                        key={key}
                        type="button"
                        aria-label={key}
                        aria-pressed={selected}
                        onClick={() => field.onChange(key)}
                        style={{ "--cat": `var(--cat-${selectedColor})` } as CSSProperties}
                        className={cn(
                          "flex h-tap items-center justify-center rounded-[13px] border border-transparent bg-track",
                          selected && "cat-tile border-2 border-fg",
                        )}
                      >
                        <Icon className="size-icon" strokeWidth={2} aria-hidden />
                      </button>
                    )
                  })}
                </div>
              )}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-b from-transparent to-surface"
            />
          </div>
          <span className="text-fg-muted text-xs">
            {Object.keys(CATEGORY_ICONS).length} icons · scroll for more
          </span>
        </fieldset>

        <fieldset className="flex min-w-0 flex-col gap-1.5">
          <legend className="pb-1.5 font-bold text-sm">Colour</legend>
          <Controller
            control={control}
            name="color"
            render={({ field }) => (
              <div className="grid grid-cols-6 justify-items-center gap-2">
                {CATEGORY_COLORS.map((color: CategoryColor) => {
                  const selected = field.value === color
                  return (
                    <button
                      key={color}
                      type="button"
                      aria-label={`${color}${selected ? ", selected" : ""}`}
                      aria-pressed={selected}
                      onClick={() => field.onChange(color)}
                      className={cn(
                        "size-tap rounded-pill border-2 border-transparent p-[3px]",
                        selected && "border-fg",
                      )}
                    >
                      <span
                        style={{ "--cat": `var(--cat-${color})` } as CSSProperties}
                        className="flex size-full items-center justify-center rounded-pill bg-(--cat) text-on-action"
                      >
                        {selected && <Check className="size-4" strokeWidth={3} aria-hidden />}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          />
        </fieldset>
      </SheetBody>

      <SheetFooter>
        <Button type="submit" size="lg" className="flex-1" disabled={formState.isSubmitting}>
          {isEdit ? "Save changes" : "Create category"}
        </Button>
      </SheetFooter>
    </form>
  )
}

import { zodResolver } from "@hookform/resolvers/zod"
import { format, parseISO } from "date-fns"
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  CircleAlert,
  Trash2,
  X,
} from "lucide-react"
import { useEffect, useId, useRef } from "react"
import { Controller, useForm } from "react-hook-form"
import { CategoryPicker } from "@/components/CategoryPicker"
import { Button } from "@/components/ui/button"
import { DialogTitle } from "@/components/ui/dialog"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useCategories } from "@/features/categories/queries"
import { todayKey } from "@/lib/dates"
import { currencySymbol, fromMinor } from "@/lib/money"
import { cn } from "@/lib/utils"
import {
  cleanAmountInput,
  type TransactionFormInput,
  type TransactionFormValues,
  transactionFormSchema,
} from "./form-schema"
import type { Transaction } from "./schema"

type Props = {
  /** Given when editing */
  transaction?: Transaction
  currency: string
  onSubmit: (values: TransactionFormValues, addAnother: boolean) => Promise<void>
  onClose: () => void
  onDelete?: () => void
  /** Tells the parent whether closing would lose typed input */
  onDirtyChange: (dirty: boolean) => void
}

/** Add / edit form from the FormPanel board. Used inside TransactionSheet. */
export function TransactionForm({
  transaction,
  currency,
  onSubmit,
  onClose,
  onDelete,
  onDirtyChange,
}: Props) {
  const ids = useId()
  const amountRef = useRef<HTMLInputElement | null>(null)
  const dateRef = useRef<HTMLInputElement | null>(null)
  const isEdit = Boolean(transaction)

  const form = useForm<TransactionFormInput, unknown, TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema(currency)),
    defaultValues: transaction
      ? {
          type: transaction.type,
          amount: String(fromMinor(transaction.amountMinor, currency)),
          categoryId: transaction.categoryId,
          date: transaction.date,
          note: transaction.note,
        }
      : { type: "out", amount: "", categoryId: null, date: todayKey(), note: "" },
  })
  const { register, control, watch, setValue, handleSubmit, formState, reset } = form
  const type = watch("type")
  const date = watch("date")
  const categories = useCategories(type)

  useEffect(() => onDirtyChange(formState.isDirty), [formState.isDirty, onDirtyChange])

  const submit = (addAnother: boolean) =>
    handleSubmit(async (values) => {
      await onSubmit(values, addAnother)
      if (addAnother) {
        // Keep type and date; clear the rest for the next entry.
        reset({ ...values, amount: "", categoryId: null, note: "" })
        amountRef.current?.focus()
      }
    })

  const amountError = formState.errors.amount?.message
  const categoryError = formState.errors.categoryId?.message
  const { ref: amountFieldRef, ...amountField } = register("amount", {
    setValueAs: cleanAmountInput,
  })
  const { ref: dateFieldRef, ...dateField } = register("date")

  return (
    <form
      noValidate
      onSubmit={submit(false)}
      className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto"
    >
      <div className="flex items-center justify-between gap-2">
        <Button type="button" variant="subtle" size="icon" aria-label="Close" onClick={onClose}>
          <X strokeWidth={2.2} />
        </Button>
        <DialogTitle className="font-bold font-display text-[19px]">
          {isEdit ? "Edit transaction" : "Add transaction"}
        </DialogTitle>
        {isEdit ? (
          <Button type="button" variant="destructive-ghost" onClick={onDelete} className="gap-1.5">
            <Trash2 strokeWidth={2.2} />
            Delete
          </Button>
        ) : (
          <span aria-hidden className="w-tap" />
        )}
      </div>

      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <ToggleGroup
            aria-label="Type"
            spacing={1}
            className="segmented grid w-full"
            value={[field.value]}
            onValueChange={(values) => {
              const next = values[0] as TransactionFormValues["type"] | undefined
              if (!next || next === field.value) return
              field.onChange(next)
              setValue("categoryId", null) // categories differ per type
            }}
          >
            <ToggleGroupItem value="out">
              <ArrowUpRight strokeWidth={2.4} />
              Expense
            </ToggleGroupItem>
            <ToggleGroupItem value="in">
              <ArrowDownLeft strokeWidth={2.4} />
              Income
            </ToggleGroupItem>
          </ToggleGroup>
        )}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${ids}-amount`} className="font-bold text-sm">
          Amount
        </label>
        <div
          className={cn(
            "flex h-17 items-center gap-1.5 rounded-[18px] border-2 border-transparent bg-track px-4 focus-within:border-fg",
            amountError && "border-expense focus-within:border-expense",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "font-bold font-display text-[34px]",
              !watch("amount") && "text-fg-muted",
            )}
          >
            {currencySymbol(currency)}
          </span>
          <input
            id={`${ids}-amount`}
            inputMode="decimal"
            autoComplete="off"
            placeholder="0"
            // biome-ignore lint/a11y/noAutofocus: the sheet opens to type an amount, so the keyboard should come up right away
            autoFocus={!isEdit}
            aria-invalid={Boolean(amountError)}
            aria-describedby={amountError ? `${ids}-amount-error` : undefined}
            className="num h-15 min-w-0 grow bg-transparent p-0 font-bold font-display text-[34px] outline-none placeholder:text-fg-muted"
            {...amountField}
            ref={(element) => {
              amountFieldRef(element)
              amountRef.current = element
            }}
          />
        </div>
        {amountError && <FieldError id={`${ids}-amount-error`}>{amountError}</FieldError>}
      </div>

      <fieldset className="flex min-w-0 flex-col gap-2">
        <legend className="pb-2 font-bold text-sm">Category</legend>
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <CategoryPicker
              categories={categories}
              value={field.value}
              onChange={field.onChange}
              type={type}
              invalid={Boolean(categoryError)}
              errorId={`${ids}-category-error`}
            />
          )}
        />
        {categoryError && <FieldError id={`${ids}-category-error`}>{categoryError}</FieldError>}
      </fieldset>

      {/* The row shows the date nicely; the native date input on top of it does the picking. */}
      <label className="relative flex min-h-13 items-center gap-3 rounded-[16px] bg-track px-3.5">
        <CalendarDays className="size-icon" strokeWidth={2} aria-hidden />
        <span className="grow font-bold text-sm">Date</span>
        <span className="font-semibold">
          {date === todayKey() ? "Today" : format(parseISO(date), "d MMM yyyy")}
        </span>
        <ChevronRight className="size-[18px]" strokeWidth={2.2} aria-hidden />
        <input
          type="date"
          required
          className="absolute inset-0 cursor-pointer opacity-0"
          onClick={() => dateRef.current?.showPicker?.()}
          {...dateField}
          ref={(element) => {
            dateFieldRef(element)
            dateRef.current = element
          }}
        />
      </label>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${ids}-note`} className="font-bold text-sm">
          Note <span className="font-normal text-fg-muted">(optional)</span>
        </label>
        <input
          id={`${ids}-note`}
          placeholder="e.g. Swiggy order"
          maxLength={200}
          className="h-13 rounded-[16px] bg-track px-3.5 outline-none placeholder:text-fg-muted focus-visible:outline-2 focus-visible:outline-fg"
          {...register("note")}
        />
      </div>

      <div className="mt-auto flex gap-2.5 pt-1">
        {isEdit ? (
          <Button type="submit" size="lg" className="flex-1" disabled={formState.isSubmitting}>
            Save changes
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1"
              disabled={formState.isSubmitting}
              onClick={submit(true)}
            >
              Save &amp; add another
            </Button>
            <Button type="submit" size="lg" className="flex-1" disabled={formState.isSubmitting}>
              Save
            </Button>
          </>
        )}
      </div>
    </form>
  )
}

function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <span id={id} className="flex items-center gap-1.5 font-semibold text-expense text-sm">
      <CircleAlert className="size-4" strokeWidth={2.2} aria-hidden />
      {children}
    </span>
  )
}

import { ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { formatMoney } from "@/lib/money"
import { cn } from "@/lib/utils"

type Props = { moneyIn: number; moneyOut: number; left: number; currency: string }

/**
 * Mobile: big "Left this month" card on top, money in / out side by side below.
 * Desktop: three equal cards, "Left this month" last.
 */
export function SummaryCards({ moneyIn, moneyOut, left, currency }: Props) {
  return (
    <section aria-label="Month summary" className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-5">
      <div className="glass-hero col-span-2 flex flex-col gap-1 rounded-2xl px-5.5 pt-5.5 pb-5 lg:order-last lg:col-span-1 lg:gap-3 lg:rounded-xl lg:p-5.5">
        <span className="font-semibold lg:flex lg:min-h-8 lg:items-center">Left this month</span>
        <span
          className={cn(
            "num font-bold font-display text-hero leading-[1.1] tracking-[-0.02em] lg:text-3xl lg:leading-[1.4] lg:tracking-normal",
            left < 0 && "text-expense",
          )}
        >
          {formatMoney(left, currency)}
        </span>
        <span className="text-fg-hero-muted text-md lg:hidden">Money in minus money out</span>
      </div>
      <MoneyCard label="Money in" amount={formatMoney(moneyIn, currency, "+")} kind="income" />
      <MoneyCard label="Money out" amount={formatMoney(moneyOut, currency, "-")} kind="expense" />
    </section>
  )
}

function MoneyCard(props: { label: string; amount: string; kind: "income" | "expense" }) {
  const income = props.kind === "income"
  const Icon = income ? ArrowDownLeft : ArrowUpRight
  return (
    <div className="glass flex flex-col gap-2.5 rounded-[22px] p-4 lg:gap-3 lg:rounded-xl lg:p-5.5">
      <span className="flex items-center gap-2 font-semibold text-fg-muted text-md lg:gap-2.5 lg:text-base">
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-sm lg:size-8 lg:rounded-[11px]",
            income ? "bg-income-soft text-income" : "bg-expense-soft text-expense",
          )}
        >
          <Icon className="size-4 lg:size-[18px]" strokeWidth={2.4} aria-hidden />
        </span>
        {props.label}
      </span>
      <span
        className={cn(
          "num font-bold font-display text-xl lg:text-3xl",
          income ? "text-income" : "text-expense",
        )}
      >
        {props.amount}
      </span>
    </div>
  )
}

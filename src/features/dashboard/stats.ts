// Numbers behind the dashboard cards. Plain functions: transactions in, numbers out.
// Rule for all of them: entries dated after today are "upcoming" and don't count yet.

import type { Transaction } from "@/features/transactions/schema"

type Tx = Pick<Transaction, "type" | "amountMinor" | "categoryId" | "date">

const sum = (txs: Tx[]) => txs.reduce((total, tx) => total + tx.amountMinor, 0)
const counted = (txs: Tx[], today: string) => txs.filter((tx) => tx.date <= today)

export function monthTotals(txs: Tx[], today: string) {
  const done = counted(txs, today)
  const moneyIn = sum(done.filter((tx) => tx.type === "in"))
  const moneyOut = sum(done.filter((tx) => tx.type === "out"))
  return { moneyIn, moneyOut, left: moneyIn - moneyOut }
}

/** Spending per category, biggest first */
export function spendingByCategory(txs: Tx[], today: string) {
  const spending = counted(txs, today).filter((tx) => tx.type === "out")
  const groups = Object.groupBy(spending, (tx) => tx.categoryId)
  return Object.entries(groups)
    .map(([categoryId, list]) => ({ categoryId: Number(categoryId), total: sum(list ?? []) }))
    .sort((a, b) => b.total - a.total)
}

/** Top 6 categories, the rest summed into one "Others" row (categoryId null) */
export function topCategories(txs: Tx[], today: string) {
  const all = spendingByCategory(txs, today)
  const top: { categoryId: number | null; total: number }[] = all.slice(0, 6)
  const rest = sum(all.slice(6).map((c) => ({ amountMinor: c.total }) as Tx))
  if (rest > 0) top.push({ categoryId: null, total: rest })
  return top
}

/**
 * The 3 categories whose spending moved most compared with last month.
 * `previous` must already be cut to the same day range (e.g. 1–26 Aug vs 1–26 Sep).
 */
export function whatChanged(current: Tx[], previous: Tx[], today: string) {
  const now = new Map(spendingByCategory(current, today).map((c) => [c.categoryId, c.total]))
  const before = new Map(spendingByCategory(previous, today).map((c) => [c.categoryId, c.total]))
  const ids = new Set([...now.keys(), ...before.keys()])
  return [...ids]
    .map((categoryId) => {
      const nowTotal = now.get(categoryId) ?? 0
      const beforeTotal = before.get(categoryId) ?? 0
      return { categoryId, now: nowTotal, before: beforeTotal, diff: nowTotal - beforeTotal }
    })
    .filter((c) => c.diff !== 0)
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
    .slice(0, 3)
}

/** Spending per day: { "2026-09-05": 186000 } */
export function spendingByDay(txs: Tx[], today: string) {
  const spending = counted(txs, today).filter((tx) => tx.type === "out")
  const groups = Object.groupBy(spending, (tx) => tx.date)
  return Object.fromEntries(Object.entries(groups).map(([day, list]) => [day, sum(list ?? [])]))
}

/**
 * Calendar shade 0–4 for a day, compared with the month's biggest day.
 * Square-root scale so one big rent day doesn't flatten the rest (TokensGlass board).
 */
export function heatLevel(dayTotal: number, biggestDay: number) {
  if (dayTotal <= 0 || biggestDay <= 0) return 0
  const r = Math.sqrt(dayTotal / biggestDay)
  if (r < 0.25) return 1
  if (r < 0.5) return 2
  if (r < 0.75) return 3
  return 4
}

import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"

/** Transactions in a month ("2026-09"). `undefined` while loading. */
export function useMonthTransactions(month: string) {
  return useLiveQuery(
    () => db.transactions.where("date").between(`${month}-01`, `${month}-31`, true, true).toArray(),
    [month],
  )
}

export function useTransaction(id: number | undefined) {
  return useLiveQuery(() => (id ? db.transactions.get(id) : undefined), [id])
}

import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { DEFAULT_SETTINGS } from "./schema"

export function useSettings() {
  return useLiveQuery(() => db.settings.get(1)) ?? DEFAULT_SETTINGS
}

/** Shorthand: most screens only need the currency code */
export function useCurrency() {
  return useSettings().currency
}

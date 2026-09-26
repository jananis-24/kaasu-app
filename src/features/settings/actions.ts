import { db } from "@/lib/db"
import type { Settings } from "./schema"

export function updateSettings(changes: Partial<Omit<Settings, "id">>) {
  return db.settings.update(1, changes)
}

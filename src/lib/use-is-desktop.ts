import { useSyncExternalStore } from "react"

// Same breakpoint as Tailwind's `lg:` (sidebar layout)
const query = window.matchMedia("(min-width: 1024px)")

/** True when the window is desktop-sized; updates when it's resized across 1024px. */
export function useIsDesktop() {
  return useSyncExternalStore(
    (onChange) => {
      query.addEventListener("change", onChange)
      return () => query.removeEventListener("change", onChange)
    },
    () => query.matches,
  )
}

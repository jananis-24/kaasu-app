import { useEffect } from "react"
import { useSettings } from "./queries"

const DARK_QUERY = "(prefers-color-scheme: dark)"
export const APPEARANCE_STORAGE_KEY = "kaasu-appearance"

/**
 * Puts the theme and accent on <html> (data-theme, data-accent) so the CSS tokens switch.
 * Also saves them to localStorage: index.html reads that before React loads, so there is no flash.
 */
export function AppearanceSync() {
  const { theme, accent } = useSettings()

  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY)
    const apply = () => {
      const resolved = theme === "system" ? (media.matches ? "dark" : "light") : theme
      document.documentElement.dataset.theme = resolved
      document.documentElement.dataset.accent = accent
      localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify({ theme: resolved, accent }))
    }
    apply()
    media.addEventListener("change", apply)
    return () => media.removeEventListener("change", apply)
  }, [theme, accent])

  return null
}

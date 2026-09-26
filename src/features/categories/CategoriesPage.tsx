import { ChevronLeft } from "lucide-react"
import { Link, Navigate, useLocation } from "react-router"
import { useIsDesktop } from "@/lib/use-is-desktop"
import { CategoriesPanel } from "./CategoriesPanel"

/** Mobile Categories screen. On desktop, categories live on the Settings page. */
export function CategoriesPage() {
  const location = useLocation()
  if (useIsDesktop())
    return <Navigate to={{ pathname: "/settings", search: location.search }} replace />

  return (
    <div className="flex flex-col gap-3.5 pb-6">
      <div className="flex items-center gap-3">
        <Link
          to="/settings"
          aria-label="Back to Settings"
          className="glass flex size-tap items-center justify-center rounded-pill"
        >
          <ChevronLeft className="size-icon" strokeWidth={2.2} aria-hidden />
        </Link>
        <h1 className="text-[24px]">Categories</h1>
      </div>
      <CategoriesPanel variant="page" />
    </div>
  )
}

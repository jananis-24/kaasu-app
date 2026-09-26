import { LayoutDashboard, List, SlidersHorizontal } from "lucide-react"

export const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", icon: List },
  { to: "/settings", label: "Settings", icon: SlidersHorizontal },
]

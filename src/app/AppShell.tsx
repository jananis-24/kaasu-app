import { Wallet } from "lucide-react"
import { NavLink, Outlet } from "react-router"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import { NAV_ITEMS } from "./nav-items"

/** Page frame: sidebar on desktop (≥1024px), bottom nav on mobile. */
export function AppShell() {
  return (
    <div className="page flex min-h-svh">
      <Sidebar />
      <main className="min-w-0 flex-1 px-4 pt-3 pb-[calc(var(--spacing-bottom-nav)+24px)] lg:flex lg:justify-center lg:px-9 lg:pt-8 lg:pb-10">
        <div className="w-full lg:max-w-content">
          <Outlet />
        </div>
      </main>
      <MobileNav />
      <Toaster />
    </div>
  )
}

function Sidebar() {
  return (
    <nav
      aria-label="Main"
      className="glass sticky top-0 hidden h-svh w-sidebar shrink-0 flex-col gap-7 rounded-none border-y-0 border-l-0 px-4 py-7 shadow-none lg:flex"
    >
      <div className="flex items-center gap-2.5 px-2">
        <span className="glass-chip flex size-9 items-center justify-center rounded-[12px]">
          <Wallet className="size-icon" strokeWidth={2.2} aria-hidden />
        </span>
        <span className="font-bold font-display text-lg">Kaasu</span>
      </div>
      <div className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex h-12 items-center gap-3 rounded-[16px] border border-transparent px-3.5 font-semibold text-fg-muted",
                isActive && "glass-chip font-bold text-fg shadow-chip-strong",
              )
            }
          >
            <Icon className="size-icon" strokeWidth={2.2} aria-hidden />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

function MobileNav() {
  return (
    <nav
      aria-label="Main"
      className="glass-bar fixed inset-x-0 bottom-0 z-40 grid h-bottom-nav grid-cols-3 gap-2 px-3 pt-2 pb-3 lg:hidden"
    >
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            cn(
              "group flex flex-col items-center justify-center gap-1 font-semibold text-fg-muted text-xs",
              isActive && "font-bold text-fg",
            )
          }
        >
          <span className="group-aria-[current=page]:glass-chip flex h-[30px] w-14 items-center justify-center rounded-pill border border-transparent group-aria-[current=page]:shadow-chip-strong">
            <Icon className="size-icon" strokeWidth={2.2} aria-hidden />
          </span>
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

import { createBrowserRouter } from "react-router"
import { CategoriesPage } from "@/features/categories/CategoriesPage"
import { CategoriesPanel } from "@/features/categories/CategoriesPanel"
import { DashboardPage } from "@/features/dashboard/DashboardPage"
import { SettingsPage } from "@/features/settings/SettingsPage"
import { TransactionsPage } from "@/features/transactions/TransactionsPage"
import { AppShell } from "./AppShell"

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "transactions", element: <TransactionsPage /> },
      { path: "settings", element: <SettingsPage aside={<CategoriesPanel variant="card" />} /> },
      { path: "settings/categories", element: <CategoriesPage /> },
    ],
  },
])

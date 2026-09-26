import { createBrowserRouter } from "react-router"
import { DashboardPage } from "@/features/dashboard/DashboardPage"
import { AppShell } from "./AppShell"

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "transactions", element: <h1 className="text-2xl">Transactions</h1> },
      { path: "settings", element: <h1 className="text-2xl">Settings</h1> },
    ],
  },
])

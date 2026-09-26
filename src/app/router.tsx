import { createBrowserRouter } from "react-router"
import { AppShell } from "./AppShell"

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <h1 className="text-2xl">Dashboard</h1> },
      { path: "transactions", element: <h1 className="text-2xl">Transactions</h1> },
      { path: "settings", element: <h1 className="text-2xl">Settings</h1> },
    ],
  },
])

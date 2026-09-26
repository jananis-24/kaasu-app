import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router"
import "@/styles/index.css"
import { AppearanceSync } from "@/features/settings/AppearanceSync"
import { db } from "@/lib/db"
import { router } from "./router"

// Ask the browser not to clear our data when storage runs low. Data only lives on this device.
navigator.storage?.persist?.()
// Open the database early so first-launch setup starts right away.
db.open()

const root = document.getElementById("root")
if (!root) throw new Error("#root missing in index.html")

createRoot(root).render(
  <StrictMode>
    <AppearanceSync />
    <RouterProvider router={router} />
  </StrictMode>,
)

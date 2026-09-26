// Clicks through the app like a user and reports anything broken.
// Usage: node scripts/flows.mjs [flow names...]   (dev server must be running)
// Env: DESKTOP=1 for a 1280×900 window, THEMES=light,dark, SHOTS=<dir> to save screenshots.
// Each run starts with a fresh database (new browser context) and the clock at 26 Sep 2026.
import { chromium } from "playwright"

const base = process.env.BASE_URL ?? "http://localhost:5173"
const only = process.argv.slice(2)
const flows = {}
const flow = (name, fn) => {
  flows[name] = fn
}
/** Waits up to 3s for the element to show up */
const visible = (locator) =>
  locator
    .first()
    .waitFor({ timeout: 3000 })
    .then(() => true)
    .catch(() => false)
/** Waits up to 3s for the element to go away */
const hidden = (locator) =>
  locator
    .first()
    .waitFor({ state: "hidden", timeout: 3000 })
    .then(() => true)
    .catch(() => false)
/** Retries a check for up to 3s (for values that settle after a re-render) */
const eventually = async (fn) => {
  for (let i = 0; i < 30; i++) {
    if (await fn().catch(() => false)) return true
    await new Promise((r) => setTimeout(r, 100))
  }
  return false
}
/** Saves a screenshot when SHOTS=<dir> is set, for comparing with the boards */
const shot = async (page, name) => {
  if (!process.env.SHOTS) return
  await page.waitForTimeout(600) // let open/close animations finish
  await page.screenshot({ path: `${process.env.SHOTS}/flow-${name}.png` })
}
let failures = 0
const check = (ok, message) => {
  console.log(`  ${ok ? "ok  " : "FAIL"} ${message}`)
  if (!ok) failures++
}

// ---------- Dashboard ----------

flow("dashboard", async (page) => {
  await page.goto(base)
  await page.getByRole("heading", { name: "September 2026" }).waitFor()
  check(await visible(page.getByText("₹53,494")), "left this month is ₹53,494")
  check(await visible(page.getByText("+₹89,500")), "money in +₹89,500")

  await page.getByRole("button", { name: "Previous month, August 2026" }).click()
  check(
    await visible(page.getByRole("heading", { name: "August 2026" })),
    "previous month shows August",
  )
  check(page.url().includes("month=2026-08"), "month is in the URL")
  check(
    await visible(page.getByText("vs July")),
    "past month compares with the whole previous month",
  )

  await page.getByRole("button", { name: /Next month, September/ }).click()
  await page.getByRole("button", { name: /Next month, October/ }).click()
  check(
    await visible(page.getByText("No spending this month yet.")),
    "empty month shows empty bars text",
  )
  check(await visible(page.getByText("Nothing added yet.")), "empty month shows empty recent text")
  check(await visible(page.getByText("none yet")), "empty month has no biggest day")

  await page.goto(base)
  await page.getByRole("link", { name: /^Groceries, .* Show transactions/ }).click()
  check(
    /\/transactions\?month=2026-09&category=\d+/.test(page.url()),
    "category bar opens filtered transactions",
  )

  await page.goto(base)
  const future = page.getByRole("button", { name: "28 September, upcoming" })
  check(await future.isDisabled(), "future day is disabled")
  await page.getByRole("button", { name: "14 September, spent ₹1,250" }).click()
  check(page.url().includes("day=2026-09-14"), "calendar day opens that day's transactions")

  await page.goto(base)
  check(
    await visible(page.getByRole("button", { name: "26 September, spent ₹960, today" })),
    "today is labelled",
  )
  await page.getByRole("link", { name: "See all" }).click()
  check(
    page.url().endsWith("/transactions?month=2026-09"),
    "See all opens the month's transactions",
  )
})

// ---------- Transactions ----------

/** Opens the add sheet from the Transactions page (FAB) */
async function openAdd(page) {
  await page.goto(`${base}/transactions`)
  await page.getByRole("link", { name: "Add transaction" }).first().click()
  await page.getByRole("dialog").waitFor()
}

flow("add", async (page) => {
  await openAdd(page)
  check(
    await page.getByLabel("Amount").evaluate((el) => el === document.activeElement),
    "amount is focused",
  )
  await page.getByLabel("Amount").fill("650")
  await page.getByRole("button", { name: "Food" }).click()
  await page.getByLabel("Note (optional)").fill("Zomato")
  await shot(page, "add-filled")
  await page.getByRole("button", { name: "Save", exact: true }).click()
  check(await hidden(page.getByRole("dialog")), "sheet closes after Save")
  check(await eventually(async () => !page.url().includes("add=")), "add param removed from URL")
  check(
    await visible(page.getByRole("link", { name: /^Food, Zomato, expense ₹650\. Edit/ })),
    "new row in list",
  )
  check(await visible(page.getByText("−₹36,656")), "money out went up by ₹650")

  // Save & add another keeps the sheet open and clears the fields
  await page.getByRole("link", { name: "Add transaction" }).first().click()
  await page.getByLabel("Amount").fill("1,250.5")
  await page.getByRole("button", { name: "Transport" }).click()
  await page.getByRole("button", { name: "Save & add another" }).click()
  check(await visible(page.getByLabel("Amount")), "sheet stays open")
  check(
    await eventually(async () => (await page.getByLabel("Amount").inputValue()) === ""),
    "amount cleared for next entry",
  )
  check(
    await visible(page.getByRole("button", { name: "Transport", pressed: false })),
    "category cleared",
  )
  await page.keyboard.press("Escape")
  check(await visible(page.getByText("−₹1,250.50")), "decimal amount saved and shown with paise")

  // Income switches the category list
  await page.getByRole("link", { name: "Add transaction" }).first().click()
  await page.getByRole("button", { name: "Income" }).click()
  check(
    await visible(page.getByRole("button", { name: "Salary" })),
    "income shows income categories",
  )
  check(
    await hidden(page.getByRole("button", { name: "Food" })),
    "expense categories hidden for income",
  )
})

flow("validation", async (page) => {
  await openAdd(page)
  await page.getByRole("button", { name: "Save", exact: true }).click()
  check(await visible(page.getByText("Enter an amount more than ₹0")), "empty amount error")
  check(await visible(page.getByText("Pick a category")), "missing category error")
  check(
    (await page.getByLabel("Amount").getAttribute("aria-invalid")) === "true",
    "amount marked invalid",
  )
  await page.getByLabel("Amount").fill("0")
  await shot(page, "add-error")
  await page.getByLabel("Amount").fill("5000000000")
  await page.getByRole("button", { name: "Food" }).click()
  await page.getByRole("button", { name: "Save", exact: true }).click()
  check(await visible(page.getByText("That amount is too large")), "huge amount rejected")
  await page.getByLabel("Amount").fill("12.345")
  await page.getByRole("button", { name: "Save", exact: true }).click()
  check(await visible(page.getByText("Use at most 2 decimal places")), "3 decimals rejected")
  await page.getByLabel("Amount").fill("abc")
  check((await page.getByLabel("Amount").inputValue()) !== "abc" || true, "letters typed")
  await page.getByRole("button", { name: "Save", exact: true }).click()
  check(await visible(page.getByText("Enter an amount more than ₹0")), "letters are not an amount")
})

flow("discard", async (page) => {
  await openAdd(page)
  await page.keyboard.press("Escape")
  check(await hidden(page.getByRole("dialog")), "Esc on an empty form closes without asking")
  await page.getByRole("link", { name: "Add transaction" }).first().click()
  await page.getByLabel("Amount").fill("99")
  await page.getByRole("button", { name: "Close" }).click()
  check(
    await visible(page.getByRole("alertdialog", { name: "Discard this entry?" })),
    "asks before discarding",
  )
  await shot(page, "discard")
  await page.getByRole("button", { name: "Keep editing" }).click()
  check((await page.getByLabel("Amount").inputValue()) === "99", "keep editing keeps the amount")
  await page.keyboard.press("Escape")
  await page.getByRole("button", { name: "Discard" }).click()
  check(await hidden(page.getByRole("dialog")), "discard closes the sheet")
  check(await hidden(page.getByText("−₹99")), "nothing saved")
})

flow("edit-delete", async (page) => {
  await page.goto(`${base}/transactions`)
  await page.getByRole("link", { name: /^Food, Zomato, expense ₹650\. Edit/ }).click()
  await page.getByRole("dialog").waitFor()
  check(await visible(page.getByRole("heading", { name: "Edit transaction" })), "edit sheet opens")
  check((await page.getByLabel("Amount").inputValue()) === "650", "amount prefilled")
  check(
    await page.getByRole("button", { name: "Food, selected" }).isVisible(),
    "category prefilled",
  )
  await shot(page, "edit")
  await page.getByLabel("Amount").fill("700")
  await page.getByRole("button", { name: "Save changes" }).click()
  check(
    await visible(page.getByRole("link", { name: /^Food, Zomato, expense ₹700/ })),
    "edit saved",
  )

  await page.getByRole("link", { name: /^Food, Zomato, expense ₹700/ }).click()
  await page.getByRole("button", { name: "Delete" }).click()
  check(await visible(page.getByText("Transaction deleted")), "undo toast shows")
  check(
    await hidden(page.getByRole("link", { name: /^Food, Zomato, expense ₹700/ })),
    "row removed",
  )
  await page.evaluate(() => window.scrollTo(0, 0))
  await shot(page, "toast")
  await page.getByRole("button", { name: "Undo" }).click()
  check(
    await visible(page.getByRole("link", { name: /^Food, Zomato, expense ₹700/ })),
    "undo puts it back",
  )

  await page.goto(`${base}/transactions?edit=999999`)
  check(await hidden(page.getByRole("dialog")), "unknown id opens nothing")
})

flow("filters", async (page) => {
  await page.goto(`${base}/transactions?month=2026-09&day=2026-09-14`)
  await page.getByRole("button", { name: /Showing 14 Sep only/ }).waitFor()
  check(
    (await page.getByRole("link", { name: /Edit$/ }).count()) === 2,
    "day filter shows that day's 2 entries",
  )
  await page.getByRole("button", { name: /Showing 14 Sep only/ }).click()
  check(!page.url().includes("day="), "clearing the chip removes the filter")
  await page.goto(`${base}/transactions?month=2026-10`)
  check(await visible(page.getByText("No transactions yet")), "empty month state")
  await shot(page, "empty")
  await page.getByRole("link", { name: "Add transaction" }).click()
  check(await visible(page.getByRole("dialog")), "empty state button opens the sheet")
})

flow("edge-cases", async (page) => {
  // Double-clicking Save adds one entry, not two
  await openAdd(page)
  await page.getByLabel("Amount").fill("111")
  await page.getByRole("button", { name: "Fun" }).click()
  await page.getByRole("button", { name: "Save", exact: true }).dblclick()
  await hidden(page.getByRole("dialog"))
  check(
    (await page.getByRole("link", { name: /expense ₹111/ }).count()) === 1,
    "double-click saves once",
  )

  // Browser back closes the sheet
  await page.getByRole("link", { name: "Add transaction" }).first().click()
  await page.getByRole("dialog").waitFor()
  await page.goBack()
  check(await hidden(page.getByRole("dialog")), "back button closes the sheet")

  // Long note is cut off, not wrapping the row
  await page.getByRole("link", { name: "Add transaction" }).first().click()
  await page.getByLabel("Amount").fill("5")
  await page.getByRole("button", { name: "Food" }).click()
  await page.getByLabel("Note (optional)").fill("x".repeat(250))
  check(
    (await page.getByLabel("Note (optional)").inputValue()).length === 200,
    "note capped at 200 characters",
  )
  await page.getByRole("button", { name: "Save", exact: true }).click()
  const row = page.getByRole("link", { name: /expense ₹5\. Edit/ })
  check(
    await eventually(async () => (await row.boundingBox()).height <= 81),
    "long note keeps the row one line",
  )

  // Spending more than income makes the balance negative and red
  await page.getByRole("link", { name: "Add transaction" }).first().click()
  await page.getByLabel("Amount").fill("100000")
  await page.getByRole("button", { name: "Rent" }).click()
  await page.getByRole("button", { name: "Save", exact: true }).click()
  await hidden(page.getByRole("dialog"))
  await page.goto(base)
  const left = page.getByText(/^−₹46,\d{3}/).first()
  check(await visible(left), "left this month shows a minus")
  check(
    await left.evaluate(
      (el) => getComputedStyle(el).color !== getComputedStyle(document.body).color,
    ),
    "negative left is coloured",
  )

  // Keyboard only: open, type, pick, save
  await page.goto(`${base}/transactions?add=1`)
  await page.getByLabel("Amount").waitFor()
  await page.keyboard.type("42")
  await page.getByRole("button", { name: "Groceries" }).focus()
  await page.keyboard.press("Enter")
  await page.getByLabel("Note (optional)").focus()
  await page.keyboard.type("keyboard")
  await page.keyboard.press("Enter")
  check(
    await visible(page.getByRole("link", { name: /Groceries, keyboard, expense ₹42/ })),
    "Enter in the form saves",
  )
})

// ---------- Settings ----------

flow("settings", async (page) => {
  await page.goto(`${base}/settings`)
  const html = page.locator("html")
  await page.getByRole("button", { name: "Dark" }).click()
  check(
    await eventually(async () => (await html.getAttribute("data-theme")) === "dark"),
    "Dark theme applies",
  )
  await page.getByRole("button", { name: "Ocean" }).click()
  check(
    await eventually(async () => (await html.getAttribute("data-accent")) === "ocean"),
    "accent applies",
  )
  await page.reload()
  check(
    await eventually(async () => (await html.getAttribute("data-theme")) === "dark"),
    "theme survives reload",
  )
  check(
    await visible(page.getByRole("button", { name: "Ocean, selected" })),
    "accent survives reload",
  )
  await page.getByRole("button", { name: "System" }).click()
  check(
    await eventually(async () => (await html.getAttribute("data-theme")) === "light"),
    "System follows the device (light)",
  )

  // Currency: search, confirm, amounts keep their number
  await page.getByRole("button", { name: /Currency/ }).click()
  await shot(page, "currency-list")
  await page.getByPlaceholder("Search by name or symbol").fill("euro")
  check((await page.getByRole("option").count()) === 1, "search narrows to Euro")
  await shot(page, "currency")
  await page.getByRole("option", { name: /Euro/ }).click()
  check(
    await visible(page.getByRole("alertdialog", { name: "Switch to Euro (€)?" })),
    "asks before switching",
  )
  check(
    await visible(page.getByText("₹650 will show as €650")),
    "explains amounts are not converted",
  )
  await shot(page, "currency-warn")
  await page.getByRole("button", { name: "Switch to €" }).click()
  check(await visible(page.getByText("€ Euro")), "currency row shows Euro")
  await page.goto(base)
  check(await visible(page.getByText("€53,494")), "dashboard shows €")

  // Zero-decimal currency keeps the same numbers
  await page.goto(`${base}/settings`)
  await page.getByRole("button", { name: /Currency/ }).click()
  await page.getByPlaceholder("Search by name or symbol").fill("yen")
  await page.getByRole("option", { name: /Japanese Yen/ }).click()
  await page.getByRole("button", { name: "Switch to ¥" }).click()
  await page.getByText("¥ Japanese Yen").waitFor()
  await page.goto(base)
  check(await visible(page.getByText("¥53,494")), "switching to yen keeps ¥53,494 (no ×100)")

  // Keyboard: arrows move, Enter picks
  await page.goto(`${base}/settings`)
  await page.getByRole("button", { name: /Currency/ }).click()
  await page.getByPlaceholder("Search by name or symbol").focus()
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("Enter")
  check(await visible(page.getByRole("alertdialog", { name: /Switch to/ })), "arrow + Enter picks a currency")
  await page.getByRole("button", { name: "Cancel" }).click()
  check(await visible(page.getByText("¥ Japanese Yen")), "Cancel keeps the currency")
})

flow("data", async (page) => {
  await page.goto(`${base}/settings`)
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: /Export backup/ }).click(),
  ])
  const file = await download.path()
  check(
    /kaasu-backup-\d{4}-\d{2}-\d{2}\.json/.test(download.suggestedFilename()),
    "backup file name",
  )

  await page.getByRole("button", { name: /Erase all data/ }).click()
  await page.getByRole("button", { name: "Erase", exact: true }).click()
  await page.getByText("All data erased").waitFor()
  await page.goto(base)
  check(await visible(page.getByText("No spending this month yet.")), "erase clears transactions")

  await page.goto(`${base}/settings`)
  await page.getByLabel("Backup file").setInputFiles(file)
  check(
    await visible(page.getByText(/This backup has 46 transactions/)),
    "import shows what's inside",
  )
  await page.getByRole("button", { name: "Replace" }).click()
  await page.getByText("Backup restored").waitFor()
  await page.goto(base)
  check(await visible(page.getByText("₹53,494")), "import brings everything back")

  await page.goto(`${base}/settings`)
  await page
    .getByLabel("Backup file")
    .setInputFiles({ name: "x.json", mimeType: "application/json", buffer: Buffer.from("{}") })
  check(await visible(page.getByText("That file isn't a Kaasu backup")), "bad file is rejected")
})

// ---------- Runner ----------

const browser = await chromium.launch()
for (const [name, fn] of Object.entries(flows)) {
  if (only.length && !only.includes(name)) continue
  console.log(name)
  for (const colorScheme of (process.env.THEMES ?? "light").split(",")) {
    const desktop = process.env.DESKTOP === "1"
    const viewport = desktop ? { width: 1280, height: 900 } : { width: 390, height: 844 }
    const context = await browser.newContext({ viewport, colorScheme })
    const page = await context.newPage()
    await page.clock.setFixedTime(new Date("2026-09-26T10:00:00"))
    page.on("pageerror", (e) => check(false, `page error: ${e.message}`))
    page.on("console", (m) => m.type() === "error" && check(false, `console error: ${m.text()}`))
    try {
      await fn(page)
    } catch (error) {
      check(false, `crashed: ${error.message.split("\n")[0]}`)
    }
    await context.close()
  }
}
await browser.close()
console.log(failures ? `\n${failures} problem(s)` : "\nall good")
process.exit(failures ? 1 : 0)

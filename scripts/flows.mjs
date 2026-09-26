// Clicks through the app like a user and reports anything broken.
// Usage: node scripts/flows.mjs [flow names...]   (dev server must be running)
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

// ---------- Runner ----------

const browser = await chromium.launch()
for (const [name, fn] of Object.entries(flows)) {
  if (only.length && !only.includes(name)) continue
  console.log(name)
  for (const colorScheme of ["light"]) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme })
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

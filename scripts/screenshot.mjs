// Screenshots app routes for visual checks against the design boards.
// Usage: node scripts/screenshot.mjs <out dir> [route ...]   (dev server must be running)
// Env: BASE_URL (default http://localhost:5173), SIZES=mobile,desktop, THEMES=light,dark, FULL=1 for full page
// Clock is fixed to 26 Sep 2026 10:00 so the sample data matches the boards.
import fs from "node:fs"
import path from "node:path"
import { chromium } from "playwright"

const [outDir, ...routes] = process.argv.slice(2)
const base = process.env.BASE_URL ?? "http://localhost:5173"
const sizes = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1280, height: 900 },
}
const pickedSizes = (process.env.SIZES ?? "mobile,desktop").split(",")
const themes = (process.env.THEMES ?? "light,dark").split(",")

fs.mkdirSync(outDir, { recursive: true })
const browser = await chromium.launch()
for (const size of pickedSizes) {
  for (const theme of themes) {
    const context = await browser.newContext({ viewport: sizes[size], colorScheme: theme })
    const page = await context.newPage()
    await page.clock.setFixedTime(new Date("2026-09-26T10:00:00"))
    page.on("console", (m) => m.type() === "error" && console.log(`  console error: ${m.text()}`))
    page.on("pageerror", (e) => console.log(`  page error: ${e.message}`))
    for (const route of routes.length ? routes : ["/"]) {
      await page.goto(base + route)
      await page.waitForLoadState("networkidle")
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(400)
      const name = `${route.replace(/[/?=&]+/g, "_").replace(/^_|_$/g, "") || "home"}-${size}-${theme}.png`
      await page.screenshot({ path: path.join(outDir, name), fullPage: process.env.FULL === "1" })
      console.log("shot", name)
    }
    await context.close()
  }
}
await browser.close()

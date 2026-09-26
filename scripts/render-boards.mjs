// Renders design-canvas boards (.dc.html) to PNGs so the app can be compared against them.
// Usage: node scripts/render-boards.mjs <canvas project dir> <out dir> [board names...]
// The canvas dir needs support.js (the canvas runtime) next to the boards.
import fs from "node:fs"
import http from "node:http"
import path from "node:path"
import { chromium } from "playwright"

const [boardDir, outDir, ...only] = process.argv.slice(2)
const canvas = JSON.parse(fs.readFileSync(path.join(boardDir, "canvas.json"), "utf8"))
const names = only.length ? only.map((n) => `${n}.dc.html`) : canvas.order

const server = http
  .createServer((req, res) => {
    const file = path.join(boardDir, decodeURIComponent(req.url.split("?")[0]))
    if (!fs.existsSync(file)) {
      res.statusCode = 404
      return res.end()
    }
    res.setHeader("content-type", file.endsWith(".js") ? "text/javascript" : "text/html")
    res.end(fs.readFileSync(file))
  })
  .listen(5199)

fs.mkdirSync(outDir, { recursive: true })
const browser = await chromium.launch()
for (const name of names) {
  const { w, h } = canvas.boards[name]
  const page = await browser.newPage({ viewport: { width: w, height: h } })
  await page.goto(`http://localhost:5199/${name}`)
  await page.waitForLoadState("networkidle")
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(outDir, name.replace(".dc.html", ".png")) })
  await page.close()
  console.log("rendered", name)
}
await browser.close()
server.close()

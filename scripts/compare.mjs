// Pixel diff of two PNGs (app vs design board). Writes a diff image and prints % of pixels that differ.
// Usage: node scripts/compare.mjs <app.png> <board.png> <diff.png>
import fs from "node:fs"
import pixelmatch from "pixelmatch"
import { PNG } from "pngjs"

const [a, b, out] = process.argv.slice(2)
const imgA = PNG.sync.read(fs.readFileSync(a))
const imgB = PNG.sync.read(fs.readFileSync(b))
const width = Math.min(imgA.width, imgB.width)
const height = Math.min(imgA.height, imgB.height)
const crop = (img) => {
  const png = new PNG({ width, height })
  PNG.bitblt(img, png, 0, 0, width, height, 0, 0)
  return png
}
const diff = new PNG({ width, height })
const changed = pixelmatch(crop(imgA).data, crop(imgB).data, diff.data, width, height, { threshold: 0.1 })
fs.writeFileSync(out, PNG.sync.write(diff))
if (imgA.width !== imgB.width || imgA.height !== imgB.height)
  console.log(`size differs: ${imgA.width}x${imgA.height} vs ${imgB.width}x${imgB.height}`)
console.log(`${((changed / (width * height)) * 100).toFixed(2)}% pixels differ (${changed})`)

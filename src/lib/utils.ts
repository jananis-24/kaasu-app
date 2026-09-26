import { createCn } from "cn/config"

/**
 * Joins class names; when two classes set the same thing, the last one wins
 * (cn("size-tile", "size-8") → "size-8"). It has to know our custom token names
 * from styles/tokens/*.css, so add new ones here too.
 */
export const cn = createCn({
  extend: {
    theme: {
      spacing: ["tap", "icon", "icon-sm", "tile", "fab", "bottom-nav", "sidebar"],
      text: ["hero", "md"],
      radius: ["pill"],
      shadow: ["glass", "chip", "chip-strong", "sheet", "dialog", "toast"],
      container: ["content"],
    },
  },
})

// Amounts are stored as whole minor units (paise, cents) to avoid float rounding.

const MINUS = "−" // typographic minus, as in the designs

function fractionDigits(currency: string) {
  return (
    new Intl.NumberFormat("en", { style: "currency", currency }).resolvedOptions()
      .maximumFractionDigits ?? 2
  )
}

// Indian digit grouping (1,00,000) for rupees; the device's locale for everything else.
const localeFor = (currency: string) => (currency === "INR" ? "en-IN" : undefined)

export function toMinor(amount: number, currency: string) {
  return Math.round(amount * 10 ** fractionDigits(currency))
}

export function fromMinor(minor: number, currency: string) {
  return minor / 10 ** fractionDigits(currency)
}

/**
 * ₹53,494 · −₹420 · +₹85,000 · ₹12.50
 * Decimals only show when there are any. `sign` forces a leading + or −.
 */
export function formatMoney(minor: number, currency: string, sign?: "+" | "-") {
  const value = fromMinor(Math.abs(minor), currency)
  const text = new Intl.NumberFormat(localeFor(currency), {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: Number.isInteger(value) ? 0 : undefined,
  }).format(value)
  const prefix = sign === "+" ? "+" : sign === "-" || minor < 0 ? MINUS : ""
  return prefix + text
}

/** "₹", "$", "€" */
export function currencySymbol(currency: string) {
  return (
    new Intl.NumberFormat(localeFor(currency), {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    })
      .formatToParts(0)
      .find((part) => part.type === "currency")?.value ?? currency
  )
}

/** "Indian Rupee" */
export function currencyName(currency: string) {
  return new Intl.DisplayNames(["en"], { type: "currency" }).of(currency) ?? currency
}

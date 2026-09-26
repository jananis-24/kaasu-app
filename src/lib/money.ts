// Amounts are stored as whole minor units (paise, cents) to avoid float rounding.

const MINUS = "−" // typographic minus, as in the designs

/** Decimal places the currency uses: 2 for INR, 0 for JPY, 3 for KWD */
export function fractionDigits(currency: string) {
  return (
    new Intl.NumberFormat("en", { style: "currency", currency }).resolvedOptions()
      .maximumFractionDigits ?? 2
  )
}

// Indian digit grouping (1,00,000) for rupees; English formatting for everything else,
// so symbols stay the same on every device ("A$", "SGD").
const localeFor = (currency: string) => (currency === "INR" ? "en-IN" : "en")

export function toMinor(amount: number, currency: string) {
  return Math.round(amount * 10 ** fractionDigits(currency))
}

export function fromMinor(minor: number, currency: string) {
  return minor / 10 ** fractionDigits(currency)
}

/**
 * ₹53,494 · −₹420 · +₹85,000 · ₹12.50
 * Decimals only show when there are any. `sign` forces a leading + or − (never on zero).
 */
export function formatMoney(minor: number, currency: string, sign?: "+" | "-") {
  const value = fromMinor(Math.abs(minor), currency)
  const text = new Intl.NumberFormat(localeFor(currency), {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(value) ? 0 : undefined,
  }).format(value)
  const prefix = minor === 0 ? "" : sign === "+" ? "+" : sign === "-" || minor < 0 ? MINUS : ""
  return prefix + text
}

/** "₹", "$", "€", "A$", "SGD" */
export function currencySymbol(currency: string) {
  return (
    new Intl.NumberFormat(localeFor(currency), {
      style: "currency",
      currency,
    })
      .formatToParts(0)
      .find((part) => part.type === "currency")?.value ?? currency
  )
}

/** "Indian Rupee" */
export function currencyName(currency: string) {
  return new Intl.DisplayNames(["en"], { type: "currency" }).of(currency) ?? currency
}

import { useState } from "react"
import { ResponsiveSheet, SheetHeader } from "@/components/ResponsiveSheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { currencyName, currencySymbol, formatMoney, toMinor } from "@/lib/money"
import { cn } from "@/lib/utils"
import { changeCurrency } from "./actions"

// Most used first (as on the Settings board), then every other currency A–Z.
const POPULAR = ["INR", "USD", "EUR", "GBP", "AED", "SGD", "AUD", "JPY"]
const CURRENCIES = [
  ...POPULAR,
  ...Intl.supportedValuesOf("currency")
    .filter((code) => !POPULAR.includes(code) && currencyName(code) !== code)
    .sort((a, b) => currencyName(a).localeCompare(currencyName(b))),
]

type Props = { open: boolean; onClose: () => void; current: string }

/** Searchable currency list. Switching asks first, because amounts are not converted. */
export function CurrencyPicker({ open, onClose, current }: Props) {
  const [pending, setPending] = useState<string | null>(null)
  // cmdk always highlights a row; only show it once the user moves with the arrow keys
  const [usingKeys, setUsingKeys] = useState(false)

  const confirm = async () => {
    if (pending) await changeCurrency(current, pending)
    setPending(null)
  }

  return (
    <>
      <ResponsiveSheet
        open={open}
        onOpenChange={(next) => !next && onClose()}
        className="h-[660px] gap-3 pb-5 lg:h-[640px] lg:w-[480px]"
      >
        <SheetHeader title="Currency" onClose={onClose} />
        <Command
          data-keyboard={usingKeys}
          onKeyDown={(event) => event.key.startsWith("Arrow") && setUsingKeys(true)}
          // Match on name, code or symbol ("rupee", "INR", "₹")
          filter={(code, search) => {
            const text = `${currencyName(code)} ${code} ${currencySymbol(code)}`.toLowerCase()
            return text.includes(search.toLowerCase()) ? 1 : 0
          }}
        >
          <CommandInput placeholder="Search by name or symbol" aria-label="Search currencies" />
          <CommandList aria-label="Currencies">
            <CommandEmpty>No currency found.</CommandEmpty>
            {CURRENCIES.map((code, index) => (
              <CommandItem
                key={code}
                value={code}
                data-checked={code === current}
                onSelect={() => {
                  onClose()
                  if (code !== current) setPending(code)
                }}
                className={cn(index > 0 && "rounded-none border-divider border-t")}
              >
                <span className="flex size-tile shrink-0 items-center justify-center rounded-[12px] bg-track font-bold text-sm">
                  {currencySymbol(code)}
                </span>
                <span className="grow font-semibold">{currencyName(code)}</span>
                <span className="text-fg-muted text-sm">{code}</span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </ResponsiveSheet>

      <AlertDialog open={pending !== null} onOpenChange={(next) => !next && setPending(null)}>
        {pending && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Switch to {currencyName(pending)} ({currencySymbol(pending)})?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Existing amounts won't be converted. Only the symbol changes, so{" "}
                {formatMoney(toMinor(650, current), current)} will show as{" "}
                {formatMoney(toMinor(650, pending), pending)}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirm}>
                Switch to {currencySymbol(pending)}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </>
  )
}

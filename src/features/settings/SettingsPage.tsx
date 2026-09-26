import { Check, ChevronRight } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useCategories } from "@/features/categories/queries"
import { currencyName, currencySymbol } from "@/lib/money"
import { cn } from "@/lib/utils"
import { updateSettings } from "./actions"
import { CurrencyPicker } from "./CurrencyPicker"
import { DataSection } from "./DataSection"
import { useSettings } from "./queries"
import { ACCENTS, type Accent, THEMES, type Theme } from "./schema"

const capitalize = (text: string) => text[0]?.toUpperCase() + text.slice(1)

/**
 * Mobile: Appearance, Money (currency + link to categories), Data.
 * Desktop: the same on the left, the category list on the right (`aside`).
 */
export function SettingsPage({ aside }: { aside?: React.ReactNode }) {
  const settings = useSettings()
  const categoryCount = useCategories().length
  const [pickingCurrency, setPickingCurrency] = useState(false)

  return (
    <div className="flex flex-col gap-4 pt-2 pb-6 lg:gap-5 lg:pt-0">
      <h1 className="px-1 pt-2 pb-1 text-2xl tracking-[-0.01em] lg:p-0">Settings</h1>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_1.15fr] lg:items-start lg:gap-6">
        <div className="flex flex-col gap-4 lg:gap-6">
          <section
            aria-labelledby="look-h"
            className="glass flex flex-col gap-3.5 rounded-xl px-4 py-4.5 lg:gap-4 lg:p-5.5"
          >
            <h2 id="look-h" className="text-lg lg:text-[19px]">
              Appearance
            </h2>
            <div className="flex flex-col gap-2">
              <span id="theme-l" className="font-bold text-sm">
                Theme
              </span>
              <ToggleGroup
                aria-labelledby="theme-l"
                spacing={1}
                className="segmented grid w-full"
                value={[settings.theme]}
                onValueChange={(values) => {
                  const theme = values[0] as Theme | undefined
                  if (theme) updateSettings({ theme })
                }}
              >
                {THEMES.map((theme) => (
                  <ToggleGroupItem key={theme} value={theme}>
                    {capitalize(theme)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <fieldset className="flex min-w-0 flex-col gap-2">
              <legend className="flex w-full justify-between pb-2 font-bold text-sm">
                Accent colour{" "}
                <span className="font-semibold text-fg-muted">{capitalize(settings.accent)}</span>
              </legend>
              <div className="grid grid-cols-4 justify-items-center gap-2.5 lg:flex lg:justify-between">
                {ACCENTS.map((accent) => (
                  <AccentButton
                    key={accent}
                    accent={accent}
                    selected={accent === settings.accent}
                    onClick={() => updateSettings({ accent })}
                  />
                ))}
              </div>
            </fieldset>
          </section>

          <section
            aria-labelledby="money-h"
            className="glass flex flex-col rounded-xl px-4 py-2 lg:px-5.5 lg:py-2.5"
          >
            <h2 id="money-h" className="pt-2.5 pb-0.5 text-lg lg:text-[19px]">
              Money
            </h2>
            <button
              type="button"
              onClick={() => setPickingCurrency(true)}
              className="flex min-h-15 items-center gap-3 text-left"
            >
              <span className="grow font-semibold">Currency</span>
              <span className="text-fg-muted">
                {currencySymbol(settings.currency)} {currencyName(settings.currency)}
              </span>
              <ChevronRight className="size-[18px]" strokeWidth={2.2} aria-hidden />
            </button>
            <Link
              to="/settings/categories"
              className="flex min-h-15 items-center gap-3 border-divider border-t lg:hidden"
            >
              <span className="grow font-semibold">Manage categories</span>
              <span className="text-fg-muted">{categoryCount} categories</span>
              <ChevronRight className="size-[18px]" strokeWidth={2.2} aria-hidden />
            </Link>
          </section>

          <DataSection />
        </div>

        {aside && <div className="hidden lg:block">{aside}</div>}
      </div>

      <CurrencyPicker
        open={pickingCurrency}
        onClose={() => setPickingCurrency(false)}
        current={settings.currency}
      />
    </div>
  )
}

function AccentButton(props: { accent: Accent; selected: boolean; onClick: () => void }) {
  const name = capitalize(props.accent)
  return (
    <button
      type="button"
      aria-label={`${name}${props.selected ? ", selected" : ""}`}
      aria-pressed={props.selected}
      onClick={props.onClick}
      className={cn(
        "size-12 rounded-pill border-2 border-transparent p-[3px] lg:size-tap",
        props.selected && "border-fg",
      )}
    >
      <span
        data-accent={props.accent}
        className="flex size-full items-center justify-center rounded-pill accent-swatch"
      >
        {props.selected && <Check className="size-[18px]" strokeWidth={3} aria-hidden />}
      </span>
    </button>
  )
}

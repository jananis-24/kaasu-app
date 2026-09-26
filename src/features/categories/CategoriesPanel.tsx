import { Plus } from "lucide-react"
import { useState } from "react"
import { Link, useLocation } from "react-router"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { CategoryList } from "./CategoryList"
import { useCategories, useEntryCounts } from "./queries"
import type { TransactionType } from "./schema"

/**
 * Expense / Income tabs with the category list.
 * "page": mobile Categories screen (separate cards, big Add button below).
 * "card": desktop Settings, everything in one glass card with the Add button in the header.
 */
export function CategoriesPanel({ variant }: { variant: "page" | "card" }) {
  const [type, setType] = useState<TransactionType>("out")
  const expense = useCategories("out")
  const income = useCategories("in")
  const counts = useEntryCounts()
  const location = useLocation()
  const addParams = new URLSearchParams(location.search)
  addParams.set("newCategory", type)
  const card = variant === "card"

  const addLink = (
    <Link
      to={{ search: addParams.toString() }}
      className={cn(
        "glass-chip flex items-center justify-center gap-2 font-bold",
        card ? "h-tap rounded-[14px] px-4" : "h-13 rounded-[18px] shadow-glass backdrop-blur-xl",
      )}
    >
      <Plus className={card ? "size-[18px]" : "size-5"} strokeWidth={2.6} aria-hidden />
      Add category
    </Link>
  )

  return (
    <section
      aria-labelledby={card ? "cat-panel-h" : undefined}
      aria-label={card ? undefined : "Categories"}
      className={cn("flex flex-col", card ? "glass gap-3 rounded-xl p-5.5" : "gap-3.5")}
    >
      {card && (
        <div className="flex items-center justify-between gap-3">
          <h2 id="cat-panel-h" className="text-[19px]">
            Categories
          </h2>
          {addLink}
        </div>
      )}
      <Tabs
        value={type}
        onValueChange={(value) => setType(value as TransactionType)}
        className={card ? "gap-3" : ""}
      >
        <TabsList aria-label="Category type" className={cn(!card && "glass shadow-none")}>
          <TabsTrigger value="out">Expense · {expense.length}</TabsTrigger>
          <TabsTrigger value="in">Income · {income.length}</TabsTrigger>
        </TabsList>
        {(["out", "in"] as const).map((tab) => (
          <TabsContent
            key={tab}
            value={tab}
            aria-label={tab === "out" ? "Expense categories" : "Income categories"}
            className={cn("flex flex-col", !card && "glass rounded-[22px] pr-2 pl-1")}
          >
            <CategoryList categories={tab === "out" ? expense : income} counts={counts} />
          </TabsContent>
        ))}
      </Tabs>
      {!card && addLink}
    </section>
  )
}

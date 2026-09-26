import type { Category } from "./schema"

type NewCategory = Omit<Category, "id">

export const DEFAULT_CATEGORIES: NewCategory[] = [
  { type: "out", name: "Food", icon: "utensils", color: "orange", permanent: false, order: 0 },
  { type: "out", name: "Transport", icon: "bus", color: "blue", permanent: false, order: 1 },
  { type: "out", name: "Groceries", icon: "basket", color: "olive", permanent: false, order: 2 },
  { type: "out", name: "Bills", icon: "bolt", color: "amber", permanent: false, order: 3 },
  { type: "out", name: "Shopping", icon: "bag", color: "pink", permanent: false, order: 4 },
  { type: "out", name: "Rent", icon: "home", color: "violet", permanent: false, order: 5 },
  { type: "out", name: "Fun", icon: "star", color: "teal", permanent: false, order: 6 },
  { type: "out", name: "Health", icon: "heart", color: "plum", permanent: false, order: 7 },
  { type: "out", name: "Other", icon: "dots", color: "grey", permanent: true, order: 8 },
  { type: "in", name: "Salary", icon: "wallet", color: "green", permanent: false, order: 0 },
  { type: "in", name: "Other", icon: "dots", color: "grey", permanent: true, order: 1 },
]

// Sample entries shown on first launch (from the design boards), placed in the current
// and previous month so every dashboard card has something to show.
// Remove with Settings → Erase all data.

type SampleRow = [day: number, category: string, amount: number, note: string, type?: "in"]

export const THIS_MONTH: SampleRow[] = [
  [1, "Salary", 85000, "Salary credit", "in"],
  [1, "Rent", 15000, "Monthly rent"],
  [2, "Groceries", 2340, "BigBasket monthly order"],
  [2, "Food", 420, "Swiggy · biryani"],
  [3, "Transport", 90, "Auto to office"],
  [4, "Food", 380, "Zomato"],
  [5, "Bills", 1860, "Electricity bill"],
  [6, "Shopping", 2499, "Myntra · kurta"],
  [7, "Transport", 250, "Metro card recharge"],
  [8, "Food", 540, "Zomato · dinner"],
  [9, "Groceries", 1120, "Vegetables & fruits"],
  [10, "Bills", 599, "Broadband"],
  [11, "Food", 310, "Swiggy"],
  [12, "Fun", 800, "Movie tickets"],
  [13, "Transport", 140, "Rapido auto"],
  [14, "Other", 4500, "Freelance payment", "in"],
  [14, "Food", 1250, "Dinner with friends"],
  [15, "Groceries", 1850, "DMart"],
  [16, "Bills", 299, "Mobile recharge"],
  [18, "Food", 460, "Swiggy"],
  [19, "Shopping", 1299, "Amazon · running shoes"],
  [19, "Other", 500, "Gift for cousin"],
  [21, "Food", 720, "Zomato · weekend order"],
  [22, "Transport", 320, "Uber"],
  [23, "Groceries", 980, "Zepto"],
  [24, "Food", 280, "Swiggy"],
  [25, "Transport", 90, "Auto"],
  [25, "Food", 650, "Zomato"],
  [26, "Food", 340, "Swiggy · lunch"],
  [26, "Groceries", 620, "Milk & eggs"],
  [30, "Bills", 4200, "Credit card bill"],
]

export const LAST_MONTH: SampleRow[] = [
  [1, "Salary", 85000, "Salary credit", "in"],
  [1, "Rent", 15000, "Monthly rent"],
  [3, "Groceries", 3400, "BigBasket monthly order"],
  [5, "Food", 1450, "Zomato · dinner"],
  [6, "Transport", 620, "Uber"],
  [8, "Bills", 1990, "Electricity bill"],
  [10, "Shopping", 3499, "Diwali shopping"],
  [12, "Fun", 1400, "Concert tickets"],
  [14, "Groceries", 2100, "DMart"],
  [15, "Bills", 620, "Broadband"],
  [17, "Food", 980, "Swiggy"],
  [19, "Shopping", 1799, "Amazon · headphones"],
  [20, "Transport", 500, "Metro card recharge"],
  [22, "Groceries", 1600, "Zepto"],
  [24, "Food", 820, "Zomato"],
]

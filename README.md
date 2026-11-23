# Kaasu

A personal expense tracker. Log what comes in and what goes out, and see where your money went this month.

**Live demo:** https://kaasu-finance-app.vercel.app

## Features

- **Dashboard:** monthly totals, spending by category, a spending calendar, recent transactions, and what changed compared with last month
- **Transactions:** add, edit and filter income and expenses
- **Categories:** separate income and expense categories, reordered by drag and drop
- **Settings:** currency, light/dark/system theme, back up everything to a JSON file and restore it, erase all data
- **Private by default:** all data stays in your browser (IndexedDB), with no account and no server
- **Works on phone and desktop:** forms open as bottom sheets on mobile and as dialogs on desktop

## Tech

React 19 · TypeScript · Vite · Tailwind CSS · shadcn/ui · React Router · React Hook Form + Zod · Dexie (IndexedDB) · date-fns · dnd-kit

## Run it locally

```bash
pnpm install
pnpm dev
```

Then open the address Vite prints (usually http://localhost:5173).

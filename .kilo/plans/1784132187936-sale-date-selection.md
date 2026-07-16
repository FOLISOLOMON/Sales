# Plan: Allow User to Choose Sale Date

## Context
When recording a sale, `Sales.tsx` currently hardcodes `Sale_Date: getTodayString()`
(`src/pages/Sales.tsx:130`). This is wrong when a user wasn't with the app on the
actual sale day and needs to back-fill past sales. The backend (`api.js addSale`,
`src/services/api.js:121`) simply stores whatever `Sale_Date` value is sent, so this
is a **frontend-only change** — no API/Google Sheets changes needed.

The UI already has a proven pattern for date entry: `Expenses.tsx:191` uses
`<Input type="date" value={form.Expense_Date} onChange=... />`, which we will mirror.

## Decision
- Date field **defaults to today** and is **constrained to today or earlier** (`max=today`)
  so users can select any past date but not future ones.
- This applies only to recording a new sale. The "Assign Customer" sheet is unaffected.

## Changes — `src/pages/Sales.tsx`

1. **Form state** (around `src/pages/Sales.tsx:62`): add `Sale_Date` to the initial
   `form` object:
   ```js
   const [form, setForm] = useState({
     Product_ID: "",
     Quantity_Sold: "1",
     Payment_Method: "Cash",
     Customer_ID: "none",
     Selling_Price: "",
     Sale_Date: getTodayString(),
   })
   ```

2. **`openAdd`** (`src/pages/Sales.tsx:87`): reset the date when opening the sheet so
   it always starts at today:
   ```js
   setForm({
     Product_ID: "",
     Quantity_Sold: "1",
     Payment_Method: "Cash",
     Customer_ID: "none",
     Selling_Price: "",
     Sale_Date: getTodayString(),
   })
   ```

3. **New date field** in the "Record New Sale" form (place it, e.g., right after the
   Product select, mirroring `Expenses.tsx:189-192`):
   ```jsx
   <div>
     <Label htmlFor="sale-date">Sale Date</Label>
     <Input
       id="sale-date"
       type="date"
       max={getTodayString()}
       value={form.Sale_Date}
       onChange={(e) => setForm({ ...form, Sale_Date: e.target.value })}
     />
   </div>
   ```

4. **Validation in `handleSubmit`** (`src/pages/Sales.tsx:98`): add a guard before
   building `saleData` (date input can be cleared):
   ```js
   if (!form.Sale_Date) {
     toast.error("Please select a sale date")
     return
   }
   ```

5. **Use the selected date** (`src/pages/Sales.tsx:130`): replace
   `Sale_Date: getTodayString()` with `Sale_Date: form.Sale_Date`.

## Validation / Rollout
- `getTodayString` is already imported (`src/pages/Sales.tsx:38`) — no new imports.
- The date is already normalized downstream by `normalizeDateString`
  (`src/utils/formatters.js:34`) used by Dashboard, Reports, and the sales list, so
  filtering/sorting by the chosen past date works without further changes.
- Manual test: run `npm run dev`, open Sales, add a sale, change the date to a past
  day, confirm it saves with that date and appears under the correct day in the list
  and Dashboard. Confirm the date picker cannot go beyond today.
- Run `npm run lint` (and `npm run typecheck` / `npm run build` if configured) to
  confirm no regressions.

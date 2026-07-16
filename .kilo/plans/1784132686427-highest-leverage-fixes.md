# Plan: Highest-leverage fixes — API error states, dead code, sale void/refund

## Context

**Veloura Manager** is a React/Vite/TS PWA (Tailwind v4 + shadcn/ui + React Query + Recharts) backed by **Google Sheets via a Google Apps Script** (`src/services/api.js`, `API_URL`). IndexedDB is only an offline mutation queue (`src/lib/syncManager.ts`); Sheets is the source of truth.

Three fragilities exist today:

1. **Silent data loss.** `parseJsonSafely` (`api.js:12-45`) returns `null` on *any* failure, and every getter does `(await apiCall(...)) || []`. A quota error, a script bug, or a bad `API_URL` (there is an **uncommitted `API_URL` swap** in the working tree right now) all render as **"no data"** with no error UI. The owner cannot distinguish "truly empty" from "API broken."
2. **Dead code.** `getDashboard()` (`api.js:170-173`) has an unreachable second `return`.
3. **No sale correction.** Once a sale is recorded there is no way to void/refund it, so stock and revenue stay wrong after a mistake.

Pages (`Sales/Dashboard/Customers/Products/Expenses/Reports`) destructure only `isLoading`/`data` from their queries — there is **no `isError`/retry path**. `AppShell.tsx:10` already shows an offline banner, but that is for connectivity, not API failures.

## Goal

- Stop swallowing API errors: surface them as retryable error states.
- Remove dead code.
- Add sale void/refund that reverses stock.

## Decisions (resolved)

- **Throw instead of return `null`.** Convert `parseJsonSafely` to throw a typed `ApiError`. This is backwards-compatible: `useQuery` captures the throw as `isError`, and pages already default `data` to `[]`, so nothing crashes during the transition.
- **Error UI must not regress offline.** Condition the error UI on `isError && items.length === 0`. When offline with cached data, React Query still provides `data`, so the cached list keeps rendering (with the existing offline banner). Only when there is nothing to show do we render `DataError`.
- **Void = mark + restock.** `voidSale` sets `Status = "Voided"` and adds `Quantity_Sold` back to the product's `Stock_Quantity`. Idempotent by `Sale_ID`. Refund notes/amounts are **out of scope** for this pass.
- **Voided sales excluded from totals** is a separate follow-up (noted under Open Questions), not in this plan.

---

## Task A — Throw typed `ApiError` on failure (`src/services/api.js`)

Add an exported `ApiError` class. Change `parseJsonSafely` to `throw` (HTTP fail / HTML / non-JSON) instead of returning `null`. Change `apiCall` and `apiPost` to wrap network exceptions in `ApiError` (preserve `isNetwork`/`isConfig` flags) instead of returning `null`.

```js
export class ApiError extends Error {
  constructor(message, info = {}) {
    super(message)
    this.name = "ApiError"
    Object.assign(this, info) // { status, isNetwork, isHtml, isConfig, detail }
  }
}
```

- Keep getters like `getSales()` as `return (await apiCall("getSales")) || []`. On failure they now throw; `useQuery` sets `isError`.
- No page currently throws, so this change is safe to land alone; pages keep rendering empty until Task B adds UI.

## Task B — Error + Retry UI on every data page

1. **New component** `src/components/DataError.tsx` — centered icon, message, and a **Retry** button calling the passed `onRetry`.
2. **Per page**, pull `isError` + `refetch` from each query, combine into `isError` and `retryAll`, and render `DataError` only when there is nothing to show:

```tsx
const { data: sales = [], isLoading: salesLoading, isError: salesError, refetch: refetchSales } = useSales()
// ... same for the other queries the page uses
const isError = salesError || productsError || customersError || settingsError
const retryAll = () => { refetchSales(); refetchProducts(); refetchCustomers(); refetchSettings() }
// JSX:
{loading ? <Skeletons/> : (isError && items.length === 0) ? <DataError onRetry={retryAll}/> : (items.length === 0 ? <Empty/> : <List/>)}
```

Apply to: `Sales.tsx`, `Dashboard.tsx`, `Customers.tsx`, `Products.tsx`, `Expenses.tsx`, `Reports.tsx` (each already imports multiple queries; expose `isError`/`refetch` from each and combine). `items` = the array currently used for the list (e.g. `sales`, `filteredSales`, `products`, `expenses`, `customers`).

Keep the **offline banner** in `AppShell.tsx` as-is — it is for connectivity, this is for API failures while online.

## Task C — Remove dead code (`src/services/api.js`)

- Confirm `grep -r getDashboard` has no importers. Delete the unreachable second `return` in `getDashboard()` (`api.js:172`); if fully unused, delete the whole function.

## Task D — Sale void / refund (frontend + external Apps Script)

**Backend (Google Apps Script — external, not in repo):**
- Add a `voidSale` action: find the Sales row by `Sale_ID`, set `Status = "Voided"`, and add `Quantity_Sold` back to that product's `Stock_Quantity` (read product row → increment → write back). Return the updated sale row. Idempotent by `Sale_ID`.

**Frontend:**
- `src/services/api.js`: `export async function voidSale(saleId) { return apiPost("voidSale", { Sale_ID: saleId }) }`.
- `src/hooks/useQueries.ts`: `useVoidSale` — online → `voidSale`; offline → `enqueueMutation("void-sale", { Sale_ID: saleId })`; on success invalidate `sales` + `products`; optimistic update sets `sale.Status = "Voided"`.
- `src/lib/syncManager.ts`: add `"void-sale": voidSale` to `mutationHandlers` and import it.
- `src/pages/Sales.tsx`: add a **Void** action on each sale card (disabled for pending/`temp-` sales and already-voided sales). Reuse the existing `AlertDialog` confirmation pattern → `useVoidSale.mutateAsync(sale.Sale_ID)`. Render a "Voided" badge / strikethrough when `sale.Status === "Voided"`.

---

## Validation

1. `npm run typecheck` and `npm run build` pass.
2. **Error path:** point `API_URL` at a bad/old deployment (or stop the script) → pages show `DataError` + Retry (not empty lists); Retry recovers when the script returns.
3. **Offline still works:** go offline with cached data → offline banner shows AND the cached list still renders (error UI does **not** replace cached data). Offline + no cache → `DataError`.
4. **Dead code:** `grep getDashboard` returns no importers; build succeeds.
5. **Void:** record a sale (stock drops); Void it → stock restored, card shows "Voided", action disabled afterward; sync/invalidate refreshes totals.

## Risks / open questions

- **Backend is external** — Task D's `voidSale` requires editing the Google Apps Script (`API_URL`). If column names differ (e.g. `Status` vs `Is_Voided`), adapt. Verify stock increment matches the product key used by `addSale`/`updateProduct`.
- **`API_URL` swap is uncommitted** — confirm the new deployment is the one with the `voidSale` action and `Customer_ID` fixes before relying on it; the validation step #2 is the fastest way to catch a broken deployment.
- **Voided sales in totals** — Dashboard/Reports revenue & profit still count voided sales until a follow-up filters `Status === "Voided"`. Intentionally deferred from this plan; flag it when implementing totals work.
- **Migration of cached `null`s** — none; React Query cache simply re-fetches and now surfaces errors correctly.

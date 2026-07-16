# Fix Top-Bar "Add" Button → Global FAB + Bottom Nav Background

## Context
The user wants the per-page "Add" (+) button (currently in the top-right of each page header, e.g. `Products.tsx:155`, `Sales.tsx:209`, `Customers.tsx:132`, `Expenses.tsx:117`) moved into a single **Floating Action Button (FAB)** placed just **above the bottom nav bar**. They also want the **bottom nav background** to match the top bar — a solid dark "bark"-colored (`--card`) background with blur, instead of the current fully-transparent nav.

Requirements confirmed with user:
- FAB is **context-aware by route** (opens the correct page's add flow).
- Bottom nav background = `bg-card/80 + backdrop-blur-xl + top border` (same as top bar, `AppShell.tsx:92`).
- Keep the existing top-bar "More" (3-dot) button unchanged.

## Current Behavior (verified)
- Top bar (`AppShell.tsx:90-106`): title left, "More" ghost button right → opens secondary Sheet. No Add button.
- Per-page Add buttons: each page renders its own `<Button size="icon"><Plus/></Button>` in a top-right header row, opening a page-local Sheet with that page's form/state/mutations.
- Bottom nav (`BottomNav.tsx:74-83`): `<nav>` + inner `<div>` have **no background** (fully transparent over content).
- Theme (`index.css`): `--card: oklch(0.205 0 0)` (charcoal). No literal "bark" color — user means this charcoal card color.

## Approach
Introduce a tiny **AddAction context** so each page registers its existing `openAdd` handler (and an optional label) with `AppShell`. `AppShell` renders ONE global FAB above the bottom nav that calls the active page's handler. This keeps all form logic/state where it is (lowest risk) and makes the FAB context-aware automatically by route. Pages without an add flow (Dashboard `/`, Reports) don't register → FAB hidden there.

## Implementation Steps

### 1. Add Action context (`AppShell.tsx`)
- Add an `AddActionContext` with `{ label?: string; onAdd?: () => void }` and a `useRegisterAddAction(label, onAdd)` hook (or a `setAddAction` callback in the existing `PageTitleContext` / a new one).
- Provider value exposes `setAddAction` so page effects can register/unregister on mount/unmount and on label change.
- Make sure to reset to `undefined` on page unmount so the FAB hides when no add flow exists.

### 2. Render global FAB in `AppShell.tsx`
- Add a fixed-position FAB just above the bottom nav (e.g. `fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] z-50 flex justify-center pointer-events-none`, inner button `pointer-events-auto`).
- Button: `size-14 rounded-full bg-primary text-primary-foreground shadow-lg` with `Plus` icon, `whileTap` scale animation, `aria-label` from registered label (default "Add").
- Only render when `onAdd` is defined. On click → call `onAdd()`.
- Keep `main` bottom padding (`pb-24`) so content isn't hidden behind FAB+nav.

### 3. Register add actions in each page
- `Products.tsx`: call `useRegisterAddAction("Add Product", openAdd)` (keep `openAdd` as-is). Remove the header `<div className="flex items-center justify-between">…<Button><Plus/></Button></div>` block (lines ~153-158).
- `Sales.tsx`: `useRegisterAddAction("Add Sale", openAdd)`. Remove header add button block (lines ~207-212).
- `Customers.tsx`: `useRegisterAddAction("Add Customer", openAdd)`. Remove header add button block (lines ~130-135).
- `Expenses.tsx`: `useRegisterAddAction("Add Expense", () => setSheetOpen(true))`. Remove header add button block (lines ~115-120).
- `Dashboard.tsx` / `Reports.tsx`: no registration → FAB hidden.

### 4. Bottom nav background (`BottomNav.tsx:76`)
- Change the inner container (the `mx-auto flex max-w-md ...` div) to:
  `mx-auto flex max-w-md items-center gap-2 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/70 px-2 py-2 shadow-sm`
- Keep `pb-[calc(0.75rem+env(safe-area-inset-bottom))]` on the `<nav>`. Optionally add a subtle top gradient/fade if desired, but matching top bar (`bg-card/80 backdrop-blur-xl border-b`/`border`) is the confirmed ask.
- Ensure primary nav item active state (`bg-primary`) still reads well on the new surface.

## Files to Change
- `src/components/layout/AppShell.tsx` — AddAction context + provider + FAB rendering.
- `src/components/layout/BottomNav.tsx` — nav surface background.
- `src/pages/Products.tsx`, `src/pages/Sales.tsx`, `src/pages/Customers.tsx`, `src/pages/Expenses.tsx` — register add action, remove local Add button.

## Risks / Notes
- Registration must be tied to component lifecycle (register in effect, clear on cleanup) to avoid a stale handler surfacing on the wrong route.
- Verify FAB does not overlap the bottom nav items; tune the `bottom` offset against the nav's height + safe-area inset.
- The top-bar "More" button is untouched; secondary nav (Expenses/Customers/Settings) still reachable there.

## Validation
- `npm run build` (or the repo's lint/typecheck) passes.
- Manual: on Products tap FAB → Add Product sheet opens; Sales → Add Sale; Customers → Add Customer; Expenses → Add Expense. Dashboard/Reports → no FAB. Bottom nav now shows solid charcoal blurred surface matching top bar.

# Fixed Topbar + Right-Slide More Sheet + Bottom Nav Cleanup

## Goal
Replace per-page scrolling `PageHeader` with a single fixed topbar, move the More toggle into that topbar, change the More sheet to slide from the right, and strip the gray background panel from the bottom nav so only the icon row remains.

## Current State
- Every page renders `<PageHeader title="..." subtitle="...">` at the top of `<Outlet />` content. It scrolls away.
- `BottomNav` contains primary tabs + a floating More button (`MoreHorizontal`) that opens a bottom Sheet with secondary nav items.
- The BottomNav has a visible gray panel: outer `<nav>` uses `bg-card/95 border-t shadow-[...] backdrop-blur-xl`, inner `<div>` uses `bg-background/80 border border-border/60 rounded-[1.25rem]`.
- The More Sheet currently uses `side="bottom"` with `rounded-t-3xl` and a 3-column grid.
- Some pages pass an action button (e.g., Add Product `+`) as `children` to `PageHeader`.

## Proposed Changes

### 1. Introduce `PageTitleContext`
- Create context in `src/components/layout/AppShell.tsx` (or a new `src/components/layout/PageTitleContext.tsx`).
- Shape: `{ title: string; subtitle?: string; setTitle: (title: string, subtitle?: string) => void }`.
- `AppShell` owns the state and provider.

### 2. Add fixed TopBar in `AppShell`
- Fixed, full-width, centered `max-w-md` bar at the top.
- Height ~56px (e.g., `h-14`).
- Left side: title (`font-display`, `text-gold-gradient`) and subtitle (`text-sm text-muted-foreground`).
- Right side: More toggle button (replaces the current FAB).
- Style: glassmorphism (`bg-card/80 backdrop-blur-xl border-b border-border/70`) so it feels premium and doesn't fully occlude content behind it.
- Account for safe area with `pt-safe` on the bar itself.

### 3. Move More Sheet state + Sheet to `AppShell`
- Move `open`/`setOpen` from `BottomNav` to `AppShell`.
- Trigger the Sheet from the TopBar's More button.
- Change Sheet to `side="right"`.
- Adjust inner content from 3-column grid to a single-column list suitable for a right drawer.
- Remove `rounded-t-3xl pb-safe`; use right-drawer appropriate padding.

### 4. Strip BottomNav background panel
- Remove the outer `<nav>` background/border/shadow classes (`bg-card/95 border-t shadow-[...] backdrop-blur-xl`).
- Remove the inner `<div>` background/border/rounded classes (`bg-background/80 border border-border/60 rounded-[1.25rem]`).
- Keep the tab buttons with their active/hover states so the bar remains usable.
- Result: only the icon+text rows float at the bottom with no visible gray panel.

### 5. Remove per-page `PageHeader` and set title via context
- In each page (`Dashboard`, `Products`, `Sales`, `Expenses`, `Customers`, `Reports`, `Settings`):
  - Remove `import { PageHeader }`.
  - Remove `<PageHeader ...>` JSX.
  - Import the `PageTitleContext` and call `setTitle(...)` on mount (and whenever dynamic subtitle changes).
- Any `children` previously passed to `PageHeader` (action buttons like the Add `+`) should be moved to a small inline header directly in the page, e.g.:
  ```jsx
  <div className="flex items-center justify-between gap-3">
    <div /> {/* spacer */}
    <Button size="icon" ...>...</Button>
  </div>
  ```
  This preserves the action button without the scrolling title.

### 6. Adjust main content padding
- `AppShell`'s `<main>` currently uses `pt-safe pb-24`. Increase top padding to account for the fixed TopBar.
- Use `pt-[calc(4rem+env(safe-area-inset-top,0px))] pb-24` (or similar based on final top bar height).

## Files to change
- `src/components/layout/AppShell.tsx` — add context, fixed TopBar, More Sheet (right), content padding
- `src/components/layout/BottomNav.tsx` — remove FAB/More state/Sheet, strip gray backgrounds
- `src/components/layout/PageHeader.tsx` — keep file for now (pages will stop importing it); can be deleted later if unused
- `src/pages/Dashboard.tsx` — remove PageHeader, set title via context
- `src/pages/Products.tsx` — remove PageHeader, set title via context, relocate Add button
- `src/pages/Sales.tsx` — remove PageHeader, set title via context, relocate Add button
- `src/pages/Expenses.tsx` — remove PageHeader, set title via context, relocate Add button
- `src/pages/Customers.tsx` — remove PageHeader, set title via context, relocate Add button
- `src/pages/Reports.tsx` — remove PageHeader, set title via context
- `src/pages/Settings.tsx` — remove PageHeader, set title via context

## Validation
- `npm run typecheck` passes.
- `npm run build` passes.
- Visually confirm: top bar is fixed while scrolling; More button is in top-right; More sheet slides from right; bottom nav has no gray panel behind icons.

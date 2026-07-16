# Premium Design & Animation Plan for Veloura Manager

## Goal
Transform Veloura Manager from a functional but static app into a premium, animated luxury digital product that feels alive and reflects the perfume brand identity.

## Approach
Incremental, file-by-file changes across 4 phases. No breaking changes to existing functionality. All animations respect `prefers-reduced-motion` where applicable.

---

## Phase 1: Foundation (Dependencies + Design Tokens + Shared Components)

### Task 1.1: Install `motion`
- **Add** `motion` to dependencies in `package.json`
- **Run** `npm install`
- **Verify** `npm run typecheck` passes

### Task 1.2: Create motion design tokens
- **Create** `src/lib/motion.ts`
- **Export** spring presets (`soft`, `default`, `bouncy`, `snappy`)
- **Export** duration presets (`fast`, `normal`, `slow`)
- **Export** stagger values (`container`, `item`)
- **Export** `prefersReducedMotion` check

### Task 1.3: Add premium CSS utilities
- **Edit** `src/index.css`
- **Add** `@keyframes shimmer` for shimmer skeletons
- **Add** `@keyframes slide-up` / `@keyframes slide-down` for sheets
- **Add** `@keyframes float` for ambient orbs
- **Add** `.grain-overlay` utility class
- **Add** `@font-face` or `@import` for `Playfair Display` (display headings) and `Inter` (body) — or use a font provider if already configured
- **Add** `--font-display` and `--font-sans` to `@theme inline`

### Task 1.4: Create `AnimatedCounter` component
- **Create** `src/components/AnimatedCounter.tsx`
- Accepts: `value` (number), `prefix` (string), `suffix` (string), `duration` (number), `className` (string)
- Uses `motion` `useMotionValue` + `useTransform` to animate from 0 to target value on mount
- Respects `prefersReducedMotion` — instant value if reduced motion preferred
- Format numbers with `toLocaleString` and optional prefix/suffix

### Task 1.5: Create `AnimatedCard` wrapper component
- **Create** `src/components/AnimatedCard.tsx`
- Wraps any card in `motion.div` with:
  - `initial={{ opacity: 0, y: 12 }}` → `animate={{ opacity: 1, y: 0 }}`
  - Spring transition using tokens from `src/lib/motion.ts`
  - Hover: `whileHover={{ y: -4, scale: 1.005 }}`
  - Ambient glow div inside (positioned absolute, `opacity-0` → `group-hover:opacity-100`)
- Accepts children and optional `className`, `delay`
- Use this as the standard card wrapper across all pages

### Task 1.6: Upgrade `Skeleton` to shimmer variant
- **Edit** `src/components/ui/skeleton.tsx`
- Add a `shimmer` boolean prop
- When `shimmer={true}`, render a `div` overlay with `animate-[shimmer_1.5s_infinite]` gradient
- Keep default `animate-pulse` as fallback

### Task 1.7: Upgrade `Card` base styles
- **Edit** `src/components/ui/card.tsx`
- Add optional `premium` boolean prop
- When `premium` is true (or always apply as default), add:
  - `border-white/[0.06]` instead of plain `border`
  - `bg-white/[0.03]` with `backdrop-blur-xl`
  - `shadow-sm` → enhanced shadow
  - `transition-all duration-500`
  - Hover: `hover:border-primary/20 hover:shadow-[...]`
- **Decision needed:** Should this be opt-in (`premium` prop) or applied globally? **Recommended: Apply globally** — all cards in this app benefit from the premium treatment.

---

## Phase 2: Layout & Navigation

### Task 2.1: Ambient background in AppShell
- **Edit** `src/components/layout/AppShell.tsx`
- Add fixed, pointer-events-none, `-z-10` div behind content
- Add 2-3 `motion.div` orbs with `animate` looping `x`/`y` keyframes
- Orbs: large blurred circles (`h-96 w-96`, `blur-[100px]`) with very low opacity (`primary/[0.04]`, `chart-3/[0.03]`)
- Add grain overlay div with the `.grain-overlay` class

### Task 2.2: Bottom nav spring animation
- **Edit** `src/components/layout/BottomNav.tsx`
- Wrap `NavLink` content in `motion.div` with `whileTap={{ scale: 0.92 }}`
- Add `layoutId="nav-indicator"` pill behind active tab (animated with spring transition)
- FAB button: add `whileHover={{ scale: 1.08 }}` and `whileTap={{ scale: 0.95 }}`

---

## Phase 3: Page-by-Page Animation Rollout

### Task 3.1: Dashboard — stagger + counters + chart entrance
- **Edit** `src/pages/Dashboard.tsx`
- Wrap stat cards in `motion.div` with `staggerChildren: stagger.item`
- Replace static metric values with `AnimatedCounter`
- Wrap chart containers in `motion.div` with `initial={{ opacity: 0, scaleY: 0 }}` → `animate={{ opacity: 1, scaleY: 1 }}`, `transformOrigin: "bottom"`
- Wrap recent sales list items with staggered `motion.div`
- Upgrade Today's Sales card to use `AnimatedCard`

### Task 3.2: Products — staggered list + sheet spring
- **Edit** `src/pages/Products.tsx`
- Wrap product list in `motion.div` with stagger
- Each product card uses `AnimatedCard` with `delay` prop based on index
- Wrap Sheet in `AnimatedCard` or rely on Sheet's existing animation
- FAB open button spring

### Task 3.3: Sales — staggered list + sheet spring
- **Edit** `src/pages/Sales.tsx`
- Same stagger pattern as Products
- Sale cards use `AnimatedCard`
- Void/Assign buttons micro-interactions

### Task 3.4: Customers — staggered list + expand animation
- **Edit** `src/pages/Customers.tsx`
- Wrap customer cards in `motion.div` stagger
- Expanded section: use `motion.div` with `initial={{ height: 0, opacity: 0 }}` → `animate={{ height: "auto", opacity: 1 }}`
- Avatar initials: add subtle pulse on hover

### Task 3.5: Expenses — staggered list
- **Edit** `src/pages/Expenses.tsx`
- Wrap expense items in stagger
- Summary cards use `AnimatedCounter` for total expenses and net profit

### Task 3.6: Reports — staggered + chart entrance
- **Edit** `src/pages/Reports.tsx`
- Wrap summary cards in stagger with `AnimatedCounter`
- Chart entrance animation (same as Dashboard)
- Sales list staggered

### Task 3.7: Settings — form micro-interactions
- **Edit** `src/pages/Settings.tsx`
- Input focus animations (subtle border glow)
- Save button spring feedback
- Section cards staggered entrance

---

## Phase 4: Shared Components & Polish

### Task 4.1: Toast animation upgrade
- **Edit** `src/App.tsx`
- Upgrade `Toaster` with `classNames.toast: "backdrop-blur-xl border-white/10 shadow-2xl"`
- Consider adding custom toast animation via `toastOptions`

### Task 4.2: PageHeader font upgrade
- **Edit** `src/components/layout/PageHeader.tsx`
- Use `font-display` (Playfair Display) for `h1` title
- Keep subtitle in `font-sans` (Inter)
- Add subtle `animate-in` on mount if not already present

### Task 4.3: Button micro-interactions
- **Edit** `src/components/ui/button.tsx`
- Add `active:scale-95` to all variants for tactile press feedback
- Primary buttons: add subtle glow on hover (`shadow-[0_0_20px_rgba(...)]`)

### Task 4.4: Badge micro-interactions
- **Edit** `src/components/ui/badge.tsx`
- Add subtle scale on hover (`hover:scale-105`)
- Transition for smooth feel

---

## Validation & QA

1. **After each phase**, run `npm run typecheck` and `npm run build`
2. **After Phase 1**, verify `AnimatedCounter` and `AnimatedCard` render correctly on Dashboard
3. **After Phase 3**, verify all 7 pages have entrance animations and interactive feedback
4. **Test on mobile viewport** (max-w-md is the app's constraint) — animations must not cause jank
5. **Test offline mode** — animations must not interfere with `_pendingSync` indicators or offline toasts
6. **Check bundle size** — `motion` adds ~15KB gzipped; acceptable for a premium feel

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| `motion` conflicts with `tw-animate-css` | `motion` handles component animations; `tw-animate-css` handles Radix primitive states. Keep them separate. |
| Animation performance on low-end devices | Use `will-change` sparingly; stick to `transform` and `opacity` only. Test on actual device. |
| Stagger causes layout shift | Use `transform` for all movement; never animate `height`/`width` on lists. |
| Sheet + motion integration | Radix `data-state` attributes already animate. Do not override with motion on Sheet content — use motion only for internal elements. |

## Out of Scope
- Color scheme changes (current gold/charcoal is correct)
- Typography scale changes (only font family upgrade, not sizes)
- Layout restructuring (grid, spacing remains as-is)
- Chart library migration (stay on recharts)

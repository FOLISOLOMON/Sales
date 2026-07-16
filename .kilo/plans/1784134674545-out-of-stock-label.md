# Plan: "Out of stock" label when Stock_Quantity is 0

## Context
Stock quantity is read from the **Products** sheet (via `getProducts`), so no Apps Script change is needed — this is frontend-only labeling/UX. Today, a product with `Stock_Quantity === 0` is treated as "Low" (because `0 <= Low_Stock_Limit`), which is misleading. The owner wants a distinct "Out of stock" state at 0 stock.

Scope (confirmed with user): **Products page + Sales "Record New Sale" product picker — label only.** Sale submission is still blocked by the existing stock check; we are not adding disable/grey-out behavior in the picker.

## Decisions
- `0` is a distinct state, **not** "Low". `isLowStock` must exclude 0.
- "Out of stock" uses the existing `destructive` badge variant (consistent with "Low" and the Dashboard low-stock alert), with an `AlertTriangle`/`PackageX` icon to match current styling.
- No new data, no new API calls, no schema change.

## Affected files
- `src/pages/Products.tsx` — card badge + `Stock:` line.
- `src/pages/Sales.tsx` — product `SelectItem` label (line ~311) + clearer submit-time toast.

## Implementation

### 1. Products.tsx (`src/pages/Products.tsx`)
In the `filtered.map` product card (around line 165–192):
- Compute per-product numeric stock:
  ```ts
  const stockNum = Number(product.Stock_Quantity || 0)
  const isOutOfStock = stockNum === 0
  const isLowStock = stockNum > 0 && stockNum <= lowStockLimit
  ```
  (Replaces the current `const isLowStock = Number(product.Stock_Quantity || 0) <= lowStockLimit` at line 173.)
- Badge (line ~182): render `Out of stock` when `isOutOfStock`, else `Low` when `isLowStock`:
  ```tsx
  {isOutOfStock ? (
    <Badge variant="destructive" className="shrink-0 gap-1 text-[10px]">
      <AlertTriangle className="size-2.5" />
      Out of stock
    </Badge>
  ) : isLowStock ? (
    <Badge variant="destructive" className="shrink-0 gap-1 text-[10px]">
      <AlertTriangle className="size-2.5" />
      Low
    </Badge>
  ) : null}
  ```
- `Stock:` line (line ~192): when out of stock, show the label instead of the number:
  ```tsx
  {isOutOfStock ? (
    <span className="font-medium text-destructive">Out of stock</span>
  ) : (
    <span className="text-muted-foreground">
      Stock: <span className="font-medium text-foreground">{product.Stock_Quantity}</span>
    </span>
  )}
  ```

### 2. Sales.tsx (`src/pages/Sales.tsx`)
- Product picker `SelectItem` (line ~311): swap the suffix:
  ```tsx
  {Number(p.Stock_Quantity || 0) === 0
    ? `${p.Product_Name} (Out of stock)`
    : `${p.Product_Name} (${p.Stock_Quantity} in stock)`}
  ```
- Submit-time stock check (line ~136): keep the guard; make the message explicit at 0:
  ```ts
  if (selectedProduct && quantity > Number(selectedProduct.Stock_Quantity || 0)) {
    toast.error(
      Number(selectedProduct.Stock_Quantity || 0) === 0
        ? "This product is out of stock"
        : `Only ${selectedProduct.Stock_Quantity} in stock`
    )
    return
  }
  ```

## Validation
1. `npm run typecheck` and `npm run build` pass.
2. Set a product's `Stock_Quantity` to `0`:
   - **Products** card shows an "Out of stock" badge and "Out of stock" text (no "Low", no "Stock: 0").
   - A product with `1` (≤ limit) still shows "Low"; a product with `5` shows `Stock: 5`.
3. **Sales → Record New Sale**: the 0-stock product reads `(Out of stock)` in the dropdown; selecting it and completing still triggers the out-of-stock toast.

## Risks / out of scope
- Dashboard `lowStockCount` (line 109) still counts 0-stock items as low — intentional, unchanged.
- No change to the Apps Script, offline sync, or totals. (Excluding voided sales from totals remains a separate deferred task.)
- Not blocking/disabling out-of-stock items in the Sales picker (user chose label-only).

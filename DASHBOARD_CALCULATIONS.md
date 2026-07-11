# Dashboard calculations

This file explains how the dashboard totals are derived.

## 1. Today’s sales and profit
- The dashboard reads all sales from the sales query.
- Each sale is normalized to a plain date string using the shared formatter helper.
- Today’s sales are the sales whose normalized date matches the current day.
- Today’s sales total is the sum of each sale’s Total_Amount.
- Today’s profit total is the sum of each sale’s Profit.

## 2. Monthly revenue and profit
- Monthly revenue is calculated from all sales in the current calendar month.
- Monthly profit is calculated from the same set of sales using the Profit field.
- The comparison uses the current year and current month from the device date.

## 3. Stock value
- Stock value is calculated as:
  - stock quantity × selling price for each product
- The dashboard displays the total of all products.

## 4. Low stock alert
- The low stock count is the number of products whose stock quantity is less than or equal to the configured low-stock limit.

## 5. Trend chart
- The weekly trend uses the last 7 days including today.
- Each day aggregates sales and profit from all sales that match that day’s normalized date.

## 6. Best sellers chart
- Best sellers are computed from sales data by grouping products and summing sold quantities.
- The chart shows the top products ranked by total units sold.

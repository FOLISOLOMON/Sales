// ============================================================
// VELOURA MANAGER - UTILITY FUNCTIONS
// ============================================================

export function formatCurrency(amount, currency = "$") {
  const value = Number(amount) || 0
  return `${currency}${value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

export function formatDate(dateStr) {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatShortDate(dateStr) {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export function getTodayString() {
  return new Date().toISOString().split("T")[0]
}

export function isToday(dateStr) {
  return dateStr === getTodayString()
}

export function isThisWeek(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const weekAgo = new Date(now)
  weekAgo.setDate(now.getDate() - 7)
  return date >= weekAgo && date <= now
}

export function isThisMonth(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
}

export function isInRange(dateStr, startDate, endDate) {
  const date = new Date(dateStr)
  const start = new Date(startDate)
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)
  return date >= start && date <= end
}

export function getLast7Days(sales) {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split("T")[0]
    const daySales = sales.filter((s) => s.Sale_Date === dateStr)
    days.push({
      date: dateStr,
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      sales: daySales.reduce((sum, s) => sum + s.Total_Amount, 0),
      profit: daySales.reduce((sum, s) => sum + s.Profit, 0),
    })
  }
  return days
}

export function getBestSellers(sales, limit = 5) {
  const productMap = {}
  for (const sale of sales) {
    if (!productMap[sale.Product_Name]) {
      productMap[sale.Product_Name] = { name: sale.Product_Name, quantity: 0, revenue: 0 }
    }
    productMap[sale.Product_Name].quantity += sale.Quantity_Sold
    productMap[sale.Product_Name].revenue += sale.Total_Amount
  }
  return Object.values(productMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit)
}

export function getCustomerPurchases(sales, customerId) {
  return sales.filter((s) => s.Customer_ID === customerId)
}

export function getCustomerTotalSpent(sales, customerId) {
  return getCustomerPurchases(sales, customerId).reduce(
    (sum, s) => sum + s.Total_Amount,
    0
  )
}

export function getInitials(name) {
  if (!name) return "?"
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

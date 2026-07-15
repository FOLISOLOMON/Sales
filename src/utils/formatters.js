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

export function normalizeDateString(dateStr) {
  if (!dateStr) return ""

  const value = String(dateStr).trim()
  if (!value) return ""

  const dateOnly = value.split("T")[0]
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
    return dateOnly
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, "0")
  const day = String(parsed.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function getTodayString() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function isToday(dateStr) {
  return normalizeDateString(dateStr) === getTodayString()
}

export function isThisWeek(dateStr) {
  const normalized = normalizeDateString(dateStr)
  if (!normalized) return false

  const date = new Date(normalized)
  const now = new Date()
  const weekAgo = new Date(now)
  weekAgo.setDate(now.getDate() - 7)
  return date >= weekAgo && date <= now
}

export function isThisMonth(dateStr) {
  const normalized = normalizeDateString(dateStr)
  if (!normalized) return false

  const date = new Date(normalized)
  const now = new Date()
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
}

export function isInRange(dateStr, startDate, endDate) {
  const normalized = normalizeDateString(dateStr)
  if (!normalized) return false

  const date = new Date(normalized)
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
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    const dateStr = `${year}-${month}-${day}`
    const daySales = sales.filter((s) => normalizeDateString(s.Sale_Date) === dateStr)
    days.push({
      date: dateStr,
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      sales: daySales.reduce((sum, s) => sum + (Number(s.Total_Amount) || 0), 0),
      profit: daySales.reduce((sum, s) => sum + (Number(s.Profit) || 0), 0),
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
    (sum, s) => sum + (Number(s.Total_Amount) || 0),
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

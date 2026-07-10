// ============================================================
// VELOURA MANAGER - API SERVICE LAYER
// ============================================================
// This file handles all communication with the Google Apps
// Script Web API that connects to Google Sheets.
//
// To connect your Google Sheets backend:
//   1. Deploy your Google Apps Script as a Web App
//   2. Copy the deployment URL (ends with /exec)
//   3. Replace the API_URL value below with your URL
//
// Until the URL is set, all functions return mock data
// so the app is fully functional for development.
// ============================================================

// ─── CONFIGURATION ───────────────────────────────────────────
// Replace this empty string with your Google Apps Script Web App URL
// Example: "https://script.google.com/macros/s/AKfycb.../exec"
const API_URL = "https://script.google.com/macros/s/AKfycbzcGCe10onvvg3ee_9o_pMFbVbOZCcK4sKyVmv6GGJYNT-y-ID1-gtgSHe7jZEN8U3V/exec"


// ─── HELPER: UNIVERSAL API CALL (POST + URLSearchParams to avoid CORS) ─
// Using URLSearchParams sends as application/x-www-form-urlencoded
// This is a "simple request" → NO CORS preflight → params survive GAS redirect
async function apiCall(action, params = {}) {
  console.log(" API CALL:", action, params);

  if (!API_URL) {
    console.warn("⚠️ No API URL - using mock data");
    return null;
  }

  // Build body with URLSearchParams (NOT FormData - that triggers preflight)
  const body = new URLSearchParams();
  body.append("action", action);
  for (const [key, value] of Object.entries(params)) {
    body.append(key, String(value));
  }

  console.log(" Sending POST to:", API_URL);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: body,
      redirect: "follow",
    });

    console.log("📥 Response Status:", response.status);

    const text = await response.text();
    console.log("📦 Raw Response:", text);

    const data = JSON.parse(text);
    console.log("✅ JSON Data:", data);

    return data;

  } catch (error) {
    console.error("❌ API ERROR:", error);
    return null;  // Return null so mock data kicks in
  }
}


// ─── HELPER: POST API CALL (same as apiCall, just aliased) ───────────────
async function apiPost(action, data = {}) {
  console.log("📡 POST API CALL:", action, data);

  if (!API_URL) {
    console.warn("⚠️ No API URL - using mock data");
    return null;
  }

  // Use URLSearchParams (NOT FormData - avoids CORS preflight)
  const body = new URLSearchParams();
  body.append("action", action);
  for (const [key, value] of Object.entries(data)) {
    body.append(key, String(value));
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: body,
      redirect: "follow",
    });

    console.log("📥 Response Status:", response.status);

    const text = await response.text();
    console.log("📦 Raw Response:", text);

    const result = JSON.parse(text);
    console.log("✅ POST Result:", result);

    return result;

  } catch (error) {
    console.error("❌ POST API ERROR:", error);
    return null;  // Return null so mock data kicks in
  }
}

// ─── MOCK DATA ───────────────────────────────────────────────
const mockProducts = [
  { Product_ID: "P001", Product_Name: "Oud Royal", Brand: "Veloura", Category: "Eau de Parfum", Cost_Price: 45, Selling_Price: 120, Stock_Quantity: 12, Date_Added: "2026-06-15" },
  { Product_ID: "P002", Product_Name: "Rose Imperial", Brand: "Veloura", Category: "Eau de Parfum", Cost_Price: 38, Selling_Price: 95, Stock_Quantity: 8, Date_Added: "2026-06-20" },
  { Product_ID: "P003", Product_Name: "Amber Nights", Brand: "Maison Noir", Category: "Eau de Toilette", Cost_Price: 30, Selling_Price: 75, Stock_Quantity: 3, Date_Added: "2026-07-01" },
  { Product_ID: "P004", Product_Name: "Jasmine Gold", Brand: "Veloura", Category: "Eau de Parfum", Cost_Price: 42, Selling_Price: 110, Stock_Quantity: 15, Date_Added: "2026-06-10" },
  { Product_ID: "P005", Product_Name: "Sandalwood Elite", Brand: "Maison Noir", Category: "Attar", Cost_Price: 55, Selling_Price: 140, Stock_Quantity: 2, Date_Added: "2026-07-05" },
  { Product_ID: "P006", Product_Name: "Musk Velvet", Brand: "Veloura", Category: "Eau de Toilette", Cost_Price: 28, Selling_Price: 68, Stock_Quantity: 20, Date_Added: "2026-05-28" },
  { Product_ID: "P007", Product_Name: "Saffron Dream", Brand: "Royal Oud", Category: "Eau de Parfum", Cost_Price: 50, Selling_Price: 130, Stock_Quantity: 6, Date_Added: "2026-06-25" },
  { Product_ID: "P008", Product_Name: "Leather Noir", Brand: "Maison Noir", Category: "Eau de Parfum", Cost_Price: 48, Selling_Price: 125, Stock_Quantity: 1, Date_Added: "2026-07-08" },
]

const mockSales = [
  { Sale_ID: "S001", Product_ID: "P001", Product_Name: "Oud Royal", Quantity_Sold: 2, Selling_Price: 120, Total_Amount: 240, Cost_Total: 90, Profit: 150, Sale_Date: "2026-07-10" },
  { Sale_ID: "S002", Product_ID: "P004", Product_Name: "Jasmine Gold", Quantity_Sold: 1, Selling_Price: 110, Total_Amount: 110, Cost_Total: 42, Profit: 68, Sale_Date: "2026-07-10" },
  { Sale_ID: "S003", Product_ID: "P002", Product_Name: "Rose Imperial", Quantity_Sold: 3, Selling_Price: 95, Total_Amount: 285, Cost_Total: 114, Profit: 171, Sale_Date: "2026-07-09" },
  { Sale_ID: "S004", Product_ID: "P007", Product_Name: "Saffron Dream", Quantity_Sold: 1, Selling_Price: 130, Total_Amount: 130, Cost_Total: 50, Profit: 80, Sale_Date: "2026-07-09" },
  { Sale_ID: "S005", Product_ID: "P006", Product_Name: "Musk Velvet", Quantity_Sold: 4, Selling_Price: 68, Total_Amount: 272, Cost_Total: 112, Profit: 160, Sale_Date: "2026-07-08" },
  { Sale_ID: "S006", Product_ID: "P001", Product_Name: "Oud Royal", Quantity_Sold: 1, Selling_Price: 120, Total_Amount: 120, Cost_Total: 45, Profit: 75, Sale_Date: "2026-07-07" },
  { Sale_ID: "S007", Product_ID: "P004", Product_Name: "Jasmine Gold", Quantity_Sold: 2, Selling_Price: 110, Total_Amount: 220, Cost_Total: 84, Profit: 136, Sale_Date: "2026-07-06" },
  { Sale_ID: "S008", Product_ID: "P003", Product_Name: "Amber Nights", Quantity_Sold: 2, Selling_Price: 75, Total_Amount: 150, Cost_Total: 60, Profit: 90, Sale_Date: "2026-07-05" },
  { Sale_ID: "S009", Product_ID: "P002", Product_Name: "Rose Imperial", Quantity_Sold: 1, Selling_Price: 95, Total_Amount: 95, Cost_Total: 38, Profit: 57, Sale_Date: "2026-07-04" },
  { Sale_ID: "S010", Product_ID: "P007", Product_Name: "Saffron Dream", Quantity_Sold: 2, Selling_Price: 130, Total_Amount: 260, Cost_Total: 100, Profit: 160, Sale_Date: "2026-07-03" },
  { Sale_ID: "S011", Product_ID: "P001", Product_Name: "Oud Royal", Quantity_Sold: 1, Selling_Price: 120, Total_Amount: 120, Cost_Total: 45, Profit: 75, Sale_Date: "2026-07-02" },
  { Sale_ID: "S012", Product_ID: "P006", Product_Name: "Musk Velvet", Quantity_Sold: 3, Selling_Price: 68, Total_Amount: 204, Cost_Total: 84, Profit: 120, Sale_Date: "2026-07-01" },
  { Sale_ID: "S013", Product_ID: "P004", Product_Name: "Jasmine Gold", Quantity_Sold: 1, Selling_Price: 110, Total_Amount: 110, Cost_Total: 42, Profit: 68, Sale_Date: "2026-06-30" },
  { Sale_ID: "S014", Product_ID: "P005", Product_Name: "Sandalwood Elite", Quantity_Sold: 1, Selling_Price: 140, Total_Amount: 140, Cost_Total: 55, Profit: 85, Sale_Date: "2026-06-28" },
  { Sale_ID: "S015", Product_ID: "P008", Product_Name: "Leather Noir", Quantity_Sold: 1, Selling_Price: 125, Total_Amount: 125, Cost_Total: 48, Profit: 77, Sale_Date: "2026-06-25" },
]

const mockExpenses = [
  { Expense_ID: "E001", Expense_Name: "Packaging Materials", Amount: 180, Description: "Luxury gift boxes and bottles", Expense_Date: "2026-07-08" },
  { Expense_ID: "E002", Expense_Name: "Shipping Supplies", Amount: 75, Description: "Postage and courier fees", Expense_Date: "2026-07-05" },
  { Expense_ID: "E003", Expense_Name: "Marketing - Instagram Ads", Amount: 250, Description: "Monthly social media ad budget", Expense_Date: "2026-07-01" },
  { Expense_ID: "E004", Expense_Name: "Ingredient Restock", Amount: 420, Description: "Oud oil and essential oils", Expense_Date: "2026-06-28" },
  { Expense_ID: "E005", Expense_Name: "Storage Unit Rent", Amount: 150, Description: "Monthly storage rental", Expense_Date: "2026-06-15" },
]

const mockCustomers = [
  { Customer_ID: "C001", Customer_Name: "Sophia Laurent", Phone_Number: "+1 555-0101", Location: "New York, NY", Date_Added: "2025-06-01" },
  { Customer_ID: "C002", Customer_Name: "Amira Hassan", Phone_Number: "+1 555-0102", Location: "Los Angeles, CA", Date_Added: "2025-06-10" },
  { Customer_ID: "C003", Customer_Name: "Isabella Chen", Phone_Number: "+1 555-0103", Location: "Chicago, IL", Date_Added: "2025-06-15" },
  { Customer_ID: "C004", Customer_Name: "Olivia Bennett", Phone_Number: "+1 555-0104", Location: "Miami, FL", Date_Added: "2025-06-20" },
  { Customer_ID: "C005", Customer_Name: "Layla Mansour", Phone_Number: "+1 555-0105", Location: "Houston, TX", Date_Added: "2025-07-01" },
]

const mockSettings = {
  Business_Name: "Veloura",
  Currency: "$",
  Owner_Name: "Owner",
  Phone_Number: "+1 555-0000",
  Business_Address: "123 Luxury Ave, Beverly Hills, CA",
  Low_Stock_Limit: "3",
}

// ─── PRODUCTS API ─────────────────────────────────────────────
export async function getProducts() {
  const result = await apiCall("getProducts")
  return result ?? mockProducts
}

export async function addProduct(product) {
  const result = await apiPost("addProduct", product)
  if (result === null) {
    const newProduct = {
      ...product,
      Product_ID: `P${String(mockProducts.length + 1).padStart(3, "0")}`,
    }
    mockProducts.push(newProduct)
    return newProduct
  }
  return result
}

export async function updateProduct(productId, updates) {
  const result = await apiPost("updateProduct", { Product_ID: productId, ...updates })
  if (result === null) {
    const idx = mockProducts.findIndex((p) => p.Product_ID === productId)
    if (idx !== -1) {
      mockProducts[idx] = { ...mockProducts[idx], ...updates }
      return mockProducts[idx]
    }
  }
  return result
}

export async function deleteProduct(productId) {
  const result = await apiPost("deleteProduct", { Product_ID: productId })
  if (result === null) {
    const idx = mockProducts.findIndex((p) => p.Product_ID === productId)
    if (idx !== -1) mockProducts.splice(idx, 1)
    return { success: true }
  }
  return result
}

// ─── SALES API ────────────────────────────────────────────────
export async function getSales() {
  const result = await apiCall("getSales")
  return result ?? mockSales
}

export async function addSale(sale) {
  const result = await apiPost("addSale", sale)
  if (result === null) {
    const newSale = {
      ...sale,
      Sale_ID: `S${String(mockSales.length + 1).padStart(3, "0")}`,
    }
    mockSales.unshift(newSale)

    // Reduce product stock
    const product = mockProducts.find((p) => p.Product_ID === sale.Product_ID)
    if (product) {
      product.Stock_Quantity = Math.max(0, product.Stock_Quantity - sale.Quantity_Sold)
    }

    return newSale
  }
  return result
}

// ─── EXPENSES API ────────────────────────────────────────────
export async function getExpenses() {
  const result = await apiCall("getExpenses")
  return result ?? mockExpenses
}

export async function addExpense(expense) {
  const result = await apiPost("addExpense", expense)
  if (result === null) {
    const newExpense = {
      ...expense,
      Expense_ID: `E${String(mockExpenses.length + 1).padStart(3, "0")}`,
    }
    mockExpenses.unshift(newExpense)
    return newExpense
  }
  return result
}

export async function deleteExpense(expenseId) {
  const result = await apiPost("deleteExpense", { Expense_ID: expenseId })
  if (result === null) {
    const idx = mockExpenses.findIndex((e) => e.Expense_ID === expenseId)
    if (idx !== -1) mockExpenses.splice(idx, 1)
    return { success: true }
  }
  return result
}

// ─── CUSTOMERS API ────────────────────────────────────────────
export async function getCustomers() {
  const result = await apiCall("getCustomers")
  return result ?? mockCustomers
}

export async function addCustomer(customer) {
  const result = await apiPost("addCustomer", customer)
  if (result === null) {
    const newCustomer = {
      ...customer,
      Customer_ID: `C${String(mockCustomers.length + 1).padStart(3, "0")}`,
    }
    mockCustomers.push(newCustomer)
    return newCustomer
  }
  return result
}

export async function updateCustomer(customerId, updates) {
  const result = await apiPost("updateCustomer", { Customer_ID: customerId, ...updates })
  if (result === null) {
    const idx = mockCustomers.findIndex((c) => c.Customer_ID === customerId)
    if (idx !== -1) {
      mockCustomers[idx] = { ...mockCustomers[idx], ...updates }
      return mockCustomers[idx]
    }
  }
  return result
}

export async function deleteCustomer(customerId) {
  const result = await apiPost("deleteCustomer", { Customer_ID: customerId })
  if (result === null) {
    const idx = mockCustomers.findIndex((c) => c.Customer_ID === customerId)
    if (idx !== -1) mockCustomers.splice(idx, 1)
    return { success: true }
  }
  return result
}

// ─── SETTINGS API ────────────────────────────────────────────
export async function getSettings() {
  const result = await apiCall("getSettings")
  return result ?? mockSettings
}

export async function updateSettings(settings) {
  const result = await apiPost("updateSettings", settings)
  if (result === null) {
    Object.assign(mockSettings, settings)
    return { success: true }
  }
  return result
}

// ─── DASHBOARD API ────────────────────────────────────────────
export async function getDashboard() {
  const result = await apiCall("getDashboard")
  if (result) return result

  // Compute dashboard from mock data
  const today = new Date().toISOString().split("T")[0]
  const thisMonth = new Date().toISOString().slice(0, 7)

  const todaySales = mockSales.filter((s) => s.Sale_Date === today)
  const monthSales = mockSales.filter((s) => s.Sale_Date.startsWith(thisMonth))

  const todaySalesTotal = todaySales.reduce((sum, s) => sum + s.Total_Amount, 0)
  const todayProfit = todaySales.reduce((sum, s) => sum + s.Profit, 0)
  const monthRevenue = monthSales.reduce((sum, s) => sum + s.Total_Amount, 0)
  const monthProfit = monthSales.reduce((sum, s) => sum + s.Profit, 0)

  const stockValue = mockProducts.reduce(
    (sum, p) => sum + p.Selling_Price * p.Stock_Quantity,
    0
  )

  const lowStockItems = mockProducts.filter(
    (p) => p.Stock_Quantity <= 3
  ).length

  return {
    today_sales: todaySalesTotal,
    today_profit: todayProfit,
    total_products: mockProducts.length,
    total_stock_value: stockValue,
    low_stock_count: lowStockItems,
    monthly_revenue: monthRevenue,
    monthly_profit: monthProfit,
    total_expenses: mockExpenses.reduce((sum, e) => sum + e.Amount, 0),
    total_profit: mockSales.reduce((sum, s) => sum + s.Profit, 0),
  }
}

export { API_URL }

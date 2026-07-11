// ============================================================
// VELOURA MANAGER - API SERVICE LAYER
// ============================================================
// This file handles all communication with the Google Apps
// Script Web API that connects to Google Sheets.
// ============================================================

// ─── CONFIGURATION ───────────────────────────────────────────
const API_URL = "https://script.google.com/macros/s/AKfycbw7YDrLG5Fzu7Z4vUZ4pA8zfwIWdOPy76hzF2_ltbtT0Oe-1Iej3tgvbTe4dYmTeG4H/exec"

// ─── HELPER: PARSE RESPONSE SAFELY ───────────────────────────
async function parseJsonSafely(response, action) {
  const contentType = response.headers.get("content-type") || ""

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "")
    console.error(
      `[Veloura API] "${action}" failed with HTTP ${response.status} ${response.statusText}`,
      bodyText.substring(0, 300)
    )
    return null
  }

  if (contentType.includes("text/html")) {
    const bodyText = await response.text().catch(() => "")
    const errorMatch = bodyText.match(/<div[^>]*>(.*?)<\/div>/g)
    const errorHtml = errorMatch?.[errorMatch.length - 1] || bodyText.substring(0, 300)
    console.error(
      `[Veloura API] "${action}" returned HTML instead of JSON — your Google Apps Script has an error.`,
      errorHtml.replace(/<[^>]*>/g, "").trim()
    )
    return null
  }

  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch (e) {
    console.error(
      `[Veloura API] "${action}" returned non-JSON response that could not be parsed.`,
      text.substring(0, 300)
    )
    return null
  }
}

// ─── HELPER: API CALL ─────────────────────────────────────────
async function apiCall(action, params = {}) {
  if (!API_URL) return null

  const url = new URL(API_URL)
  url.searchParams.set("action", action)
  
  // Add a cache-buster to prevent mobile browsers from caching failed CORS requests
  url.searchParams.set("_", Date.now()) 
  
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value))
  }

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      redirect: "follow",
      credentials: "omit", // <--- CRITICAL FIX: Prevents mobile browsers from blocking the Google redirect
    })
    return parseJsonSafely(response, action)
  } catch (e) {
    console.error(`[Veloura API] Network error for "${action}":`, e.message)
    return null
  }
}


async function apiPost(action, data = {}) {
  if (!API_URL) return null

  const formData = new FormData()
  formData.append("action", action)
  for (const [key, value] of Object.entries(data)) {
    formData.append(key, String(value))
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
      redirect: "follow",
      credentials: "omit", // <--- CRITICAL FIX: Same fix for POST requests
    })
    return parseJsonSafely(response, action)
  } catch (e) {
    console.error(`[Veloura API] Network error for "${action}":`, e.message)
    return null
  }
}

// ─── PRODUCTS API ─────────────────────────────────────────────
export async function getProducts() {
  // Returns data directly from sheet, or empty array if sheet is empty/error
  return (await apiCall("getProducts")) || []
}

export async function addProduct(product) {
  return await apiPost("addProduct", product)
}

export async function updateProduct(productId, updates) {
  return await apiPost("updateProduct", { Product_ID: productId, ...updates })
}

export async function deleteProduct(productId) {
  return await apiPost("deleteProduct", { Product_ID: productId })
}

// ─── SALES API ────────────────────────────────────────────────
export async function getSales() {
  return (await apiCall("getSales")) || []
}

export async function addSale(sale) {
  return await apiPost("addSale", sale)
}

// ─── EXPENSES API ─────────────────────────────────────────────
export async function getExpenses() {
  return (await apiCall("getExpenses")) || []
}

export async function addExpense(expense) {
  return await apiPost("addExpense", expense)
}

export async function deleteExpense(expenseId) {
  return await apiPost("deleteExpense", { Expense_ID: expenseId })
}

// ─── CUSTOMERS API ────────────────────────────────────────────
export async function getCustomers() {
  return (await apiCall("getCustomers")) || []
}

export async function addCustomer(customer) {
  return await apiPost("addCustomer", customer)
}

export async function updateCustomer(customerId, updates) {
  return await apiPost("updateCustomer", { Customer_ID: customerId, ...updates })
}

export async function deleteCustomer(customerId) {
  return await apiPost("deleteCustomer", { Customer_ID: customerId })
}

// ─── SETTINGS API ─────────────────────────────────────────────
export async function getSettings() {
  // Returns object directly from sheet, or empty object if sheet is empty/error
  return (await apiCall("getSettings")) || {}
}

export async function updateSettings(settings) {
  return await apiPost("updateSettings", settings)
}

// ─── DASHBOARD API ────────────────────────────────────────────
export async function getDashboard() {
<<<<<<< HEAD
  return (await apiCall("getDashboard")) || {}
=======
  return await apiCall("getDashboard")
>>>>>>> 515ee115e644d6ebf2d30cf2204548394dd397fb
}

export { API_URL }
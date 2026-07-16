import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AppShell } from "@/components/layout/AppShell"
import { Dashboard } from "@/pages/Dashboard"
import { Products } from "@/pages/Products"
import { Sales } from "@/pages/Sales"
import { Expenses } from "@/pages/Expenses"
import { Customers } from "@/pages/Customers"
import { Reports } from "@/pages/Reports"
import { SettingsPage } from "@/pages/Settings"
import { Toaster } from "@/components/ui/sonner"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="sales" element={<Sales />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="customers" element={<Customers />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
      <Toaster
        position="top-center"
        toastOptions={{
          classNames: {
            toast: "backdrop-blur-xl border-white/10 shadow-2xl",
          },
          style: {
            background: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
          },
        }}
      />
    </BrowserRouter>
  )
}

export default App

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"
import { syncPendingMutations } from "@/lib/syncManager"
import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { ErrorOverlay } from "@/components/ErrorOverlay.tsx"

window.addEventListener("online", () => {
  syncPendingMutations()
})

// DIAGNOSTIC: unregister any stale service worker + clear caches.
// A previously-registered PWA SW (from an older recharts-3 build) can keep
// serving stale cached assets and cause "black screen / loop" symptoms.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((reg) => reg.unregister())
  })
  caches?.keys().then((keys) => keys.forEach((k) => caches.delete(k)))
}

// DIAGNOSTIC: surface any uncaught runtime error on screen.
window.addEventListener("error", (e) => {
  console.error("Uncaught error:", e.error || e.message)
})
window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled rejection:", e.reason)
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorOverlay>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorOverlay>
  </StrictMode>
)

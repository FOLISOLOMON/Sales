import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
<<<<<<< HEAD
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"
import { syncPendingMutations } from "@/lib/syncManager"
=======
>>>>>>> 515ee115e644d6ebf2d30cf2204548394dd397fb

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"

<<<<<<< HEAD
window.addEventListener("online", () => {
  syncPendingMutations()
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
=======
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
>>>>>>> 515ee115e644d6ebf2d30cf2204548394dd397fb
    </ThemeProvider>
  </StrictMode>
)

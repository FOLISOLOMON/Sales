import { Outlet } from "react-router-dom"
import { BottomNav } from "./BottomNav"

export function AppShell() {
  return (
    <div className="relative min-h-svh bg-background text-foreground">
      <main className="mx-auto min-h-svh max-w-md px-4 pb-24 pt-safe">
        <div className="pt-3">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}

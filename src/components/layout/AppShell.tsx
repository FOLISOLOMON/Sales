import { Outlet } from "react-router-dom"
import { BottomNav } from "./BottomNav"
import { useOnlineStatus } from "@/hooks/useOnlineStatus"

export function AppShell() {
  const isOnline = useOnlineStatus()

  return (
    <div className="relative min-h-svh bg-background text-foreground">
      {!isOnline && (
        <div className="bg-destructive text-destructive-foreground px-4 py-2 text-center text-sm font-medium">
          You are offline. Changes will be saved locally and synced when connected.
        </div>
      )}
      <main className="mx-auto min-h-svh max-w-md px-4 pb-24 pt-safe">
        <div className="pt-3">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}

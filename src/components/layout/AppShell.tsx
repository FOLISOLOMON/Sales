import { useState, createContext, useContext, useCallback, useMemo, useEffect } from "react"
import { NavLink } from "react-router-dom"
import {
  MoreHorizontal,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useOnlineStatus } from "@/hooks/useOnlineStatus"
import { motion, AnimatePresence } from "motion/react"
import { Outlet } from "react-router-dom"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { BottomNav, secondaryItems } from "./BottomNav"

type PageTitleContextValue = {
  title: string
  subtitle?: string
  setTitle: (title: string, subtitle?: string) => void
}

const PageTitleContext = createContext<PageTitleContextValue | undefined>(undefined)

export function usePageTitle() {
  const context = useContext(PageTitleContext)
  if (!context) throw new Error("usePageTitle must be used within AppShell")
  return context
}

type AddActionContextValue = {
  register: (handler: (() => void) | undefined) => void
}

const AddActionContext = createContext<AddActionContextValue | undefined>(undefined)

export function useAddAction() {
  const context = useContext(AddActionContext)
  if (!context) throw new Error("usePageTitle must be used within AppShell")
  return context.register
}

export function AppShell() {
  const isOnline = useOnlineStatus()
  const [pageTitle, setPageTitle] = useState({ title: "Veloura", subtitle: "" })
  const [moreOpen, setMoreOpen] = useState(false)
  const [addAction, setAddAction] = useState<(() => void) | undefined>(undefined)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const setTitle = useCallback((title: string, subtitle?: string) => {
    setPageTitle((prev) => {
      const nextSubtitle = subtitle || ""
      if (prev.title === title && prev.subtitle === nextSubtitle) return prev
      return { title, subtitle: nextSubtitle }
    })
  }, [])

  const register = useCallback((handler: (() => void) | undefined) => {
    setAddAction(() => handler)
  }, [])

  useEffect(() => {
    const syncModalState = () => {
      const hasOpenModal = document.body.querySelector('[data-state="open"], [role="dialog"]') !== null
      setIsModalOpen(hasOpenModal)
    }

    syncModalState()

    const observer = new MutationObserver(syncModalState)
    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ["data-state", "aria-hidden", "style"],
    })

    window.addEventListener("resize", syncModalState)

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", syncModalState)
    }
  }, [])

  const shouldHideFab = moreOpen || isModalOpen

  const pageTitleValue = useMemo(
    () => ({ title: pageTitle.title, subtitle: pageTitle.subtitle, setTitle }),
    [pageTitle.title, pageTitle.subtitle, setTitle]
  )

  const addActionValue = useMemo(
    () => ({ register }),
    [register]
  )

  return (
    <AddActionContext.Provider value={addActionValue}>
      <PageTitleContext.Provider value={pageTitleValue}>
      <div className="relative min-h-svh bg-background text-foreground">
        {!isOnline && (
          <div className="bg-destructive px-4 py-2 text-center text-sm font-medium text-destructive-foreground">
            You are offline. Changes will be saved locally and synced when connected.
          </div>
        )}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/[0.04] blur-[100px]"
            animate={{
              x: [0, 24, -12, -24, 0],
              y: [0, -24, 12, -12, 0],
              scale: [1, 1.02, 0.98, 1.01, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-chart-3/[0.03] blur-[100px]"
            animate={{
              x: [0, -24, 12, 24, 0],
              y: [0, 12, -24, -12, 0],
              scale: [1, 0.98, 1.01, 1.02, 1],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-chart-2/[0.03] blur-[100px]"
            animate={{
              x: [0, -12, 24, -12, 0],
              y: [0, 24, -12, -24, 0],
              scale: [1, 1.01, 0.99, 1.02, 1],
            }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <div className="grain-overlay" />

        <header className="fixed inset-x-0 top-0 z-40">
          <div className="mx-auto max-w-md px-4 pt-safe">
            <div className="flex h-14 items-center justify-between rounded-b-2xl bg-card/80 px-4 backdrop-blur-xl border-b border-border/70">
              <div className="min-w-0">
                <h1 className="font-display text-gold-gradient truncate text-lg font-bold tracking-tight">
                  {pageTitle.title}
                </h1>
                {pageTitle.subtitle && (
                  <p className="truncate text-xs text-muted-foreground">{pageTitle.subtitle}</p>
                )}
              </div>
              <Button size="icon" variant="ghost" onClick={() => setMoreOpen(true)} className="shrink-0">
                <MoreHorizontal className="size-5" strokeWidth={2.2} />
              </Button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-md px-4 relative">
          <main className="min-h-svh pb-24 pt-[calc(4rem+env(safe-area-inset-top,0px))]">
            <div className="pt-3">
              <Outlet />
            </div>
          </main>

          <BottomNav />
        </div>

        <AnimatePresence>
          {addAction && !shouldHideFab && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="fixed inset-x-0 bottom-0 z-[60] pointer-events-none"
            >
              <div className="mx-auto max-w-md px-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  onClick={addAction}
                  className="absolute bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] right-4 size-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center pointer-events-auto"
                >
                  <Plus className="size-6" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
          <SheetContent side="right" className="w-3/4 sm:max-w-sm">
            <SheetHeader className="pb-2">
              <SheetTitle>More</SheetTitle>
            </SheetHeader>
            <div className="grid gap-2 px-1 pb-2">
              {secondaryItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-xl border border-border/60 px-3 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )
                  }
                >
                  <Icon className="size-5" strokeWidth={2.1} />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </PageTitleContext.Provider>
    </AddActionContext.Provider>
  )
}

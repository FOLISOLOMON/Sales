import { useState } from "react"
import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Receipt,
  Users,
  FileBarChart,
  Settings,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

const primaryItems: NavItem[] = [
  { to: "/", label: "Home", icon: LayoutDashboard, end: true },
  { to: "/products", label: "Products", icon: Package },
  { to: "/sales", label: "Sales", icon: ShoppingCart },
  { to: "/reports", label: "Reports", icon: FileBarChart },
]

const secondaryItems: NavItem[] = [
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/settings", label: "Settings", icon: Settings },
]

function NavButton({ item }: { item: NavItem }) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          "flex min-w-[58px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-semibold transition-all duration-200",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={cn("size-[18px]", isActive && "scale-105")} strokeWidth={2.2} />
          <span>{item.label}</span>
        </>
      )}
    </NavLink>
  )
}

export function BottomNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-card/95 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center gap-2 rounded-[1.25rem] border border-border/60 bg-background/80 p-1.5">
          {primaryItems.map((item) => (
            <NavButton key={item.to} item={item} />
          ))}
        </div>
      </nav>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open more navigation"
        className={cn(
          "fixed bottom-[5.4rem] right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full border border-primary/20 bg-primary text-primary-foreground shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition-all duration-300 hover:scale-105",
          open && "translate-x-[160%] rotate-[-90deg] opacity-0"
        )}
      >
        <MoreHorizontal className="size-6" strokeWidth={2.2} />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl pb-safe">
          <SheetHeader className="pb-2">
            <SheetTitle>More</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-2 px-1 pb-2">
            {secondaryItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex flex-col items-center gap-2 rounded-2xl border border-border/60 px-3 py-4 text-sm font-medium transition-colors",
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
    </>
  )
}

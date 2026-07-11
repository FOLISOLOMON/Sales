import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
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

// Primary destinations shown directly in the bar (kept to 4 for clarity)
const primaryItems: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/products", label: "Products", icon: Package },
  { to: "/sales", label: "Sales", icon: ShoppingCart },
  { to: "/reports", label: "Reports", icon: FileBarChart },
]

// Secondary destinations tucked into the "More" sheet
const moreItems: NavItem[] = [
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/settings", label: "Settings", icon: Settings },
]

function TabLink({ item }: { item: NavItem }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          "relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors duration-200",
          isActive
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Slim top indicator for the active tab */}
          <span
            className={cn(
              "absolute inset-x-4 top-0 h-0.5 rounded-full bg-primary transition-opacity duration-200",
              isActive ? "opacity-100" : "opacity-0"
            )}
          />
          <Icon
            className="size-[22px] transition-transform duration-200"
            strokeWidth={isActive ? 2.5 : 2}
          />
          <span>{item.label}</span>
        </>
      )}
    </NavLink>
  )
}

export function BottomNav() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const isMoreActive = moreItems.some((item) =>
    location.pathname.startsWith(item.to)
  )

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl pb-safe">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-1">
        {primaryItems.map((item) => (
          <TabLink key={item.to} item={item} />
        ))}

        {/* More: opens a bottom sheet with secondary destinations */}
        <Sheet open={open} onOpenChange={setOpen}>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors duration-200",
              isMoreActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span
              className={cn(
                "absolute inset-x-4 top-0 h-0.5 rounded-full bg-primary transition-opacity duration-200",
                isMoreActive ? "opacity-100" : "opacity-0"
              )}
            />
            <MoreHorizontal
              className="size-[22px]"
              strokeWidth={isMoreActive ? 2.5 : 2}
            />
            <span>More</span>
          </button>

          <SheetContent
            side="bottom"
            className="rounded-t-2xl pb-safe"
          >
            <SheetHeader className="pb-0">
              <SheetTitle>More</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-3 gap-2 p-4 pt-2">
              {moreItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex flex-col items-center gap-2 rounded-xl border border-border/60 py-4 text-xs font-medium transition-colors",
                        isActive
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )
                    }
                  >
                    <Icon className="size-6" />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}

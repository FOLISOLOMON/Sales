<<<<<<< HEAD
import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
=======
import { NavLink } from "react-router-dom"
>>>>>>> 515ee115e644d6ebf2d30cf2204548394dd397fb
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Receipt,
  Users,
  FileBarChart,
  Settings,
<<<<<<< HEAD
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
=======
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/products", label: "Products", icon: Package, end: false },
  { to: "/sales", label: "Sales", icon: ShoppingCart, end: false },
  { to: "/expenses", label: "Expenses", icon: Receipt, end: false },
  { to: "/customers", label: "Customers", icon: Users, end: false },
  { to: "/reports", label: "Reports", icon: FileBarChart, end: false },
  { to: "/settings", label: "Settings", icon: Settings, end: false },
]

export function BottomNav() {
  return (
    <>
      {/* Scrollable bottom nav for 7 tabs */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl pb-safe">
        <div className="no-scrollbar scroll-smooth-touch flex items-center justify-around overflow-x-auto px-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex min-w-[52px] flex-col items-center gap-0.5 py-2 px-1.5 text-[10px] font-medium transition-all duration-200",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200",
                        isActive && "bg-primary/15"
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-[18px] transition-all duration-200",
                          isActive && "text-primary"
                        )}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                    </div>
                    <span className={cn(isActive && "text-primary")}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </>
>>>>>>> 515ee115e644d6ebf2d30cf2204548394dd397fb
  )
}

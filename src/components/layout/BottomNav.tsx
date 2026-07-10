import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Receipt,
  Users,
  FileBarChart,
  Settings,
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
  )
}

import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Receipt,
  Users,
  FileBarChart,
  Settings,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "motion/react"

type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

export const primaryItems: NavItem[] = [
  { to: "/", label: "Home", icon: LayoutDashboard, end: true },
  { to: "/products", label: "Products", icon: Package },
  { to: "/sales", label: "Sales", icon: ShoppingCart },
  { to: "/reports", label: "Reports", icon: FileBarChart },
]

export const secondaryItems: NavItem[] = [
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
          "relative flex min-w-[58px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-semibold transition-all duration-200",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.div
              layoutId="nav-indicator"
              className="absolute inset-0 rounded-2xl bg-primary"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <motion.div
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="relative z-10 flex flex-col items-center gap-1"
          >
            <Icon className={cn("size-[18px]", isActive && "scale-105")} strokeWidth={2.2} />
          </motion.div>
          <span className="relative z-10">{item.label}</span>
        </>
      )}
    </NavLink>
  )
}

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto flex max-w-md items-center gap-2 rounded-t-2xl bg-card/80 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl border-t border-border/70">
        {primaryItems.map((item) => (
          <NavButton key={item.to} item={item} />
        ))}
      </div>
    </nav>
  )
}

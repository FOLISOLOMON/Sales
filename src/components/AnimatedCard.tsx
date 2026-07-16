import * as React from "react"
import { motion, type Variants } from "motion/react"
import { cn } from "@/lib/utils"

const entranceVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
  id?: string
  style?: React.CSSProperties
}

export function AnimatedCard({ children, className, delay = 0, id, style }: AnimatedCardProps) {
  return (
    <motion.div
      id={id}
      style={style}
      initial="hidden"
      animate="show"
      variants={entranceVariants}
      transition={{ type: "spring", stiffness: 200, damping: 24, mass: 0.8, delay }}
      whileHover={{ y: -4, scale: 1.005 }}
      className={cn("group relative overflow-hidden rounded-xl", className)}
    >
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-primary/0 opacity-0 transition-all duration-500 group-hover:bg-primary/5 group-hover:opacity-100" />
      {children}
    </motion.div>
  )
}

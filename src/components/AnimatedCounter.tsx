import * as React from "react"
import { motion, useSpring, useTransform } from "motion/react"
import { cn } from "@/lib/utils"

export function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 1.2,
  className,
}: {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}) {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const [display, setDisplay] = React.useState(() => formatValue(0, prefix, suffix))

  const spring = useSpring(0, { stiffness: 80, damping: 25, mass: 1 })
  const rounded = useTransform(spring, (latest) => Math.round(latest))

  React.useEffect(() => {
    if (prefersReduced) {
      setDisplay(formatValue(value, prefix, suffix))
      return
    }
    spring.set(value)
  }, [value, prefix, suffix, prefersReduced, spring])

  React.useEffect(() => {
    const unsubscribe = rounded.on("change", (latest) => {
      setDisplay(formatValue(latest, prefix, suffix))
    })
    return unsubscribe
  }, [prefix, suffix, rounded])

  return (
    <motion.span className={cn("tabular-nums", className)}>
      {display}
    </motion.span>
  )
}

function formatValue(value: number, prefix: string, suffix: string): string {
  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value)
  return `${prefix}${formatted}${suffix}`
}

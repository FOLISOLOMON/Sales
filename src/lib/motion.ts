export const springPresets = {
  soft: { type: "spring", stiffness: 180, damping: 20, mass: 0.8 },
  default: { type: "spring", stiffness: 300, damping: 30, mass: 1 },
  bouncy: { type: "spring", stiffness: 300, damping: 20, mass: 1.2 },
  snappy: { type: "spring", stiffness: 400, damping: 35, mass: 0.6 },
} as const

export const durationPresets = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
} as const

export const stagger = {
  container: 0.06,
  item: 0.04,
} as const

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

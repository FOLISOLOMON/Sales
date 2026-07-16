import { cn } from "@/lib/utils"

function Skeleton({ className, shimmer, ...props }: React.ComponentProps<"div"> & { shimmer?: boolean }) {
  return (
    <div
      data-slot="skeleton"
      className={cn("relative overflow-hidden rounded-md bg-accent", shimmer ? "animate-pulse" : "", className)}
      {...props}
    >
      {shimmer && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          style={{ animation: "shimmer 1.5s infinite" }}
        />
      )}
    </div>
  )
}

export { Skeleton }

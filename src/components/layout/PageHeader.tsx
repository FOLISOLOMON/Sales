import { cn } from "@/lib/utils"

export function PageHeader({
  title,
  subtitle,
  className,
  children,
}: {
  title: string
  subtitle?: string
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div>
        <h1 className="text-gold-gradient text-2xl font-bold tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  )
}

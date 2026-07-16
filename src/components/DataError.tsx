import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

type DataErrorProps = {
  onRetry: () => void
  title?: string
  message?: string
}

export function DataError({
  onRetry,
  title = "Couldn't load data",
  message = "Something went wrong while reaching the server. Check your connection and try again.",
}: DataErrorProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/15">
        <AlertTriangle className="size-7 text-destructive" />
      </div>
      <div className="space-y-1">
        <p className="font-medium text-foreground">{title}</p>
        <p className="mx-auto max-w-xs text-sm text-muted-foreground">{message}</p>
      </div>
      <Button variant="outline" onClick={onRetry} className="gap-2">
        <RefreshCw className="size-4" />
        Retry
      </Button>
    </div>
  )
}

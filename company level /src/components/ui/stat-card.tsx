import type { LucideIcon } from "lucide-react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: number | string
  description: string
  /**
   * `default` — quiet, contextual. The metric is background information.
   * `emphasis` — actionable. Gets a left accent bar. Use only when the number
   * being non-zero means someone has to do something.
   */
  tone?: "default" | "emphasis"
  emphasisColor?: "success" | "warning" | "danger"
  icon?: LucideIcon
  className?: string
}

export function StatCard({
  label,
  value,
  description,
  tone = "default",
  emphasisColor = "warning",
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "gap-0 p-5",
        tone === "emphasis" && "border-l-2",
        tone === "emphasis" && emphasisColor === "danger" && "border-l-danger",
        tone === "emphasis" && emphasisColor === "warning" && "border-l-warning",
        tone === "emphasis" && emphasisColor === "success" && "border-l-success",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {Icon && <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
      </div>
      <p
        className={cn(
          "mt-2 text-2xl font-semibold tabular-nums",
          tone === "emphasis" && emphasisColor === "danger" && "text-danger",
          tone === "emphasis" && emphasisColor === "warning" && "text-warning",
          tone === "emphasis" && emphasisColor === "success" && "text-success",
          tone === "default" && "text-foreground"
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </Card>
  )
}

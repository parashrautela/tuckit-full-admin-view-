import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        success: "bg-success-bg text-success-foreground",
        warning: "bg-warning-bg text-warning-foreground",
        danger: "bg-danger-bg text-danger-foreground",
        info: "bg-info-bg text-info-foreground",
        neutral: "bg-neutral-bg text-neutral-foreground",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
)

type Variant = NonNullable<VariantProps<typeof statusBadgeVariants>["variant"]>

interface StatusConfig {
  variant: Variant
  /** Render a leading state dot. Reserve for live/attention states. */
  dot?: boolean
  /** Display label. Defaults to the raw status, underscores → spaces. */
  label?: string
}

/**
 * Central status → presentation map. This is the single source of truth for
 * every status pill in the app — add new statuses HERE, never hand-roll a
 * badge at the call site.
 *
 * Keys are matched case-insensitively and are normalised to uppercase.
 */
const STATUS_MAP: Record<string, StatusConfig> = {
  // ── Booking lifecycle (types/index.ts → Booking.bookingStatus) ──
  ACTIVE: { variant: "success", dot: true, label: "Active" },
  PAID_ACTIVE: { variant: "success", dot: true, label: "Paid · active" },
  COMPLETED: { variant: "info", label: "Completed" },
  DONE: { variant: "info", label: "Done" },
  PENDING: { variant: "warning", label: "Pending" },
  WARNING: { variant: "warning", label: "Warning" },
  OVERDUE: { variant: "danger", dot: true, label: "Overdue" },
  CANCELLED: { variant: "neutral", label: "Cancelled" },
  CANCEL_WITH_TXN: { variant: "neutral", label: "Cancelled · refundable" },
  CANCEL_WITHOUT_TXN: { variant: "neutral", label: "Cancelled · no txn" },

  // ── Terminal connectivity ──
  ONLINE: { variant: "success", dot: true, label: "Online" },
  OFFLINE: { variant: "danger", dot: true, label: "Offline" },

  // ── Terminal lifecycle (kept separate from connectivity by design) ──
  INACTIVE: { variant: "neutral", label: "Inactive" },

  // ── Locker / door state ──
  AVAILABLE: { variant: "success", label: "Available" },
  OCCUPIED: { variant: "info", label: "Occupied" },
  MAINTENANCE: { variant: "warning", label: "Maintenance" },
  FAULTY: { variant: "danger", dot: true, label: "Faulty" },
  OUT_OF_SERVICE: { variant: "danger", label: "Out of service" },

  // ── Approval / refund queues ──
  APPROVED: { variant: "success", label: "Approved" },
  REJECTED: { variant: "danger", label: "Rejected" },
  SETTLED: { variant: "success", label: "Settled" },
  SUCCESS: { variant: "success", label: "Success" },
  FAILED: { variant: "danger", label: "Failed" },

  // ── Alert triage ──
  RESOLVED: { variant: "info", label: "Resolved" },
  ACKNOWLEDGED: { variant: "info", label: "Acknowledged" },
  HIGH: { variant: "danger", dot: true, label: "High" },
  MEDIUM: { variant: "warning", label: "Medium" },
  LOW: { variant: "neutral", label: "Low" },

  // ── Access control ──
  BLOCKED: { variant: "danger", label: "Blocked" },

  // ── Payment methods ──
  UPI: { variant: "info", label: "UPI" },
  ONLINE_PAYMENT: { variant: "info", label: "Online" },
  "ONLINE PAYMENT": { variant: "info", label: "Online" },
  NETBANKING: { variant: "info", label: "Netbanking" },
  PAY_LATER: { variant: "warning", label: "Pay later" },
  "PAY LATER": { variant: "warning", label: "Pay later" },
}

const DOT_COLOR: Record<Variant, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  neutral: "bg-neutral-foreground",
}

interface StatusBadgeProps {
  status: string
  className?: string
  /**
   * Force the leading dot on/off. Omit to use the map's default — that is the
   * intended usage; this exists only for call sites that need to override.
   */
  dot?: boolean
  /** Pulse the state dot. Use sparingly — live connectivity only. */
  pulse?: boolean
}

export function StatusBadge({ status, className, dot, pulse }: StatusBadgeProps) {
  const key = String(status ?? "").trim().toUpperCase()
  const config = STATUS_MAP[key] ?? { variant: "neutral" as Variant }

  const showDot = dot ?? config.dot ?? false
  const label = config.label ?? key.replace(/_/g, " ")

  return (
    <span className={cn(statusBadgeVariants({ variant: config.variant }), className)}>
      {showDot && (
        <span
          aria-hidden="true"
          className={cn(
            "h-1.5 w-1.5 shrink-0 rounded-full",
            DOT_COLOR[config.variant],
            pulse && "animate-pulse"
          )}
        />
      )}
      {label}
    </span>
  )
}

export { statusBadgeVariants, STATUS_MAP }

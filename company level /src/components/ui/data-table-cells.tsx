import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Table cell typography primitives.
 *
 * Not a data-table abstraction — just the type conventions, so every table in
 * the app establishes the same hierarchy instead of rendering every cell at
 * the same weight.
 *
 *   <CellPrimary>Aarav Sharma</CellPrimary>
 *   <CellSecondary>+91 98000 00000</CellSecondary>
 */

type CellProps = {
  children: React.ReactNode
  className?: string
}

/** The identifying value in a cell. One per cell, maximum. */
export function CellPrimary({ children, className }: CellProps) {
  return <span className={cn("font-medium text-foreground", className)}>{children}</span>
}

/** Supporting value, stacked under a `CellPrimary`. */
export function CellSecondary({ children, className }: CellProps) {
  return (
    <span className={cn("mt-0.5 block text-xs text-muted-foreground", className)}>
      {children}
    </span>
  )
}

/** Machine identifiers — terminal codes, invoice numbers, IDs. */
export function CellCode({ children, className }: CellProps) {
  return (
    <span
      className={cn(
        "rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground",
        className
      )}
    >
      {children}
    </span>
  )
}

/** Currency, right-alignable, digits locked to a grid. */
export function CellAmount({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("font-medium tabular-nums text-foreground", className)}>
      ₹{value.toLocaleString("en-IN")}
    </span>
  )
}

/**
 * Masked-by-default sensitive value (passcode, DOB). Renders the mask until
 * `revealed` is explicitly true — the reveal itself must be audit-logged by
 * the caller.
 */
export function CellSensitive({
  value,
  revealed,
  mask = "••••",
  className,
}: {
  value: React.ReactNode
  revealed: boolean
  mask?: string
  className?: string
}) {
  return (
    <span className={cn("font-mono text-xs tabular-nums", className)}>
      {revealed ? value : <span className="text-muted-foreground">{mask}</span>}
    </span>
  )
}

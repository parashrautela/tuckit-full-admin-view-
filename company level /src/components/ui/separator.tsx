<<<<<<< HEAD
import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"

import { cn } from "@/lib/utils"

function Separator({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorPrimitive.Props) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
=======
import * as React from "react";
import { cn } from "@/lib/utils";

export interface SeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  (
    {
      className,
      orientation = "horizontal",
      decorative = true,
      role = decorative ? "none" : "separator",
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      role={role}
      aria-orientation={role === "separator" ? orientation : undefined}
      className={cn(
        "shrink-0 bg-hairline",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
>>>>>>> tuckit-test
        className
      )}
      {...props}
    />
  )
<<<<<<< HEAD
}

export { Separator }
=======
);
Separator.displayName = "Separator";

export { Separator };
>>>>>>> tuckit-test

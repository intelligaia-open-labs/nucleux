import * as React from "react";
import { cn } from "@nucleux/utils";

export interface Md3DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  /** Inset the divider (e.g. to align with list text). */
  inset?: boolean;
}

/** A Material Design 3 divider (thin outline-variant line). */
export const Md3Divider = React.forwardRef<HTMLDivElement, Md3DividerProps>(
  ({ orientation = "horizontal", inset = false, className, ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "shrink-0 bg-md-outline-variant",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        inset && orientation === "horizontal" && "ml-4",
        className,
      )}
      {...props}
    />
  ),
);
Md3Divider.displayName = "Md3Divider";

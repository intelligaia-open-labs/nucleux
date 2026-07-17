import * as React from "react";
import { cn } from "@nucleux/utils";

export type ProgressSize = "sm" | "md";

const trackSize: Record<ProgressSize, string> = {
  sm: "h-1.5",
  md: "h-2.5",
};

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current value (0–max). Omit for an indeterminate bar. */
  value?: number;
  /** Maximum value. */
  max?: number;
  size?: ProgressSize;
  /** Class applied to the filled indicator (e.g. "bg-success"). */
  indicatorClassName?: string;
}

/** A horizontal progress bar. Determinate when `value` is set, else indeterminate. */
export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, max = 100, size = "md", className, indicatorClassName, ...props }, ref) => {
    const indeterminate = value == null;
    const pct = indeterminate ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={indeterminate ? undefined : value}
        className={cn("w-full overflow-hidden rounded-full bg-muted", trackSize[size], className)}
        {...props}
      >
        <div
          className={cn(
            "h-full rounded-full bg-primary transition-[width] duration-300 ease-out",
            indeterminate && "w-1/3 animate-pulse",
            indicatorClassName,
          )}
          style={indeterminate ? undefined : { width: `${pct}%` }}
        />
      </div>
    );
  },
);
Progress.displayName = "Progress";

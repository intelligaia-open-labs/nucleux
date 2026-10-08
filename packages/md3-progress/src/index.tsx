import * as React from "react";
import { cn } from "@nucleux/utils";

export interface Md3LinearProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0–100. Omit for an indeterminate indicator. */
  value?: number;
  "aria-label"?: string;
}

/** A Material Design 3 linear progress indicator (determinate or indeterminate). */
export const Md3LinearProgress = React.forwardRef<HTMLDivElement, Md3LinearProgressProps>(
  ({ value, className, "aria-label": ariaLabel = "Loading", ...props }, ref) => {
    const indeterminate = value === undefined;
    const pct = indeterminate ? 40 : Math.min(100, Math.max(0, value));
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuenow={indeterminate ? undefined : pct}
        aria-valuemin={indeterminate ? undefined : 0}
        aria-valuemax={indeterminate ? undefined : 100}
        className={cn("h-1 w-full overflow-hidden rounded-full bg-md-surface-variant", className)}
        {...props}
      >
        <div
          className={cn("h-full rounded-full bg-md-primary transition-[width]", indeterminate && "animate-pulse")}
          style={{ width: `${pct}%` }}
        />
      </div>
    );
  },
);
Md3LinearProgress.displayName = "Md3LinearProgress";

export interface Md3CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0–100. Omit for an indeterminate spinner. */
  value?: number;
  /** Diameter in px. */
  size?: number;
  strokeWidth?: number;
  "aria-label"?: string;
}

/** A Material Design 3 circular progress indicator (determinate or indeterminate). */
export const Md3CircularProgress = React.forwardRef<HTMLDivElement, Md3CircularProgressProps>(
  ({ value, size = 48, strokeWidth = 4, className, "aria-label": ariaLabel = "Loading", ...props }, ref) => {
    const indeterminate = value === undefined;
    const r = (size - strokeWidth) / 2;
    const c = 2 * Math.PI * r;
    const pct = indeterminate ? 25 : Math.min(100, Math.max(0, value));
    const offset = c - (pct / 100) * c;

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuenow={indeterminate ? undefined : pct}
        aria-valuemin={indeterminate ? undefined : 0}
        aria-valuemax={indeterminate ? undefined : 100}
        className={cn("inline-flex", indeterminate && "animate-spin", className)}
        style={{ width: size, height: size }}
        {...props}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="hsl(var(--nx-md-surface-variant))"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="hsl(var(--nx-md-primary))"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
      </div>
    );
  },
);
Md3CircularProgress.displayName = "Md3CircularProgress";

import * as React from "react";
import { cn } from "@nucleux/utils";

export type ConfidenceLevel = "high" | "medium" | "low";

export interface ConfidenceIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Confidence score, 0–100. */
  value: number;
  /** Label above the meter. Defaults to `"Confidence"`. */
  label?: React.ReactNode;
  /** Score below which the agent should defer to a human. Defaults to 70. */
  threshold?: number;
  /** Explanatory note shown under the meter (e.g. a review recommendation). */
  note?: React.ReactNode;
  /** Force a level instead of deriving it from `value`/`threshold`. */
  level?: ConfidenceLevel;
}

const track: Record<ConfidenceLevel, string> = {
  high: "bg-success",
  medium: "bg-warning",
  low: "bg-destructive",
};
const badge: Record<ConfidenceLevel, string> = {
  high: "bg-success/15 text-success",
  medium: "bg-warning/15 text-warning",
  low: "bg-destructive/15 text-destructive",
};

/**
 * A model-confidence meter with a review threshold — surfaces how certain the
 * agent is about its own answer and gates autonomous action on it.
 * Source: Figma "Explainability / Confidence Indicators".
 */
export const ConfidenceIndicator = React.forwardRef<HTMLDivElement, ConfidenceIndicatorProps>(
  ({ value, label = "Confidence", threshold = 70, note, level, className, ...props }, ref) => {
    const pct = Math.max(0, Math.min(100, Math.round(value)));
    const resolved: ConfidenceLevel =
      level ?? (pct >= threshold ? "high" : pct >= threshold - 25 ? "medium" : "low");
    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-2 rounded-lg border border-border bg-background p-4", className)}
        {...props}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
              badge[resolved],
            )}
          >
            {pct}%
          </span>
        </div>
        <div
          role="meter"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={typeof label === "string" ? label : "Confidence"}
          className="h-2 w-full overflow-hidden rounded-full bg-muted"
        >
          <div
            className={cn("h-full rounded-full transition-[width]", track[resolved])}
            style={{ width: `${pct}%` }}
          />
        </div>
        {note && <p className="text-xs text-muted-foreground">{note}</p>}
      </div>
    );
  },
);
ConfidenceIndicator.displayName = "ConfidenceIndicator";

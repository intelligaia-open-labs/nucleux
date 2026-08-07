import * as React from "react";
import { cn } from "@nucleux/utils";
import { Sparkles } from "lucide-react";

export interface SessionRecapProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Eyebrow label. Defaults to `"Session recap"`. */
  label?: React.ReactNode;
  /** Leading icon. Defaults to a sparkle. */
  icon?: React.ReactNode;
  /** Trailing action, e.g. a "View full log" button. */
  action?: React.ReactNode;
}

/**
 * A tinted callout that wraps up an agent run in one natural-language line —
 * what the agent did — with an optional link to the full log.
 * Source: Figma "Explainability / Recap Card".
 */
export const SessionRecap = React.forwardRef<HTMLDivElement, SessionRecapProps>(
  ({ label = "Session recap", icon, action, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-brand/20 bg-brand-muted/40 p-4",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2 text-brand">
        <span className="[&_svg]:size-4">{icon ?? <Sparkles aria-hidden="true" />}</span>
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm leading-relaxed text-foreground">{children}</p>
      {action && <div className="flex">{action}</div>}
    </div>
  ),
);
SessionRecap.displayName = "SessionRecap";

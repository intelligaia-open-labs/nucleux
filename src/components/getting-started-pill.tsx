import * as React from "react";
import { ChevronDown, ChevronUp, Rocket } from "lucide-react";
import { cn } from "../lib/utils";
import { Badge } from "./badge";

export interface GettingStartedPillProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "title"> {
  /** Leading label. */
  label?: React.ReactNode;
  /** Leading icon (defaults to a rocket). */
  icon?: React.ReactNode;
  /** Completed step count — combined with `total` to render "current of total". */
  current?: number;
  /** Total step count. */
  total?: number;
  /** Override the rendered progress text (takes precedence over current/total). */
  progressLabel?: React.ReactNode;
  /** Whether the associated panel is expanded — flips the chevron. */
  open?: boolean;
}

/**
 * A floating, collapsed onboarding launcher — an icon, a label, a progress
 * badge, and a chevron that toggles the expanded panel. Click toggles `open`
 * via `onClick`. Source: Figma `getting-started-collapsed`.
 */
export const GettingStartedPill = React.forwardRef<HTMLButtonElement, GettingStartedPillProps>(
  (
    {
      label = "Getting Started",
      icon,
      current,
      total,
      progressLabel,
      open = false,
      type = "button",
      className,
      ...props
    },
    ref,
  ) => {
    const progress =
      progressLabel ??
      (current != null && total != null ? `${current} of ${total}` : undefined);
    const Chevron = open ? ChevronDown : ChevronUp;

    return (
      <button
        ref={ref}
        type={type}
        aria-expanded={open}
        className={cn(
          "group inline-flex items-center gap-2.5 rounded-3xl border border-info/20 bg-background px-4 py-2 text-left shadow-[0_0_10px_-2px_hsl(var(--nx-info)/0.4)] transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
        {...props}
      >
        <span className="flex flex-1 items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground [&_svg]:size-4">
            {icon ?? <Rocket />}
          </span>
          <span className="text-sm text-foreground">{label}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2.5">
          {progress != null && (
            <Badge variant="info" className="rounded-[10px] px-2">
              {progress}
            </Badge>
          )}
          <Chevron className="size-4 text-muted-foreground" />
        </span>
      </button>
    );
  },
);
GettingStartedPill.displayName = "GettingStartedPill";

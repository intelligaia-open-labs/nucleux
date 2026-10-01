import * as React from "react";
import { cn } from "@nucleux/utils";
import { Activity } from "lucide-react";

export interface ActivityLogItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  /** Icon for the action type. Defaults to a generic activity glyph. */
  icon?: React.ReactNode;
  /** Relative or absolute timestamp, e.g. `"2m ago"`. */
  time?: React.ReactNode;
}

/** A single entry in an {@link ActivityLog}: an action the agent took, with a timestamp. */
export const ActivityLogItem = React.forwardRef<HTMLLIElement, ActivityLogItemProps>(
  ({ icon, time, className, children, ...props }, ref) => (
    <li ref={ref} className={cn("relative flex gap-3 pb-4 last:pb-0", className)} {...props}>
      <span className="relative z-10 mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground [&_svg]:size-3.5">
        {icon ?? <Activity aria-hidden="true" />}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm text-foreground">{children}</span>
        {time && <span className="text-xs text-muted-foreground">{time}</span>}
      </span>
    </li>
  ),
);
ActivityLogItem.displayName = "ActivityLogItem";

export interface ActivityLogProps extends React.HTMLAttributes<HTMLOListElement> {
  /** Heading above the trail. */
  heading?: React.ReactNode;
}

/**
 * A timestamped audit trail of the actions an agent performed on the user's
 * behalf — a connected timeline of {@link ActivityLogItem}s.
 * Source: Figma "Explainability / Footprints".
 */
export const ActivityLog = React.forwardRef<HTMLOListElement, ActivityLogProps>(
  ({ heading, className, children, ...props }, ref) => (
    <div className="flex flex-col gap-3">
      {heading && (
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{heading}</p>
      )}
      <ol
        ref={ref}
        className={cn(
          "relative before:absolute before:left-3 before:top-1 before:h-[calc(100%-1rem)] before:w-px before:-translate-x-1/2 before:bg-border",
          className,
        )}
        {...props}
      >
        {children}
      </ol>
    </div>
  ),
);
ActivityLog.displayName = "ActivityLog";

import * as React from "react";
import { Activity } from "lucide-react";
import { cn } from "@nucleux/utils";

export interface Md3ActivityLogItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  icon?: React.ReactNode;
  time?: React.ReactNode;
}

/** A single entry in an {@link Md3ActivityLog}. */
export const Md3ActivityLogItem = React.forwardRef<HTMLLIElement, Md3ActivityLogItemProps>(
  ({ icon, time, className, children, ...props }, ref) => (
    <li ref={ref} className={cn("relative flex gap-3 pb-4 last:pb-0", className)} {...props}>
      <span className="relative z-10 mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-md-outline-variant bg-md-surface-container text-md-on-surface-variant [&_svg]:size-3.5">
        {icon ?? <Activity aria-hidden="true" />}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm text-md-on-surface">{children}</span>
        {time && <span className="text-xs text-md-on-surface-variant">{time}</span>}
      </span>
    </li>
  ),
);
Md3ActivityLogItem.displayName = "Md3ActivityLogItem";

export interface Md3ActivityLogProps extends React.HTMLAttributes<HTMLOListElement> {
  heading?: React.ReactNode;
}

/** A Material Design 3 timestamped audit trail of agent actions. Same API as {@link ActivityLog}. */
export const Md3ActivityLog = React.forwardRef<HTMLOListElement, Md3ActivityLogProps>(
  ({ heading, className, children, ...props }, ref) => (
    <div className="flex flex-col gap-3">
      {heading && (
        <p className="text-xs font-medium uppercase tracking-wide text-md-on-surface-variant">{heading}</p>
      )}
      <ol
        ref={ref}
        className={cn(
          "relative before:absolute before:left-3 before:top-1 before:h-[calc(100%-1rem)] before:w-px before:-translate-x-1/2 before:bg-md-outline-variant",
          className,
        )}
        {...props}
      >
        {children}
      </ol>
    </div>
  ),
);
Md3ActivityLog.displayName = "Md3ActivityLog";

import * as React from "react";
import { cn } from "../lib/utils";

export interface GlobalNavProps extends React.HTMLAttributes<HTMLElement> {
  /** Leading content — brand mark, page heading, breadcrumbs. */
  left?: React.ReactNode;
  /** Centered content — typically a search field. */
  center?: React.ReactNode;
  /** Trailing content — notifications, account avatar, actions. */
  right?: React.ReactNode;
}

/**
 * Top application navigation bar. A fixed-height (64px) bar with three zones:
 * `left`, `center`, and `right`. Pass slots, or `children` for full control.
 */
export const GlobalNav = React.forwardRef<HTMLElement, GlobalNavProps>(
  ({ left, center, right, className, children, ...props }, ref) => (
    <header
      ref={ref}
      className={cn(
        "flex h-16 w-full items-center justify-between gap-4 border-b border-border bg-background px-6",
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          <div className="flex min-w-0 items-center gap-3">{left}</div>
          <div className="flex flex-1 items-center justify-center">{center}</div>
          <div className="flex items-center justify-end gap-2">{right}</div>
        </>
      )}
    </header>
  ),
);
GlobalNav.displayName = "GlobalNav";

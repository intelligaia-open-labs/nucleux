import * as React from "react";
import { cn } from "@nucleux/utils";

export interface Md3TooltipProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "content" | "title"> {
  /** Plain tooltip text, or the body for a rich tooltip. */
  content: React.ReactNode;
  variant?: "plain" | "rich";
  /** Rich tooltip subhead. */
  title?: React.ReactNode;
  /** Rich tooltip actions (text buttons). */
  actions?: React.ReactNode;
  side?: "top" | "bottom";
  /** The trigger element. */
  children: React.ReactNode;
}

/** A Material Design 3 tooltip (plain or rich) shown on hover/focus. */
export const Md3Tooltip = React.forwardRef<HTMLDivElement, Md3TooltipProps>(
  ({ content, variant = "plain", title, actions, side = "top", className, children, ...props }, ref) => {
    const [open, setOpen] = React.useState(false);
    const plain = variant === "plain";

    return (
      <div
        ref={ref}
        className={cn("relative inline-flex", className)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocusCapture={() => setOpen(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
        }}
        {...props}
      >
        {children}
        {open && (
          <div
            role="tooltip"
            className={cn(
              "absolute left-1/2 z-50 -translate-x-1/2 animate-nx-fade-in",
              side === "top" ? "bottom-full mb-2" : "top-full mt-2",
              plain
                ? "whitespace-nowrap rounded-md-xs bg-md-inverse-surface px-2 py-1 text-xs text-md-inverse-on-surface"
                : "w-60 rounded-md-sm bg-md-surface-container p-3 text-sm text-md-on-surface-variant shadow-md-2",
            )}
          >
            {plain ? (
              content
            ) : (
              <>
                {title && <p className="mb-1 text-sm font-medium text-md-on-surface">{title}</p>}
                <div>{content}</div>
                {actions && <div className="mt-2 flex gap-2">{actions}</div>}
              </>
            )}
          </div>
        )}
      </div>
    );
  },
);
Md3Tooltip.displayName = "Md3Tooltip";

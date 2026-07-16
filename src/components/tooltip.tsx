import * as React from "react";
import { cn } from "../lib/utils";

export type TooltipSide = "top" | "bottom" | "left" | "right";

const sideClasses: Record<TooltipSide, string> = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
  left: "right-full top-1/2 mr-2 -translate-y-1/2",
  right: "left-full top-1/2 ml-2 -translate-y-1/2",
};

export interface TooltipProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "content"> {
  /** The tooltip text/content. */
  content: React.ReactNode;
  /** Which side of the trigger to show on. */
  side?: TooltipSide;
  /** The trigger element(s). */
  children: React.ReactNode;
}

/**
 * Lightweight hover/focus tooltip. Reveals `content` when the wrapped trigger is
 * hovered or focused — no positioning library, pure CSS. The trigger must be
 * focusable (e.g. a button or link) for keyboard users.
 */
export const Tooltip = React.forwardRef<HTMLSpanElement, TooltipProps>(
  ({ content, side = "top", className, children, ...props }, ref) => (
    <span ref={ref} className={cn("group relative inline-flex", className)} {...props}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none invisible absolute z-50 whitespace-nowrap rounded-lg bg-foreground px-2 py-1.5 text-xs text-background opacity-0 shadow-md transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100",
          sideClasses[side],
        )}
      >
        {content}
      </span>
    </span>
  ),
);
Tooltip.displayName = "Tooltip";

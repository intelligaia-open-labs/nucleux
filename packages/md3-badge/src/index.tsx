import * as React from "react";
import { cn } from "@nucleux/utils";

export interface Md3BadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "content"> {
  /** Numeric/text count. Omit for a small dot badge. */
  content?: React.ReactNode;
  /** Clamp numeric content, e.g. max=99 renders "99+". */
  max?: number;
  /** The element the badge is attached to (badge floats at its top-right). */
  children?: React.ReactNode;
}

/** A Material Design 3 badge — a small dot or a large numbered label. */
export const Md3Badge = React.forwardRef<HTMLSpanElement, Md3BadgeProps>(
  ({ content, max, className, children, ...props }, ref) => {
    const isDot = content === undefined || content === null;
    let label = content;
    if (!isDot && typeof content === "number" && max !== undefined && content > max) {
      label = `${max}+`;
    }

    const badge = (
      <span
        ref={ref}
        className={cn(
          "z-10 inline-flex items-center justify-center rounded-full bg-md-error font-medium text-md-on-error",
          isDot ? "h-1.5 w-1.5" : "h-4 min-w-4 px-1 text-[11px] leading-none",
          children && "absolute -right-1 -top-1",
          children && isDot && "right-0 top-0",
          className,
        )}
        {...props}
      >
        {!isDot && label}
      </span>
    );

    if (!children) return badge;
    return (
      <span className="relative inline-flex">
        {children}
        {badge}
      </span>
    );
  },
);
Md3Badge.displayName = "Md3Badge";

import * as React from "react";
import { cn } from "@nucleux/utils";

export interface HoverCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "content"> {
  /** The element that reveals the card on hover/focus. */
  trigger: React.ReactNode;
  /** The floating card content. */
  content: React.ReactNode;
  side?: "top" | "bottom";
  align?: "start" | "center" | "end";
  /** Delay in ms before opening on hover. */
  openDelay?: number;
  /** Delay in ms before closing after leaving. */
  closeDelay?: number;
}

const alignClass: Record<NonNullable<HoverCardProps["align"]>, string> = {
  start: "left-0",
  center: "left-1/2 -translate-x-1/2",
  end: "right-0",
};

/** Reveals a floating card when its trigger is hovered or focused. */
export const HoverCard = React.forwardRef<HTMLDivElement, HoverCardProps>(
  (
    {
      trigger,
      content,
      side = "top",
      align = "center",
      openDelay = 200,
      closeDelay = 150,
      className,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const timer = React.useRef<ReturnType<typeof setTimeout>>();

    const schedule = (next: boolean, delay: number) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setOpen(next), delay);
    };

    React.useEffect(() => () => clearTimeout(timer.current), []);

    return (
      <div
        ref={ref}
        className={cn("relative inline-block", className)}
        onMouseEnter={() => schedule(true, openDelay)}
        onMouseLeave={() => schedule(false, closeDelay)}
        onFocusCapture={() => setOpen(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
        }}
        {...props}
      >
        {trigger}
        {open && (
          <div
            role="tooltip"
            className={cn(
              "absolute z-50 w-64 animate-nx-fade-in rounded-md border border-border bg-background p-4 text-sm text-foreground shadow-md",
              side === "top" ? "bottom-full mb-2" : "top-full mt-2",
              alignClass[align],
            )}
          >
            {content}
          </div>
        )}
      </div>
    );
  },
);
HoverCard.displayName = "HoverCard";

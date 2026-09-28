import * as React from "react";
import { cn } from "@nucleux/utils";

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal" | "both";
  /** Max height (any CSS length) for the vertical scroll viewport. */
  viewportClassName?: string;
}

const overflow: Record<NonNullable<ScrollAreaProps["orientation"]>, string> = {
  vertical: "overflow-y-auto overflow-x-hidden",
  horizontal: "overflow-x-auto overflow-y-hidden",
  both: "overflow-auto",
};

/**
 * A scroll container with a thin, tokenized scrollbar. Set a height/width via
 * `className` (e.g. `h-48`) for the scroll area to take effect.
 */
export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ orientation = "vertical", viewportClassName, className, children, ...props }, ref) => (
    <div ref={ref} className={cn("relative overflow-hidden", className)} {...props}>
      <div
        className={cn(
          "h-full w-full rounded-[inherit]",
          "[scrollbar-width:thin] [scrollbar-color:hsl(var(--nx-border))_transparent]",
          "[&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2",
          "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          overflow[orientation],
          viewportClassName,
        )}
      >
        {children}
      </div>
    </div>
  ),
);
ScrollArea.displayName = "ScrollArea";

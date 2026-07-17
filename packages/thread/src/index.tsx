import * as React from "react";
import { ArrowDown } from "lucide-react";
import { cn } from "@nucleux/utils";
import { useAutoScroll } from "@nucleux/hooks";

export interface ThreadProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Change this whenever messages are added so the view re-pins to bottom. */
  autoScrollKey?: unknown;
  /** Disable the sticky "scroll to bottom" affordance. */
  hideScrollButton?: boolean;
}

/**
 * Scrollable transcript container that keeps itself pinned to the newest
 * message while content streams, and surfaces a "jump to latest" button when
 * the user scrolls away.
 */
export const Thread = React.forwardRef<HTMLDivElement, ThreadProps>(
  ({ autoScrollKey, hideScrollButton = false, className, children, ...props }, _ref) => {
    const { ref, pinned, scrollToBottom } = useAutoScroll<HTMLDivElement>({
      dependency: autoScrollKey,
    });

    return (
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          ref={ref}
          className={cn("flex-1 space-y-4 overflow-y-auto scroll-smooth p-4", className)}
          {...props}
        >
          {children}
        </div>
        {!hideScrollButton && !pinned && (
          <button
            type="button"
            onClick={() => scrollToBottom()}
            aria-label="Scroll to latest"
            className="absolute bottom-4 left-1/2 -translate-x-1/2 inline-flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-md transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring animate-nx-fade-in"
          >
            <ArrowDown className="size-4" />
          </button>
        )}
      </div>
    );
  },
);
Thread.displayName = "Thread";

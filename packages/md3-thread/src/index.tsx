import * as React from "react";
import { ArrowDown } from "lucide-react";
import { cn } from "@nucleux/utils";
import { useAutoScroll } from "@nucleux/hooks";

export interface Md3ThreadProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Change this whenever messages are added so the view re-pins to bottom. */
  autoScrollKey?: unknown;
  /** Disable the sticky "scroll to bottom" affordance. */
  hideScrollButton?: boolean;
}

/**
 * A Material Design 3 auto-scrolling transcript container. Pins to the newest
 * message and surfaces a tonal "jump to latest" FAB. Same API as {@link Thread}.
 */
export const Md3Thread = React.forwardRef<HTMLDivElement, Md3ThreadProps>(
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
            className={cn(
              "absolute bottom-4 left-1/2 inline-flex size-10 -translate-x-1/2 items-center justify-center overflow-hidden rounded-full bg-md-surface-container-high text-md-on-surface shadow-md-3 outline-none animate-nx-fade-in",
              "before:absolute before:inset-0 before:bg-md-on-surface before:opacity-0 before:transition-opacity before:content-['']",
              "hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12]",
            )}
          >
            <ArrowDown className="relative size-4" />
          </button>
        )}
      </div>
    );
  },
);
Md3Thread.displayName = "Md3Thread";

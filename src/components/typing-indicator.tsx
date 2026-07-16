import * as React from "react";
import { cn } from "../lib/utils";

export interface TypingIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accessible label announced to assistive tech. */
  label?: string;
}

/** Three animated dots indicating the agent is preparing a response. */
export const TypingIndicator = React.forwardRef<HTMLDivElement, TypingIndicatorProps>(
  ({ className, label = "Assistant is typing", ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-label={label}
        className={cn(
          "inline-flex items-center gap-1 rounded-2xl bg-muted px-3 py-2 text-muted-foreground",
          className,
        )}
        {...props}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            aria-hidden
            className="size-1.5 rounded-full bg-current animate-nx-typing"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    );
  },
);
TypingIndicator.displayName = "TypingIndicator";

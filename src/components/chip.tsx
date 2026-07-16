import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../lib/utils";

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Show a leading status dot. Pass a className to color it (e.g. "bg-success"). */
  dot?: boolean;
  /** Tailwind classes controlling the dot color (defaults to muted). */
  dotClassName?: string;
  /** When provided, renders a trailing remove button that calls this handler. */
  onRemove?: () => void;
  /** Accessible label for the remove button. */
  removeLabel?: string;
}

/**
 * A small rounded tag/pill with an optional status dot and removable affordance.
 * Lighter-weight than {@link Badge} — use for filters, tokens, and inline tags.
 */
export const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(
  ({ dot = false, dotClassName, onRemove, removeLabel = "Remove", className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs text-foreground",
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          aria-hidden
          className={cn("size-1.5 shrink-0 rounded-full", dotClassName ?? "bg-muted-foreground")}
        />
      )}
      {children}
      {onRemove && (
        <button
          type="button"
          aria-label={removeLabel}
          onClick={onRemove}
          className="-mr-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-3" />
        </button>
      )}
    </span>
  ),
);
Chip.displayName = "Chip";

import * as React from "react";
import { cn } from "@nucleux/utils";

/** A single suggestion pill — a secondary-styled action button. */
export interface SuggestionChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Additional classes merged onto the chip. */
  className?: string;
  /** Button type. Defaults to "button". */
  type?: "button" | "submit" | "reset";
}

/** Pill-shaped quick-prompt button. */
export const SuggestionChip = React.forwardRef<HTMLButtonElement, SuggestionChipProps>(
  ({ type = "button", className, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-muted px-4 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4",
        className,
      )}
      {...props}
    />
  ),
);
SuggestionChip.displayName = "SuggestionChip";

export interface SuggestionsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** Convenience: render a chip per string and call `onSelect` on click. */
  items?: string[];
  /** Called with the selected suggestion text. */
  onSelect?: (value: string) => void;
}

/**
 * A wrapping row of prompt suggestions for agent interfaces. Pass `items` for
 * the simple case, or compose {@link SuggestionChip} children directly.
 */
export const Suggestions = React.forwardRef<HTMLDivElement, SuggestionsProps>(
  ({ items, onSelect, className, children, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-wrap gap-2", className)} {...props}>
      {items
        ? items.map((item) => (
            <SuggestionChip key={item} onClick={() => onSelect?.(item)}>
              {item}
            </SuggestionChip>
          ))
        : children}
    </div>
  ),
);
Suggestions.displayName = "Suggestions";

import * as React from "react";
import { cn } from "@nucleux/utils";

/** A Material Design 3 list container. Compose with Md3ListItem. */
export const Md3List = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} role="list" className={cn("bg-md-surface py-2 text-md-on-surface", className)} {...props} />
  ),
);
Md3List.displayName = "Md3List";

export interface Md3ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  headline: React.ReactNode;
  supportingText?: React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  /** Add a hover/press state layer + role="button" for actionable rows. */
  interactive?: boolean;
}

/** A row in a {@link Md3List} (one- or two-line, with leading/trailing slots). */
export const Md3ListItem = React.forwardRef<HTMLDivElement, Md3ListItemProps>(
  ({ headline, supportingText, leading, trailing, interactive = false, className, onClick, ...props }, ref) => (
    <div
      ref={ref}
      role={interactive ? "button" : "listitem"}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                (e.currentTarget as HTMLDivElement).click();
              }
            }
          : undefined
      }
      className={cn(
        "relative flex items-center gap-4 overflow-hidden px-4 py-3 text-left",
        interactive && [
          "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-md-primary",
          "before:absolute before:inset-0 before:bg-md-on-surface before:opacity-0 before:transition-opacity before:content-['']",
          "hover:before:opacity-[0.08] active:before:opacity-[0.12]",
        ],
        className,
      )}
      {...props}
    >
      {leading && <span className="relative shrink-0 text-md-on-surface-variant [&_svg]:size-6">{leading}</span>}
      <span className="relative min-w-0 flex-1">
        <span className="block truncate text-md-on-surface">{headline}</span>
        {supportingText && (
          <span className="block truncate text-sm text-md-on-surface-variant">{supportingText}</span>
        )}
      </span>
      {trailing && <span className="relative shrink-0 text-md-on-surface-variant">{trailing}</span>}
    </div>
  ),
);
Md3ListItem.displayName = "Md3ListItem";

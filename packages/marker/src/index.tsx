import * as React from "react";
import { cn, Slot } from "@nucleux/utils";

export type MarkerVariant = "default" | "separator" | "border";

const markerBase =
  "group/marker relative flex min-h-4 w-full items-center gap-2 text-left text-sm text-muted-foreground [&_svg:not([class*='size-'])]:size-4 [a&]:underline [a&]:underline-offset-[3px] hover:[a&]:text-foreground";

const markerVariantClasses: Record<MarkerVariant, string> = {
  default: "",
  separator:
    "before:mr-1 before:h-px before:min-w-0 before:flex-1 before:bg-border before:content-[''] after:ml-1 after:h-px after:min-w-0 after:flex-1 after:bg-border after:content-['']",
  border: "border-b border-border pb-2",
};

/** Returns the Marker class string for a variant (shadcn's `markerVariants` cva helper). */
export function markerVariants({ variant = "default", className }: { variant?: MarkerVariant | null; className?: string } = {}) {
  return cn(markerBase, markerVariantClasses[variant ?? "default"], className);
}

export interface MarkerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** "default" (plain line), "separator" (centred text between rules) or "border" (bottom rule). */
  variant?: MarkerVariant;
  /** Render the single child (e.g. an `<a>` or `<li>`) with the marker's styles. */
  asChild?: boolean;
}

/**
 * A small muted inline note that marks a point in a feed, thread or
 * timeline: "Conversation started", "Yesterday", "Agent switched to Opus".
 * `variant="separator"` centres the text between two horizontal rules,
 * `variant="border"` underlines the row. Compose MarkerIcon and
 * MarkerContent inside; use `asChild` to render a link or list item.
 */
export const Marker = React.forwardRef<HTMLDivElement, MarkerProps>(
  ({ className, variant = "default", asChild = false, ...props }, ref) => {
    const shared = {
      "data-slot": "marker",
      "data-variant": variant,
      className: markerVariants({ variant, className }),
    };
    if (asChild) return <Slot ref={ref} {...shared} {...props} />;
    return <div ref={ref} {...shared} {...props} />;
  },
);
Marker.displayName = "Marker";

export type MarkerIconProps = React.HTMLAttributes<HTMLSpanElement>;

/** Decorative icon slot at the start of a Marker (hidden from assistive tech). */
export const MarkerIcon = React.forwardRef<HTMLSpanElement, MarkerIconProps>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    data-slot="marker-icon"
    aria-hidden="true"
    className={cn("size-4 shrink-0 [&_svg:not([class*='size-'])]:size-4", className)}
    {...props}
  />
));
MarkerIcon.displayName = "MarkerIcon";

export type MarkerContentProps = React.HTMLAttributes<HTMLSpanElement>;

/** The marker's text; links inside are underlined, and it centres between the rules of a separator Marker. */
export const MarkerContent = React.forwardRef<HTMLSpanElement, MarkerContentProps>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    data-slot="marker-content"
    className={cn(
      "min-w-0 [overflow-wrap:break-word] group-data-[variant=separator]/marker:flex-none group-data-[variant=separator]/marker:text-center [&>a]:underline [&>a]:underline-offset-[3px] [&>a:hover]:text-foreground",
      className,
    )}
    {...props}
  />
));
MarkerContent.displayName = "MarkerContent";

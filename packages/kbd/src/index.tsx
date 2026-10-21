import * as React from "react";
import { cn } from "@nucleux/utils";

export type KbdProps = React.HTMLAttributes<HTMLElement>;

/**
 * A single keyboard key, e.g. `<Kbd>⌘</Kbd>` or `<Kbd>Enter</Kbd>`. Renders a
 * semantic `<kbd>` in a small muted keycap; icons inside are sized to 12px.
 * Inside a tooltip it switches to a translucent keycap that reads on the
 * inverted tooltip surface. Combine several keys with KbdGroup.
 */
export const Kbd = React.forwardRef<HTMLElement, KbdProps>(({ className, ...props }, ref) => (
  <kbd
    ref={ref}
    data-slot="kbd"
    className={cn(
      "pointer-events-none inline-flex h-5 w-fit min-w-5 select-none items-center justify-center gap-1 rounded-sm bg-muted px-1 font-sans text-xs font-medium text-muted-foreground",
      "[&_svg:not([class*='size-'])]:size-3",
      "[[data-slot=tooltip-content]_&]:bg-background/20 [[data-slot=tooltip-content]_&]:text-background",
      className,
    )}
    {...props}
  />
));
Kbd.displayName = "Kbd";

export type KbdGroupProps = React.HTMLAttributes<HTMLElement>;

/**
 * Groups several Kbd keys into one shortcut, e.g. `⌘ + K`. Renders an outer
 * `<kbd>` (the HTML pattern for a key combination) laid out inline with a
 * small gap; put separators such as "+" or "then" between the keys as text.
 */
export const KbdGroup = React.forwardRef<HTMLElement, KbdGroupProps>(({ className, ...props }, ref) => (
  <kbd ref={ref} data-slot="kbd-group" className={cn("inline-flex items-center gap-1", className)} {...props} />
));
KbdGroup.displayName = "KbdGroup";

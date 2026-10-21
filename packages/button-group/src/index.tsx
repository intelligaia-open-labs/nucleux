import * as React from "react";
import { cn, Slot } from "@nucleux/utils";
import { Separator, type SeparatorProps } from "@nucleux/separator";

export type ButtonGroupOrientation = "horizontal" | "vertical";

// Tailwind v3 applies stacked variants right-to-left, so shadcn's v4
// `[&>*]:focus-visible:…` is written `focus-visible:[&>*]:…` here.
const buttonGroupBase =
  "flex w-fit items-stretch has-[>[data-slot=button-group]]:gap-2 focus-visible:[&>*]:relative focus-visible:[&>*]:z-10 [&>[data-slot=select-trigger]:last-of-type]:has-[select[aria-hidden=true]:last-child]:rounded-r-md [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1";

const buttonGroupOrientations: Record<ButtonGroupOrientation, string> = {
  horizontal:
    "[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none",
  vertical:
    "flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none",
};

/** Returns the ButtonGroup class string for an orientation (shadcn's `buttonGroupVariants` cva helper). */
export function buttonGroupVariants({
  orientation = "horizontal",
  className,
}: { orientation?: ButtonGroupOrientation | null; className?: string } = {}) {
  return cn(buttonGroupBase, buttonGroupOrientations[orientation ?? "horizontal"], className);
}

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Lay the children out in a row ("horizontal", default) or a column ("vertical"). */
  orientation?: ButtonGroupOrientation;
}

/**
 * Joins related buttons (and inputs, selects or ButtonGroupText labels)
 * into one segmented control: inner corners are squared off and the
 * touching borders merged, and the focused child is raised so its ring
 * isn't clipped. Renders `role="group"`; give it an `aria-label`. Nest
 * ButtonGroups to get spaced clusters of joined groups.
 */
export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, orientation = "horizontal", ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={buttonGroupVariants({ orientation, className })}
      {...props}
    />
  ),
);
ButtonGroup.displayName = "ButtonGroup";

export interface ButtonGroupTextProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Render the single child (e.g. a `<Label>` or `<span>`) with the text block's styles. */
  asChild?: boolean;
}

/**
 * A static text or icon segment inside a ButtonGroup, such as a unit
 * ("https://", "USD") or a label next to an input. Styled like a muted,
 * bordered button so it joins seamlessly with its neighbours. Use
 * `asChild` to render a `<label>` tied to the adjacent input.
 */
export const ButtonGroupText = React.forwardRef<HTMLDivElement, ButtonGroupTextProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const classes = cn(
      "flex items-center gap-2 rounded-md border border-border bg-muted px-4 text-sm font-medium shadow-sm [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
      className,
    );
    if (asChild) return <Slot ref={ref} className={classes} {...props} />;
    return <div ref={ref} className={classes} {...props} />;
  },
);
ButtonGroupText.displayName = "ButtonGroupText";

export type ButtonGroupSeparatorProps = SeparatorProps;

/**
 * A thin divider between two segments of a ButtonGroup, useful between
 * borderless (ghost) buttons. Vertical by default and stretched to the
 * group's height; pass `orientation="horizontal"` in a vertical group.
 */
export const ButtonGroupSeparator = React.forwardRef<HTMLDivElement, ButtonGroupSeparatorProps>(
  ({ className, orientation = "vertical", ...props }, ref) => (
    <Separator
      ref={ref}
      data-slot="button-group-separator"
      data-orientation={orientation}
      orientation={orientation}
      className={cn("relative !m-0 self-stretch bg-input", orientation === "vertical" && "h-auto", className)}
      {...props}
    />
  ),
);
ButtonGroupSeparator.displayName = "ButtonGroupSeparator";

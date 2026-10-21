import * as React from "react";
import { cn, Slot } from "@nucleux/utils";

export type BubbleVariant = "default" | "secondary" | "muted" | "tinted" | "outline" | "ghost" | "destructive";
export type BubbleAlign = "start" | "end";
export type BubbleReactionsSide = "top" | "bottom";

export type BubbleGroupProps = React.HTMLAttributes<HTMLDivElement>;

/** Stacks consecutive bubbles from the same sender with a small gap. */
export const BubbleGroup = React.forwardRef<HTMLDivElement, BubbleGroupProps>(({ className, ...props }, ref) => (
  <div ref={ref} data-slot="bubble-group" className={cn("flex min-w-0 flex-col gap-2", className)} {...props} />
));
BubbleGroup.displayName = "BubbleGroup";

// Variant styles target the direct BubbleContent child, so BubbleReactions
// and other children of a Bubble don't pick up the fill. Class strings are
// written out in full so Tailwind's content scanner finds them.
const bubbleBase =
  "group/bubble relative flex w-fit min-w-0 max-w-[80%] flex-col gap-1 group-data-[align=end]/message:self-end data-[align=end]:self-end data-[variant=ghost]:max-w-full";

const bubbleVariantClasses: Record<BubbleVariant, string> = {
  default:
    "[&>[data-slot=bubble-content]]:bg-primary [&>[data-slot=bubble-content]]:text-primary-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-primary/80",
  secondary:
    "[&>[data-slot=bubble-content]]:bg-muted [&>[data-slot=bubble-content]]:text-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-accent",
  muted:
    "[&>[data-slot=bubble-content]]:bg-muted [&>[data-slot=bubble-content]]:text-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-accent",
  tinted:
    "[&>[data-slot=bubble-content]]:bg-primary/10 [&>[data-slot=bubble-content]]:text-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-primary/15",
  outline:
    "[&>[data-slot=bubble-content]]:border-border [&>[data-slot=bubble-content]]:bg-background [&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:text-foreground",
  ghost:
    "border-none [&>[data-slot=bubble-content]]:rounded-none [&>[data-slot=bubble-content]]:bg-transparent [&>[data-slot=bubble-content]]:p-0 [&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:text-foreground",
  destructive:
    "[&>[data-slot=bubble-content]]:bg-destructive/10 [&>[data-slot=bubble-content]]:text-destructive [&>[data-slot=bubble-content]:is(button,a):hover]:bg-destructive/20",
};

/** Returns the Bubble class string for a variant (equivalent of shadcn's internal cva). */
export function bubbleVariants({
  variant = "default",
  className,
}: { variant?: BubbleVariant | null; className?: string } = {}) {
  return cn(bubbleBase, bubbleVariantClasses[variant ?? "default"], className);
}

export interface BubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Fill of the BubbleContent: "default" (primary), "secondary", "muted",
   * "tinted" (light primary), "outline", "ghost" (no chrome, full width) or
   * "destructive" (an error message).
   */
  variant?: BubbleVariant;
  /** "start" (default, incoming) or "end" (outgoing: pushed to the trailing side). */
  align?: BubbleAlign;
}

/**
 * A chat message bubble. Wrap the text in BubbleContent; the variant sets
 * its fill and `align="end"` pushes it to the trailing side, as for the
 * user's own messages. It also aligns to the end inside a Message with
 * `data-align="end"`. Add BubbleReactions for emoji reactions pinned to an
 * edge, and stack several from one sender in a BubbleGroup.
 */
export const Bubble = React.forwardRef<HTMLDivElement, BubbleProps>(
  ({ variant = "default", align = "start", className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="bubble"
      data-variant={variant}
      data-align={align}
      className={bubbleVariants({ variant, className })}
      {...props}
    />
  ),
);
Bubble.displayName = "Bubble";

export interface BubbleContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Render the single child (e.g. a `<button>` or `<a>`) as the bubble surface, making it interactive. */
  asChild?: boolean;
}

/**
 * The bubble's rounded surface holding the message text. Use `asChild`
 * with a `<button>` or `<a>` to make the whole bubble clickable; it then
 * gets a hover tint and a focus ring.
 */
export const BubbleContent = React.forwardRef<HTMLDivElement, BubbleContentProps>(
  ({ asChild = false, className, ...props }, ref) => {
    const classes = cn(
      "w-fit min-w-0 max-w-full overflow-hidden rounded-xl border border-transparent px-3 py-2 text-sm leading-relaxed [overflow-wrap:break-word] group-data-[align=end]/bubble:self-end [button&]:text-left [&:is(button,a)]:outline-none [&:is(button,a)]:transition-colors focus-visible:[&:is(button,a)]:border-ring focus-visible:[&:is(button,a)]:ring-[3px] focus-visible:[&:is(button,a)]:ring-ring/50",
      className,
    );
    if (asChild) return <Slot ref={ref} data-slot="bubble-content" className={classes} {...props} />;
    return <div ref={ref} data-slot="bubble-content" className={classes} {...props} />;
  },
);
BubbleContent.displayName = "BubbleContent";

const reactionsSides: Record<BubbleReactionsSide, string> = {
  top: "top-0 -translate-y-3/4",
  bottom: "bottom-0 translate-y-3/4",
};
const reactionsAligns: Record<BubbleAlign, string> = {
  start: "left-3",
  end: "right-3",
};

export interface BubbleReactionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Corner to pin to horizontally: "start" or "end" (default). */
  align?: BubbleAlign;
  /** Edge to overlap: "top" or "bottom" (default). */
  side?: BubbleReactionsSide;
}

/**
 * A small pill of emoji reactions overlapping an edge of the Bubble. Holds
 * plain emoji or reaction buttons (padding collapses when it contains a
 * button). Leave room around the bubble (e.g. `mb-4`) so it doesn't cover
 * the next message.
 */
export const BubbleReactions = React.forwardRef<HTMLDivElement, BubbleReactionsProps>(
  ({ side = "bottom", align = "end", className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="bubble-reactions"
      data-align={align}
      data-side={side}
      className={cn(
        "absolute z-10 flex w-fit shrink-0 items-center justify-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-sm ring-[3px] ring-background has-[button]:p-0",
        reactionsSides[side],
        reactionsAligns[align],
        className,
      )}
      {...props}
    />
  ),
);
BubbleReactions.displayName = "BubbleReactions";

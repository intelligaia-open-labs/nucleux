import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@nucleux/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  type CollapsibleContentProps,
  type CollapsibleProps,
  type CollapsibleTriggerProps,
} from "@nucleux/collapsible";

export type TraceProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * A vertical list of agent steps (tool calls, searches, reasoning) as compact
 * one-line entries. Direct children that are links or buttons wrapping a
 * {@link TraceLine} get a fitted, focus-ringed hit area.
 */
export const Trace = React.forwardRef<HTMLDivElement, TraceProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="trace"
      className={cn(
        "flex w-full min-w-0 flex-col gap-2",
        "[&>*:has(>[data-slot=trace-line])]:flex [&>*:has(>[data-slot=trace-line])]:w-fit [&>*:has(>[data-slot=trace-line])]:min-w-0 [&>*:has(>[data-slot=trace-line])]:max-w-full [&>*:has(>[data-slot=trace-line])]:rounded-md [&>*:has(>[data-slot=trace-line])]:text-left [&>*:has(>[data-slot=trace-line])]:outline-none",
        "[&>*:has(>[data-slot=trace-line]):focus-visible]:ring-2 [&>*:has(>[data-slot=trace-line]):focus-visible]:ring-ring/50",
        className,
      )}
      {...props}
    />
  ),
);
Trace.displayName = "Trace";

export type TraceLineStatus = "running" | "error" | "pending";

export interface TraceLineProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Step state: "running" pulses the title, "error" tints it destructive, "pending" dims it. Omit when done. */
  status?: TraceLineStatus;
}

/**
 * One step of a {@link Trace}: an icon, title and optional description on a
 * single line. Wrap it in a link or button to make the step interactive.
 */
export const TraceLine = React.forwardRef<HTMLSpanElement, TraceLineProps>(
  ({ className, status, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="trace-line"
      data-status={status}
      className={cn(
        "flex w-fit min-w-0 max-w-full items-center gap-2 text-sm text-muted-foreground transition-colors",
        "[:is(a,button)_&]:cursor-pointer [:is(a,button):hover_&]:text-foreground",
        "data-[status=error]:text-destructive [:is(a,button):hover_&[data-status=error]]:text-destructive",
        "data-[status=pending]:opacity-60",
        "motion-safe:[&[data-status=running]>[data-slot=trace-title]]:animate-pulse",
        className,
      )}
      {...props}
    />
  ),
);
TraceLine.displayName = "TraceLine";

export type TraceIconProps = React.HTMLAttributes<HTMLSpanElement>;

/** A 16px decorative icon slot inside a {@link TraceLine} (hidden from assistive tech). */
export const TraceIcon = React.forwardRef<HTMLSpanElement, TraceIconProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="trace-icon"
      aria-hidden="true"
      className={cn(
        "flex size-4 shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [[data-slot=trace-title]~&]:-ml-1",
        className,
      )}
      {...props}
    />
  ),
);
TraceIcon.displayName = "TraceIcon";

export type TraceTitleProps = React.HTMLAttributes<HTMLSpanElement>;

/** The label of a {@link TraceLine}; truncates to one line. */
export const TraceTitle = React.forwardRef<HTMLSpanElement, TraceTitleProps>(
  ({ className, ...props }, ref) => (
    <span ref={ref} data-slot="trace-title" className={cn("min-w-0 truncate", className)} {...props} />
  ),
);
TraceTitle.displayName = "TraceTitle";

export type TraceDescriptionProps = React.HTMLAttributes<HTMLSpanElement>;

/** Secondary detail after the title, such as a duration or result count. */
export const TraceDescription = React.forwardRef<HTMLSpanElement, TraceDescriptionProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="trace-description"
      className={cn("shrink-0 tabular-nums text-muted-foreground/70", className)}
      {...props}
    />
  ),
);
TraceDescription.displayName = "TraceDescription";

export type TraceCollapsibleProps = Omit<CollapsibleProps, "open" | "onOpenChange"> &
  (
    | { open?: undefined; onOpenChange?: CollapsibleProps["onOpenChange"] }
    | { open: boolean; onOpenChange: NonNullable<CollapsibleProps["onOpenChange"]> }
  );

/**
 * A {@link Trace} step that expands to show detail (arguments, output,
 * sub-steps). Built on Nucleux `Collapsible`; uncontrolled with `defaultOpen`,
 * or controlled with `open` plus `onOpenChange`.
 */
export const TraceCollapsible = React.forwardRef<HTMLDivElement, TraceCollapsibleProps>(
  ({ className, ...props }, ref) => (
    <Collapsible
      ref={ref}
      data-slot="trace-collapsible"
      className={cn("flex w-full min-w-0 flex-col", className)}
      {...props}
    />
  ),
);
TraceCollapsible.displayName = "TraceCollapsible";

export type TraceCollapsibleTriggerProps = Omit<CollapsibleTriggerProps, "hideChevron">;

/**
 * The button that toggles a {@link TraceCollapsible}. Put a {@link TraceLine}
 * inside; a chevron is appended that rotates when expanded. Exposes
 * `aria-expanded` and `aria-controls`.
 */
export const TraceCollapsibleTrigger = React.forwardRef<HTMLButtonElement, TraceCollapsibleTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <CollapsibleTrigger
      ref={ref}
      hideChevron
      data-slot="trace-collapsible-trigger"
      className={cn(
        "group/trace-collapsible-trigger flex w-fit min-w-0 max-w-full cursor-pointer items-center justify-start gap-1 rounded-md text-left font-normal text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-0 has-[[data-status=error]]:text-destructive",
        className,
      )}
      {...props}
    >
      {children}
      <TraceIcon className="transition-transform group-aria-expanded/trace-collapsible-trigger:rotate-90">
        <ChevronRight />
      </TraceIcon>
    </CollapsibleTrigger>
  ),
);
TraceCollapsibleTrigger.displayName = "TraceCollapsibleTrigger";

export type TraceCollapsibleContentProps = CollapsibleContentProps;

/**
 * The detail revealed by a {@link TraceCollapsibleTrigger}, indented under a
 * left rule. Unmounted while collapsed; `className` styles the inner body.
 */
export const TraceCollapsibleContent = React.forwardRef<HTMLDivElement, TraceCollapsibleContentProps>(
  ({ className, children, ...props }, ref) => (
    <CollapsibleContent
      ref={ref}
      data-slot="trace-collapsible-content"
      className="min-w-0 overflow-hidden pt-0"
      {...props}
    >
      <div
        data-slot="trace-collapsible-content-inner"
        className={cn(
          "mb-1 ml-[calc(0.5rem-1px)] mt-2 min-w-0 break-words border-l border-border pl-4 pr-1 leading-relaxed text-muted-foreground",
          className,
        )}
      >
        {children}
      </div>
    </CollapsibleContent>
  ),
);
TraceCollapsibleContent.displayName = "TraceCollapsibleContent";

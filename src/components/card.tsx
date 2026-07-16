import * as React from "react";
import { cn } from "../lib/utils";

/**
 * Composable card surface. Compose the parts to match the design:
 *
 * ```tsx
 * <CardContainer>
 *   <CardHeader>
 *     <div>
 *       <CardTitle>Recent meeting</CardTitle>
 *       <CardDescription>1 in your library</CardDescription>
 *     </div>
 *     <CardAction>View all</CardAction>
 *   </CardHeader>
 *   <CardDivider />
 *   <CardContent>…</CardContent>
 * </CardContainer>
 * ```
 *
 * Named `CardContainer` to mirror the canonical Figma component.
 */
export interface CardContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContainer = React.forwardRef<HTMLDivElement, CardContainerProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-border bg-background text-foreground shadow-sm",
        className,
      )}
      {...props}
    />
  ),
);
CardContainer.displayName = "CardContainer";

/** Card header. Lays children out in a row with space-between by default. */
export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-start justify-between gap-4 px-6 py-4", className)}
      {...props}
    />
  ),
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-base font-semibold leading-6 text-foreground", className)}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

/** Trailing action in a card header, e.g. a "View all" link. Renders a button by default. */
export const CardAction = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "shrink-0 text-sm font-medium text-info transition-colors hover:text-info/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  ),
);
CardAction.displayName = "CardAction";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-6 py-4", className)} {...props} />
  ),
);
CardContent.displayName = "CardContent";

/** Full-bleed hairline divider between card sections. */
export const CardDivider = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} role="separator" className={cn("h-px w-full bg-border", className)} {...props} />
  ),
);
CardDivider.displayName = "CardDivider";

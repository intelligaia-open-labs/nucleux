import * as React from "react";
import { cn } from "@nucleux/utils";

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
export interface CardContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional classes merged onto the card surface. */
  className?: string;
}

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
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional classes merged onto the card header row. */
  className?: string;
}

/** Card header row: title/description left, action right. */
export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-start justify-between gap-4 px-6 py-4", className)}
      {...props}
    />
  ),
);
CardHeader.displayName = "CardHeader";

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Additional classes merged onto the card title. */
  className?: string;
}

/** Card heading. */
export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-base font-semibold leading-6 text-foreground", className)}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Additional classes merged onto the card description. */
  className?: string;
}

/** Muted supporting copy under the card title. */
export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

/** Trailing action in a card header, e.g. a "View all" link. Renders a button by default. */
export interface CardActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Additional classes merged onto the header action button. */
  className?: string;
  /** Button type. Defaults to "button". */
  type?: "button" | "submit" | "reset";
}

/** Compact action button in the card header. */
export const CardAction = React.forwardRef<HTMLButtonElement, CardActionProps>(
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

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional classes merged onto the card body. */
  className?: string;
}

/** Card body region. */
export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-6 py-4", className)} {...props} />
  ),
);
CardContent.displayName = "CardContent";

/** Full-bleed hairline divider between card sections. */
export interface CardDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional classes merged onto the divider. */
  className?: string;
}

/** Full-width hairline separator inside a card. */
export const CardDivider = React.forwardRef<HTMLDivElement, CardDividerProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} role="separator" className={cn("h-px w-full bg-border", className)} {...props} />
  ),
);
CardDivider.displayName = "CardDivider";

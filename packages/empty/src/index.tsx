import * as React from "react";
import { cn } from "@nucleux/utils";

/**
 * An empty state: nothing here yet, no results, or something to recover from.
 * Compose EmptyHeader (EmptyMedia, EmptyTitle, EmptyDescription) and
 * EmptyContent (actions). Add `border` for a dashed outline. For a failure,
 * give the root `role="alert"` and EmptyMedia a destructive tint.
 */
export const Empty = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="empty"
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-xl border-dashed p-6 text-center text-balance md:p-12",
        className,
      )}
      {...props}
    />
  ),
);
Empty.displayName = "Empty";

/** Groups the media, title and description. */
export const EmptyHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} data-slot="empty-header" className={cn("flex max-w-sm flex-col items-center gap-2", className)} {...props} />
  ),
);
EmptyHeader.displayName = "EmptyHeader";

export interface EmptyMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** "icon" puts the child icon in a muted rounded tile; "default" renders it as-is (e.g. an avatar or illustration). */
  variant?: "default" | "icon";
}

/** The icon or illustration above the title. */
export const EmptyMedia = React.forwardRef<HTMLDivElement, EmptyMediaProps>(
  ({ variant = "default", className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="empty-media"
      aria-hidden={variant === "icon" ? true : undefined}
      className={cn(
        "mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
        variant === "icon" && "size-10 rounded-lg bg-muted text-foreground [&_svg:not([class*='size-'])]:size-6",
        className,
      )}
      {...props}
    />
  ),
);
EmptyMedia.displayName = "EmptyMedia";

/** Headline, e.g. "No projects yet". */
export const EmptyTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} data-slot="empty-title" className={cn("text-lg font-medium tracking-tight text-foreground", className)} {...props} />
  ),
);
EmptyTitle.displayName = "EmptyTitle";

/** Supporting explanation; links inside are underlined. */
export const EmptyDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      data-slot="empty-description"
      className={cn(
        "text-sm/relaxed text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-foreground",
        className,
      )}
      {...props}
    />
  ),
);
EmptyDescription.displayName = "EmptyDescription";

/** Actions and anything else below the header (buttons, a search field, a link). */
export const EmptyContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="empty-content"
      className={cn("flex w-full min-w-0 max-w-sm flex-col items-center gap-4 text-sm text-balance", className)}
      {...props}
    />
  ),
);
EmptyContent.displayName = "EmptyContent";

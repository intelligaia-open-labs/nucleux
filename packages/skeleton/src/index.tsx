import * as React from "react";
import { cn } from "@nucleux/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Pill shape for text/avatar placeholders. */
  circle?: boolean;
}

/** A pulsing placeholder for content that is still loading. */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, circle = false, ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        "animate-pulse bg-muted",
        circle ? "rounded-full" : "rounded-md",
        className,
      )}
      {...props}
    />
  ),
);
Skeleton.displayName = "Skeleton";

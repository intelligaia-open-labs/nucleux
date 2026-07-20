import * as React from "react";
import { cn } from "@nucleux/utils";

export interface RelatedPatternsGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of columns (default 2). */
  columns?: number;
}

/** A responsive grid of {@link RelatedPatternCard}s. */
export const RelatedPatternsGrid = React.forwardRef<HTMLDivElement, RelatedPatternsGridProps>(
  ({ columns = 2, className, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("grid gap-4", className)}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, ...style }}
      {...props}
    />
  ),
);
RelatedPatternsGrid.displayName = "RelatedPatternsGrid";

export interface RelatedPatternCardProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "title"> {
  /** Card title. */
  title: React.ReactNode;
  /** Supporting meta text, e.g. "Onboarding · Trust & Disclosure". */
  meta?: React.ReactNode;
}

/** A compact card linking to a related pattern. */
export const RelatedPatternCard = React.forwardRef<HTMLAnchorElement, RelatedPatternCardProps>(
  ({ title, meta, className, ...props }, ref) => (
    <a
      ref={ref}
      className={cn(
        "flex flex-col gap-1 rounded-md border border-border bg-background p-3.5 text-left transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    >
      <span className="text-xs font-semibold text-foreground">{title}</span>
      {meta && <span className="text-xs text-muted-foreground">{meta}</span>}
    </a>
  ),
);
RelatedPatternCard.displayName = "RelatedPatternCard";

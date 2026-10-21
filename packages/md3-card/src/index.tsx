import * as React from "react";
import { cn } from "@nucleux/utils";

export type Md3CardVariant = "elevated" | "filled" | "outlined";

export interface Md3CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Md3CardVariant;
  /** Add hover/press state layer + pointer cursor (for actionable cards). */
  interactive?: boolean;
}

const variants: Record<Md3CardVariant, string> = {
  elevated: "bg-md-surface-container-low text-md-on-surface shadow-md-1",
  filled: "bg-md-surface-container-high text-md-on-surface",
  outlined: "border border-md-outline-variant bg-md-surface text-md-on-surface",
};

/** A Material Design 3 card surface (elevated, filled, outlined). */
export const Md3Card = React.forwardRef<HTMLDivElement, Md3CardProps>(
  ({ variant = "elevated", interactive = false, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-md-md",
        variants[variant],
        interactive && [
          "cursor-pointer transition-shadow hover:shadow-md-2",
          "before:absolute before:inset-0 before:bg-md-on-surface before:opacity-0 before:transition-opacity before:content-['']",
          "hover:before:opacity-[0.08] active:before:opacity-[0.12]",
        ],
        className,
      )}
      {...props}
    >
      {interactive ? <div className="relative">{children}</div> : children}
    </div>
  ),
);
Md3Card.displayName = "Md3Card";

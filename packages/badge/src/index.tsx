import * as React from "react";
import { cn } from "@nucleux/utils";

export type BadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "success"
  | "info"
  | "destructive";

const badgeVariants: Record<BadgeVariant, string> = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-muted text-muted-foreground",
  outline: "border border-border bg-background text-foreground",
  success: "bg-success/15 text-success",
  info: "bg-info/15 text-info",
  destructive: "bg-destructive/15 text-destructive",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Visual style. */
  variant?: BadgeVariant;
  /** Optional icon rendered before the label. */
  icon?: React.ReactNode;
}

/** Compact status pill — action counts, states ("Summarized"), progress ("1/3 Done"). */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "default", icon, className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium leading-4",
        badgeVariants[variant],
        className,
      )}
      {...props}
    >
      {icon && <span className="-ml-0.5 inline-flex shrink-0 items-center">{icon}</span>}
      {children}
    </span>
  ),
);
Badge.displayName = "Badge";

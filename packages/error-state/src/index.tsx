import * as React from "react";
import { cn } from "@nucleux/utils";
import { TriangleAlert } from "lucide-react";

export type ErrorStateVariant = "empty" | "error";

export interface ErrorStateProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** `empty` for neutral empty states, `error` for a failure (tints the icon). */
  variant?: ErrorStateVariant;
  /** Icon shown above the title. */
  icon?: React.ReactNode;
  /** Headline, e.g. `"Something went wrong"`. */
  title: React.ReactNode;
  /** Supporting explanation. */
  description?: React.ReactNode;
  /** Action buttons, e.g. Retry / Edit prompt. */
  actions?: React.ReactNode;
}

/**
 * A centered empty / failure state — icon, title, description and recovery
 * actions. The AI-failure variant is the "your prompt didn't go through, your
 * draft is saved" recovery card.
 * Source: Figma "Recovery / Error & Empty States".
 */
export const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  ({ variant = "empty", icon, title, description, actions, className, children, ...props }, ref) => (
    <div
      ref={ref}
      role={variant === "error" ? "alert" : undefined}
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border border-border bg-background px-6 py-10 text-center",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "inline-flex size-12 items-center justify-center rounded-full [&_svg]:size-6",
          variant === "error" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground",
        )}
      >
        {icon ?? <TriangleAlert aria-hidden="true" />}
      </span>
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
      {actions && <div className="mt-1 flex flex-wrap items-center justify-center gap-2">{actions}</div>}
    </div>
  ),
);
ErrorState.displayName = "ErrorState";

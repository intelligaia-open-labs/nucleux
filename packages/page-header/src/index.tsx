import * as React from "react";
import { cn } from "@nucleux/utils";

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Page title (large heading). */
  title: React.ReactNode;
  /** Supporting description below the title. */
  description?: React.ReactNode;
  /** Badges / tags rendered in a row above the title. */
  badges?: React.ReactNode;
  /** Trailing actions aligned to the right of the title. */
  actions?: React.ReactNode;
}

/**
 * A page header block — an optional badge row, a large title, a description,
 * and optional trailing actions. Source: Figma "AIUX / Page Header Block".
 */
export const PageHeader = React.forwardRef<HTMLElement, PageHeaderProps>(
  ({ title, description, badges, actions, className, ...props }, ref) => (
    <header ref={ref} className={cn("flex flex-col gap-4", className)} {...props}>
      {badges && <div className="flex flex-wrap items-center gap-2">{badges}</div>}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-4xl font-normal tracking-tight text-foreground sm:text-5xl">{title}</h1>
          {description && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </header>
  ),
);
PageHeader.displayName = "PageHeader";

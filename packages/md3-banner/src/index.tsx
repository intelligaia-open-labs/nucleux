import * as React from "react";
import { cn } from "@nucleux/utils";

export interface Md3BannerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Leading icon. */
  icon?: React.ReactNode;
  /** Trailing action buttons (typically text buttons). */
  actions?: React.ReactNode;
}

/** A Material Design 3 banner — a prominent, dismissible message with actions. */
export const Md3Banner = React.forwardRef<HTMLDivElement, Md3BannerProps>(
  ({ icon, actions, className, children, ...props }, ref) => (
    <div
      ref={ref}
      role="region"
      className={cn(
        "flex flex-col gap-3 border-b border-md-outline-variant bg-md-surface px-4 py-3 text-md-on-surface sm:flex-row sm:items-center",
        className,
      )}
      {...props}
    >
      <div className="flex flex-1 items-start gap-4">
        {icon && <span className="mt-0.5 shrink-0 text-md-primary [&_svg]:size-6">{icon}</span>}
        <p className="text-sm text-md-on-surface-variant">{children}</p>
      </div>
      {actions && <div className="flex shrink-0 justify-end gap-2">{actions}</div>}
    </div>
  ),
);
Md3Banner.displayName = "Md3Banner";

import * as React from "react";
import { CheckCircle2, CircleAlert, Info, TriangleAlert } from "lucide-react";
import { cn } from "@nucleux/utils";

export type AlertVariant = "default" | "info" | "success" | "warning" | "destructive";

const alertVariants: Record<AlertVariant, string> = {
  default: "border-border bg-card text-foreground [&_[data-alert-icon]]:text-muted-foreground",
  info: "border-info/30 bg-info/5 text-foreground [&_[data-alert-icon]]:text-info",
  success: "border-success/30 bg-success/5 text-foreground [&_[data-alert-icon]]:text-success",
  warning: "border-warning/40 bg-warning/10 text-foreground [&_[data-alert-icon]]:text-warning",
  destructive:
    "border-destructive/30 bg-destructive/5 text-foreground [&_[data-alert-icon]]:text-destructive",
};

const defaultIcon: Record<AlertVariant, React.ComponentType<{ className?: string }>> = {
  default: Info,
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  destructive: CircleAlert,
};

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: AlertVariant;
  /** Optional bold title above the body. */
  title?: React.ReactNode;
  /** Custom icon; defaults to a variant-appropriate one. */
  icon?: React.ReactNode;
  /** Hide the leading icon entirely. */
  hideIcon?: boolean;
}

/** Contextual message banner — info, success, warning, or error. */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = "default", title, icon, hideIcon = false, className, children, ...props }, ref) => {
    const Icon = defaultIcon[variant];
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "flex items-start gap-3 rounded-lg border p-4 text-sm",
          alertVariants[variant],
          className,
        )}
        {...props}
      >
        {!hideIcon && (
          <span data-alert-icon className="mt-0.5 shrink-0 [&_svg]:size-4">
            {icon ?? <Icon />}
          </span>
        )}
        <div className="min-w-0 flex-1 space-y-1">
          {title && <p className="font-medium leading-none">{title}</p>}
          {children && <div className="leading-relaxed text-muted-foreground">{children}</div>}
        </div>
      </div>
    );
  },
);
Alert.displayName = "Alert";

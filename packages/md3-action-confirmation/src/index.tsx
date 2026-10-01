import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@nucleux/utils";

export type Md3ActionConfirmationVariant = "default" | "destructive";

export interface Md3ActionConfirmationProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  variant?: Md3ActionConfirmationVariant;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  confirmLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const stateLayer =
  "before:absolute before:inset-0 before:bg-current before:opacity-0 before:transition-opacity before:content-[''] hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12] active:before:opacity-[0.12]";

/**
 * A Material Design 3 guardrail shown before an agent performs a consequential
 * action — tonal surface, state-layer actions. Same API as {@link ActionConfirmation}.
 */
export const Md3ActionConfirmation = React.forwardRef<HTMLDivElement, Md3ActionConfirmationProps>(
  (
    {
      title,
      description,
      variant = "destructive",
      badge = "AI action",
      icon,
      confirmLabel = "Confirm",
      cancelLabel = "Cancel",
      onConfirm,
      onCancel,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const destructive = variant === "destructive";
    return (
      <div
        ref={ref}
        role="alertdialog"
        aria-label={typeof title === "string" ? title : undefined}
        className={cn(
          "flex flex-col gap-3 rounded-md-xl bg-md-surface-container-high p-5 text-md-on-surface shadow-md-1",
          className,
        )}
        {...props}
      >
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full [&_svg]:size-4",
              destructive
                ? "bg-md-error-container text-md-on-error-container"
                : "bg-md-tertiary-container text-md-on-tertiary-container",
            )}
          >
            {icon ?? <AlertTriangle aria-hidden="true" />}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            {badge && (
              <span className="inline-flex w-fit items-center rounded-full bg-md-secondary-container px-2 py-0.5 text-[0.6875rem] font-medium uppercase tracking-wide text-md-on-secondary-container">
                {badge}
              </span>
            )}
            <h3 className="text-base font-semibold text-md-on-surface">{title}</h3>
            {description && <p className="text-sm text-md-on-surface-variant">{description}</p>}
            {children}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              "relative inline-flex h-10 items-center overflow-hidden rounded-full border border-md-outline px-5 text-sm font-medium text-md-primary outline-none focus-visible:ring-2 focus-visible:ring-md-primary",
              stateLayer,
            )}
          >
            <span className="relative">{cancelLabel}</span>
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              "relative inline-flex h-10 items-center overflow-hidden rounded-full px-5 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-md-surface",
              destructive
                ? "bg-md-error text-md-on-error focus-visible:ring-md-error"
                : "bg-md-primary text-md-on-primary focus-visible:ring-md-primary",
              stateLayer,
            )}
          >
            <span className="relative">{confirmLabel}</span>
          </button>
        </div>
      </div>
    );
  },
);
Md3ActionConfirmation.displayName = "Md3ActionConfirmation";

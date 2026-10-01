import * as React from "react";
import { cn } from "@nucleux/utils";
import { AlertTriangle } from "lucide-react";

export type ActionConfirmationVariant = "default" | "destructive";

export interface ActionConfirmationProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** The action in question, e.g. `"Send 18 emails?"`. */
  title: React.ReactNode;
  /** What will happen / why it matters. */
  description?: React.ReactNode;
  /** Risk styling. `destructive` for irreversible/high-impact actions. */
  variant?: ActionConfirmationVariant;
  /** Badge text marking this as an agent action. Defaults to `"AI action"`. */
  badge?: React.ReactNode;
  /** Leading icon. Defaults to a warning triangle. */
  icon?: React.ReactNode;
  confirmLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
}

/**
 * A guardrail shown before an agent performs a consequential or irreversible
 * action — states the action, its impact, and requires explicit confirmation.
 * Source: Figma "Recovery / Verification".
 */
export const ActionConfirmation = React.forwardRef<HTMLDivElement, ActionConfirmationProps>(
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
          "flex flex-col gap-3 rounded-xl border bg-background p-5",
          destructive ? "border-destructive/50" : "border-border",
          className,
        )}
        {...props}
      >
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4",
              destructive ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning",
            )}
          >
            {icon ?? <AlertTriangle aria-hidden="true" />}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            {badge && (
              <span className="inline-flex w-fit items-center rounded-full bg-muted px-2 py-0.5 text-[0.6875rem] font-medium uppercase tracking-wide text-muted-foreground">
                {badge}
              </span>
            )}
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            {children}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              "inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              destructive
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-info text-info-foreground hover:bg-info/90",
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    );
  },
);
ActionConfirmation.displayName = "ActionConfirmation";

import * as React from "react";
import { cn } from "@nucleux/utils";

export interface Md3ActionPlanStepProps
  extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "title"> {
  /** Step title. */
  title: React.ReactNode;
  /** Supporting detail under the title. */
  description?: React.ReactNode;
}

/** A single step in an {@link Md3ActionPlan}. Numbered automatically by its order. */
export const Md3ActionPlanStep = React.forwardRef<HTMLLIElement, Md3ActionPlanStepProps>(
  ({ title, description, className, ...props }, ref) => (
    <li
      ref={ref}
      className={cn(
        "flex gap-3 [counter-increment:nx-step]",
        "before:mt-0.5 before:inline-flex before:size-6 before:shrink-0 before:items-center before:justify-center before:rounded-full before:bg-md-secondary-container before:text-xs before:font-semibold before:text-md-on-secondary-container before:[content:counter(nx-step)]",
        className,
      )}
      {...props}
    >
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-medium text-md-on-surface">{title}</span>
        {description && <span className="text-xs text-md-on-surface-variant">{description}</span>}
      </span>
    </li>
  ),
);
Md3ActionPlanStep.displayName = "Md3ActionPlanStep";

export interface Md3ActionPlanProps extends React.HTMLAttributes<HTMLDivElement> {
  heading?: React.ReactNode;
  description?: React.ReactNode;
  onAccept?: () => void;
  onEdit?: () => void;
  onReject?: () => void;
  acceptLabel?: React.ReactNode;
  editLabel?: React.ReactNode;
  rejectLabel?: React.ReactNode;
}

const stateLayer =
  "before:absolute before:inset-0 before:bg-current before:opacity-0 before:transition-opacity before:content-[''] hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12] active:before:opacity-[0.12]";

/**
 * A Material Design 3 action plan: a proposed multi-step plan the user can
 * accept, edit, or reject (human-in-the-loop). Same API as {@link ActionPlan}.
 */
export const Md3ActionPlan = React.forwardRef<HTMLDivElement, Md3ActionPlanProps>(
  (
    {
      heading = "Proposed plan",
      description,
      onAccept,
      onEdit,
      onReject,
      acceptLabel = "Accept plan",
      editLabel = "Edit plan",
      rejectLabel = "Reject",
      className,
      children,
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-4 rounded-md-lg border border-md-outline-variant bg-md-surface-container-low p-5 text-md-on-surface",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col gap-1">
        {heading && <h3 className="text-sm font-semibold text-md-on-surface">{heading}</h3>}
        {description && <p className="text-sm text-md-on-surface-variant">{description}</p>}
      </div>
      <ol className="flex flex-col gap-3 [counter-reset:nx-step]">{children}</ol>
      {(onAccept || onEdit || onReject) && (
        <div className="flex flex-wrap items-center gap-2">
          {onAccept && (
            <button
              type="button"
              onClick={onAccept}
              className={cn(
                "relative inline-flex h-10 items-center overflow-hidden rounded-full bg-md-primary px-6 text-sm font-medium text-md-on-primary outline-none focus-visible:ring-2 focus-visible:ring-md-primary focus-visible:ring-offset-2 focus-visible:ring-offset-md-surface",
                stateLayer,
              )}
            >
              <span className="relative">{acceptLabel}</span>
            </button>
          )}
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className={cn(
                "relative inline-flex h-10 items-center overflow-hidden rounded-full border border-md-outline px-6 text-sm font-medium text-md-primary outline-none focus-visible:ring-2 focus-visible:ring-md-primary",
                stateLayer,
              )}
            >
              <span className="relative">{editLabel}</span>
            </button>
          )}
          {onReject && (
            <button
              type="button"
              onClick={onReject}
              className={cn(
                "relative ml-auto inline-flex h-10 items-center overflow-hidden rounded-full px-4 text-sm font-medium text-md-primary outline-none focus-visible:ring-2 focus-visible:ring-md-primary",
                stateLayer,
              )}
            >
              <span className="relative">{rejectLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  ),
);
Md3ActionPlan.displayName = "Md3ActionPlan";

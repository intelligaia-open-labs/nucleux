import * as React from "react";
import { cn } from "@nucleux/utils";

export interface ActionPlanStepProps
  extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "title"> {
  /** Step title. */
  title: React.ReactNode;
  /** Supporting detail under the title. */
  description?: React.ReactNode;
}

/** A single step in an {@link ActionPlan}. Numbered automatically by its order. */
export const ActionPlanStep = React.forwardRef<HTMLLIElement, ActionPlanStepProps>(
  ({ title, description, className, ...props }, ref) => (
    <li
      ref={ref}
      className={cn(
        "flex gap-3 [counter-increment:nx-step]",
        "before:mt-0.5 before:inline-flex before:size-6 before:shrink-0 before:items-center before:justify-center before:rounded-full before:bg-muted before:text-xs before:font-semibold before:text-muted-foreground before:[content:counter(nx-step)]",
        className,
      )}
      {...props}
    >
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">{title}</span>
        {description && <span className="text-xs text-muted-foreground">{description}</span>}
      </span>
    </li>
  ),
);
ActionPlanStep.displayName = "ActionPlanStep";

export interface ActionPlanProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Heading, e.g. `"Proposed plan"`. */
  heading?: React.ReactNode;
  /** Short description of what the agent intends to do. */
  description?: React.ReactNode;
  /** Called when the plan is accepted. Renders the accept button when set. */
  onAccept?: () => void;
  /** Called when the user asks to edit the plan. Renders the edit button when set. */
  onEdit?: () => void;
  /** Called when the plan is rejected. Renders the reject button when set. */
  onReject?: () => void;
  acceptLabel?: React.ReactNode;
  editLabel?: React.ReactNode;
  rejectLabel?: React.ReactNode;
}

/**
 * A multi-step plan an agent proposes before executing — the user can accept,
 * edit, or reject it. Human-in-the-loop approval for autonomous work.
 * Source: Figma "During Interaction / Action Plan".
 */
export const ActionPlan = React.forwardRef<HTMLDivElement, ActionPlanProps>(
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
      className={cn("flex flex-col gap-4 rounded-xl border border-border bg-background p-5", className)}
      {...props}
    >
      <div className="flex flex-col gap-1">
        {heading && <h3 className="text-sm font-semibold text-foreground">{heading}</h3>}
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <ol className="flex flex-col gap-3 [counter-reset:nx-step]">{children}</ol>
      {(onAccept || onEdit || onReject) && (
        <div className="flex flex-wrap items-center gap-2">
          {onAccept && (
            <button
              type="button"
              onClick={onAccept}
              className="inline-flex items-center rounded-lg bg-info px-3 py-2 text-sm font-medium text-info-foreground transition-colors hover:bg-info/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {acceptLabel}
            </button>
          )}
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {editLabel}
            </button>
          )}
          {onReject && (
            <button
              type="button"
              onClick={onReject}
              className="ml-auto inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {rejectLabel}
            </button>
          )}
        </div>
      )}
    </div>
  ),
);
ActionPlan.displayName = "ActionPlan";

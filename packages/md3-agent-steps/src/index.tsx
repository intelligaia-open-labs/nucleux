import * as React from "react";
import { Check, Circle, Loader2, X } from "lucide-react";
import { cn } from "@nucleux/utils";

export type Md3AgentStepStatus = "pending" | "active" | "done" | "error";

export interface Md3AgentStepProps
  extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "title"> {
  status?: Md3AgentStepStatus;
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  progress?: number;
}

const marker: Record<Md3AgentStepStatus, string> = {
  pending: "border-md-outline bg-md-surface text-md-on-surface-variant",
  active: "border-md-primary bg-md-primary-container text-md-on-primary-container",
  done: "border-md-primary bg-md-primary text-md-on-primary",
  error: "border-md-error bg-md-error text-md-on-error",
};

function StatusGlyph({ status }: { status: Md3AgentStepStatus }) {
  if (status === "done") return <Check className="size-3.5" aria-hidden="true" />;
  if (status === "active") return <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />;
  if (status === "error") return <X className="size-3.5" aria-hidden="true" />;
  return <Circle className="size-2 fill-current" aria-hidden="true" />;
}

/** A single step in an {@link Md3AgentSteps} tracker. */
export const Md3AgentStep = React.forwardRef<HTMLLIElement, Md3AgentStepProps>(
  ({ status = "pending", icon, title, description, progress, className, ...props }, ref) => (
    <li
      ref={ref}
      className={cn(
        "relative flex gap-3 pb-5 last:pb-0",
        "before:absolute before:left-[0.6875rem] before:top-6 before:h-[calc(100%-1.25rem)] before:w-px before:-translate-x-1/2 before:bg-md-outline-variant last:before:hidden",
        className,
      )}
      aria-current={status === "active" ? "step" : undefined}
      {...props}
    >
      <span
        className={cn(
          "relative z-10 mt-0.5 inline-flex size-[1.375rem] shrink-0 items-center justify-center rounded-full border [&_svg]:size-3.5",
          marker[status],
        )}
      >
        {icon ?? <StatusGlyph status={status} />}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span
          className={cn(
            "text-sm font-medium",
            status === "pending" ? "text-md-on-surface-variant" : "text-md-on-surface",
          )}
        >
          {title}
        </span>
        {description && <span className="text-xs text-md-on-surface-variant">{description}</span>}
        {progress != null && (
          <span className="mt-1 block h-1 w-full overflow-hidden rounded-full bg-md-surface-variant">
            <span
              className="block h-full rounded-full bg-md-primary transition-[width]"
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </span>
        )}
      </span>
    </li>
  ),
);
Md3AgentStep.displayName = "Md3AgentStep";

export type Md3AgentStepsProps = React.HTMLAttributes<HTMLOListElement>;

/** A Material Design 3 live tracker of an agent's multi-step plan. Same API as {@link AgentSteps}. */
export const Md3AgentSteps = React.forwardRef<HTMLOListElement, Md3AgentStepsProps>(
  ({ className, children, ...props }, ref) => (
    <ol ref={ref} className={cn("flex flex-col", className)} {...props}>
      {children}
    </ol>
  ),
);
Md3AgentSteps.displayName = "Md3AgentSteps";

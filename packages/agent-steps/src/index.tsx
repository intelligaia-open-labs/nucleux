import * as React from "react";
import { cn } from "@nucleux/utils";
import { Check, Loader2, Circle, X } from "lucide-react";

export type AgentStepStatus = "pending" | "active" | "done" | "error";

export interface AgentStepProps
  extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "title"> {
  /** Execution status of the step. */
  status?: AgentStepStatus;
  /** Action-type icon (e.g. read, execute, search). Overrides the status glyph. */
  icon?: React.ReactNode;
  /** Step label. */
  title: React.ReactNode;
  /** Supporting detail under the title. */
  description?: React.ReactNode;
  /** Optional progress track, 0–100, shown under the step while active. */
  progress?: number;
}

const marker: Record<AgentStepStatus, string> = {
  pending: "border-border bg-background text-muted-foreground",
  active: "border-info bg-info/10 text-info",
  done: "border-success bg-success text-success-foreground",
  error: "border-destructive bg-destructive text-destructive-foreground",
};

function StatusGlyph({ status }: { status: AgentStepStatus }) {
  if (status === "done") return <Check className="size-3.5" aria-hidden="true" />;
  if (status === "active") return <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />;
  if (status === "error") return <X className="size-3.5" aria-hidden="true" />;
  return <Circle className="size-2 fill-current" aria-hidden="true" />;
}

/** A single step in an {@link AgentSteps} tracker. */
export const AgentStep = React.forwardRef<HTMLLIElement, AgentStepProps>(
  ({ status = "pending", icon, title, description, progress, className, ...props }, ref) => (
    <li
      ref={ref}
      className={cn(
        "relative flex gap-3 pb-5 last:pb-0",
        "before:absolute before:left-[0.6875rem] before:top-6 before:h-[calc(100%-1.25rem)] before:w-px before:-translate-x-1/2 before:bg-border last:before:hidden",
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
            status === "pending" ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {title}
        </span>
        {description && <span className="text-xs text-muted-foreground">{description}</span>}
        {progress != null && (
          <span className="mt-1 block h-1 w-full overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full bg-info transition-[width]"
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </span>
        )}
      </span>
    </li>
  ),
);
AgentStep.displayName = "AgentStep";

export interface AgentStepsProps extends React.HTMLAttributes<HTMLOListElement> {}

/**
 * A live tracker of an agent's multi-step plan — each {@link AgentStep} shows an
 * action-type icon, status and optional progress as the agent works.
 * Source: Figma "During Interaction / Processing Steps · Footprints".
 */
export const AgentSteps = React.forwardRef<HTMLOListElement, AgentStepsProps>(
  ({ className, children, ...props }, ref) => (
    <ol ref={ref} className={cn("flex flex-col", className)} {...props}>
      {children}
    </ol>
  ),
);
AgentSteps.displayName = "AgentSteps";

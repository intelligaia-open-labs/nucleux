import * as React from "react";
import { Check, ChevronRight, CircleAlert, Loader2, Wrench } from "lucide-react";
import { cn } from "../lib/utils";
import type { ToolCall as ToolCallData, ToolCallStatus } from "../lib/types";

const statusMeta: Record<
  ToolCallStatus,
  { label: string; className: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  pending: { label: "Pending", className: "text-muted-foreground", Icon: Wrench },
  running: { label: "Running", className: "text-foreground", Icon: Loader2 },
  success: { label: "Completed", className: "text-success", Icon: Check },
  error: { label: "Failed", className: "text-destructive", Icon: CircleAlert },
};

function stringify(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export interface ToolCallProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** The tool call to render. */
  toolCall: ToolCallData;
  /** Whether the details are expanded initially. */
  defaultOpen?: boolean;
}

/**
 * A collapsible card visualizing an agent tool/function call: its name, live
 * status, arguments, and result.
 */
export const ToolCall = React.forwardRef<HTMLDivElement, ToolCallProps>(
  ({ toolCall, defaultOpen = false, className, ...props }, ref) => {
    const [open, setOpen] = React.useState(defaultOpen);
    const { label, className: statusClass, Icon } = statusMeta[toolCall.status];
    const args = stringify(toolCall.args);
    const result = stringify(toolCall.result);

    return (
      <div
        ref={ref}
        className={cn(
          "overflow-hidden rounded-md border border-border bg-background text-sm animate-nx-fade-in",
          className,
        )}
        {...props}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronRight
            className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-90")}
          />
          <Wrench className="size-4 shrink-0 text-muted-foreground" />
          <span className="font-mono font-medium text-foreground">{toolCall.name}</span>
          <span className={cn("ml-auto inline-flex items-center gap-1 text-xs", statusClass)}>
            <Icon className={cn("size-3.5", toolCall.status === "running" && "animate-spin")} />
            {label}
          </span>
        </button>

        {open && (
          <div className="space-y-3 border-t border-border px-3 py-2.5">
            {args && (
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Arguments</p>
                <pre className="overflow-x-auto rounded bg-muted/50 p-2 font-mono text-xs text-foreground">
                  {args}
                </pre>
              </div>
            )}
            {result && (
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Result</p>
                <pre className="overflow-x-auto rounded bg-muted/50 p-2 font-mono text-xs text-foreground">
                  {result}
                </pre>
              </div>
            )}
            {!args && !result && (
              <p className="text-xs text-muted-foreground">No arguments or result yet.</p>
            )}
          </div>
        )}
      </div>
    );
  },
);
ToolCall.displayName = "ToolCall";

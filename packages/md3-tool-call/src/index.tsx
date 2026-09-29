import * as React from "react";
import { Check, ChevronRight, CircleAlert, Loader2, Wrench } from "lucide-react";
import { cn } from "@nucleux/utils";
import type { ToolCallData, ToolCallStatus } from "@nucleux/utils";

const statusMeta: Record<
  ToolCallStatus,
  { label: string; className: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  pending: { label: "Pending", className: "text-md-on-surface-variant", Icon: Wrench },
  running: { label: "Running", className: "text-md-primary", Icon: Loader2 },
  success: { label: "Completed", className: "text-md-primary", Icon: Check },
  error: { label: "Failed", className: "text-md-error", Icon: CircleAlert },
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

export interface Md3ToolCallProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** The tool call to render. */
  toolCall: ToolCallData;
  /** Whether the details are expanded initially. */
  defaultOpen?: boolean;
}

/**
 * A Material Design 3 tool-call card: name, live status, arguments, and result,
 * with a tonal surface and an on-color state layer. Same API as {@link ToolCall}.
 */
export const Md3ToolCall = React.forwardRef<HTMLDivElement, Md3ToolCallProps>(
  ({ toolCall, defaultOpen = false, className, ...props }, ref) => {
    const [open, setOpen] = React.useState(defaultOpen);
    const { label, className: statusClass, Icon } = statusMeta[toolCall.status];
    const args = stringify(toolCall.args);
    const result = stringify(toolCall.result);

    return (
      <div
        ref={ref}
        className={cn(
          "overflow-hidden rounded-md-md border border-md-outline-variant bg-md-surface-container-low text-sm text-md-on-surface animate-nx-fade-in",
          className,
        )}
        {...props}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={cn(
            "relative flex w-full items-center gap-2 overflow-hidden px-3 py-2.5 text-left outline-none",
            "before:absolute before:inset-0 before:bg-md-on-surface before:opacity-0 before:transition-opacity before:content-['']",
            "hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12]",
          )}
        >
          <ChevronRight
            className={cn("relative size-4 shrink-0 text-md-on-surface-variant transition-transform", open && "rotate-90")}
          />
          <Wrench className="relative size-4 shrink-0 text-md-on-surface-variant" />
          <span className="relative font-mono font-medium text-md-on-surface">{toolCall.name}</span>
          <span className={cn("relative ml-auto inline-flex items-center gap-1 text-xs", statusClass)}>
            <Icon className={cn("size-3.5", toolCall.status === "running" && "animate-spin")} />
            {label}
          </span>
        </button>

        {open && (
          <div className="space-y-3 border-t border-md-outline-variant px-3 py-2.5">
            {args && (
              <div>
                <p className="mb-1 text-xs font-medium text-md-on-surface-variant">Arguments</p>
                <pre className="overflow-x-auto rounded-md-xs bg-md-surface-variant p-2 font-mono text-xs text-md-on-surface">
                  {args}
                </pre>
              </div>
            )}
            {result && (
              <div>
                <p className="mb-1 text-xs font-medium text-md-on-surface-variant">Result</p>
                <pre className="overflow-x-auto rounded-md-xs bg-md-surface-variant p-2 font-mono text-xs text-md-on-surface">
                  {result}
                </pre>
              </div>
            )}
            {!args && !result && <p className="text-xs text-md-on-surface-variant">No arguments or result yet.</p>}
          </div>
        )}
      </div>
    );
  },
);
Md3ToolCall.displayName = "Md3ToolCall";

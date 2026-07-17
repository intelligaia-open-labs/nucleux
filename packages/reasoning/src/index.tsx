import * as React from "react";
import { Brain, ChevronRight } from "lucide-react";
import { cn } from "@nucleux/utils";

export interface ReasoningProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The reasoning / thinking text to reveal. */
  content: string;
  /** Whether reasoning is still streaming (shows a subtle pulse). */
  streaming?: boolean;
  /** Expanded by default. */
  defaultOpen?: boolean;
  /** Header label. */
  label?: string;
}

/**
 * A collapsible panel for an agent's chain-of-thought / reasoning tokens,
 * visually de-emphasized from the final answer.
 */
export const Reasoning = React.forwardRef<HTMLDivElement, ReasoningProps>(
  ({ content, streaming = false, defaultOpen = false, label = "Reasoning", className, ...props }, ref) => {
    const [open, setOpen] = React.useState(defaultOpen);
    return (
      <div
        ref={ref}
        className={cn("rounded-md border border-dashed border-border bg-muted/30", className)}
        {...props}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Brain className={cn("size-4 shrink-0", streaming && "animate-pulse")} />
          <span className="font-medium">{label}</span>
          <ChevronRight
            className={cn("ml-auto size-4 transition-transform", open && "rotate-90")}
          />
        </button>
        {open && (
          <div className="whitespace-pre-wrap break-words border-t border-border px-3 py-2 text-sm italic text-muted-foreground">
            {content}
          </div>
        )}
      </div>
    );
  },
);
Reasoning.displayName = "Reasoning";

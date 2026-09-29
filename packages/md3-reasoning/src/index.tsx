import * as React from "react";
import { Brain, ChevronRight } from "lucide-react";
import { cn } from "@nucleux/utils";

export interface Md3ReasoningProps extends React.HTMLAttributes<HTMLDivElement> {
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
 * A Material Design 3 collapsible chain-of-thought panel, de-emphasized from the
 * final answer with a tonal surface and a state layer. Same API as {@link Reasoning}.
 */
export const Md3Reasoning = React.forwardRef<HTMLDivElement, Md3ReasoningProps>(
  ({ content, streaming = false, defaultOpen = false, label = "Reasoning", className, ...props }, ref) => {
    const [open, setOpen] = React.useState(defaultOpen);
    return (
      <div
        ref={ref}
        className={cn("overflow-hidden rounded-md-md bg-md-surface-container-low", className)}
        {...props}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={cn(
            "relative flex w-full items-center gap-2 overflow-hidden px-3 py-2.5 text-left text-sm text-md-on-surface-variant outline-none",
            "before:absolute before:inset-0 before:bg-md-on-surface before:opacity-0 before:transition-opacity before:content-['']",
            "hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12]",
          )}
        >
          <Brain className={cn("relative size-4 shrink-0", streaming && "animate-pulse")} />
          <span className="relative font-medium">{label}</span>
          <ChevronRight className={cn("relative ml-auto size-4 transition-transform", open && "rotate-90")} />
        </button>
        {open && (
          <div className="whitespace-pre-wrap break-words border-t border-md-outline-variant px-3 py-2.5 text-sm italic text-md-on-surface-variant">
            {content}
          </div>
        )}
      </div>
    );
  },
);
Md3Reasoning.displayName = "Md3Reasoning";

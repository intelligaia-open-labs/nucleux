import * as React from "react";
import { cn } from "@nucleux/utils";
import { Check } from "lucide-react";

export interface ResponseOption {
  /** Stable id passed to `onPrefer`. */
  id: string;
  /** Header label, e.g. `"Response A"`. */
  label?: React.ReactNode;
  /** The candidate output. */
  content: React.ReactNode;
}

export interface ResponseComparisonProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** The candidate responses to compare (typically two). */
  options: ResponseOption[];
  /** Preferred option id (controlled). */
  value?: string | null;
  /** Called when the user prefers a response. */
  onPrefer?: (id: string) => void;
  /** Prompt above the options. Defaults to a comparison question. */
  question?: React.ReactNode;
  /** Label for the prefer button. Defaults to `"Prefer this response"`. */
  preferLabel?: React.ReactNode;
}

/**
 * Two candidate AI outputs shown side by side with a "prefer this response"
 * choice — collects A/B preference feedback on model generations.
 * Source: Figma "Output & Processing / Summary Variants".
 */
export const ResponseComparison = React.forwardRef<HTMLDivElement, ResponseComparisonProps>(
  (
    {
      options,
      value,
      onPrefer,
      question = "Which response is better?",
      preferLabel = "Prefer this response",
      className,
      ...props
    },
    ref,
  ) => (
    <div ref={ref} className={cn("flex flex-col gap-3", className)} {...props}>
      {question && <p className="text-sm font-medium text-foreground">{question}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option, i) => {
          const preferred = value === option.id;
          return (
            <div
              key={option.id}
              className={cn(
                "flex flex-col gap-3 rounded-xl border bg-background p-4 transition-colors",
                preferred ? "border-brand ring-1 ring-brand" : "border-border",
              )}
            >
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {option.label ?? `Response ${String.fromCharCode(65 + i)}`}
              </span>
              <div className="flex-1 text-sm leading-relaxed text-foreground">{option.content}</div>
              <button
                type="button"
                aria-pressed={preferred}
                onClick={() => onPrefer?.(option.id)}
                className={cn(
                  "inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4",
                  preferred
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-border bg-background text-foreground hover:bg-accent",
                )}
              >
                {preferred && <Check aria-hidden="true" />}
                {preferLabel}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  ),
);
ResponseComparison.displayName = "ResponseComparison";

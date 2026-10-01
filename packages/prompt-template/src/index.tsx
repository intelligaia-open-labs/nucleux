import * as React from "react";
import { cn } from "@nucleux/utils";

/** A literal string, or a fill-in-the-blank slot with an id and placeholder. */
export type PromptSegment = string | { slot: string; placeholder: string };

export interface PromptTemplateProps
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
  /** The template as an ordered mix of literal text and named slots. */
  segments: PromptSegment[];
  /** Slot values (controlled), keyed by slot id. */
  values?: Record<string, string>;
  /** Initial slot values (uncontrolled). */
  defaultValues?: Record<string, string>;
  /** Called when any slot changes. */
  onValuesChange?: (values: Record<string, string>) => void;
  /** Called with the interpolated prompt (and raw values) on submit. */
  onComplete?: (prompt: string, values: Record<string, string>) => void;
  /** Submit button label. Defaults to `"Use this prompt"`. */
  submitLabel?: React.ReactNode;
}

/**
 * A fillable prompt scaffold — a sentence with highlighted fill-in-the-blank
 * slots the user tabs through, so users don't have to author a good prompt.
 * Source: Figma "Prompt Scaffolds / Madlibs".
 */
export const PromptTemplate = React.forwardRef<HTMLFormElement, PromptTemplateProps>(
  (
    {
      segments,
      values,
      defaultValues = {},
      onValuesChange,
      onComplete,
      submitLabel = "Use this prompt",
      className,
      ...props
    },
    ref,
  ) => {
    const [internal, setInternal] = React.useState<Record<string, string>>(defaultValues);
    const current = values ?? internal;

    const setSlot = (slot: string, val: string) => {
      const next = { ...current, [slot]: val };
      if (values === undefined) setInternal(next);
      onValuesChange?.(next);
    };

    const interpolate = () =>
      segments
        .map((s) => (typeof s === "string" ? s : current[s.slot] || s.placeholder))
        .join("");

    return (
      <form
        ref={ref}
        onSubmit={(e) => {
          e.preventDefault();
          onComplete?.(interpolate(), current);
        }}
        className={cn("flex flex-col gap-4 rounded-xl border border-border bg-background p-5", className)}
        {...props}
      >
        <p className="text-base leading-loose text-foreground">
          {segments.map((segment, i) => {
            if (typeof segment === "string") return <React.Fragment key={i}>{segment}</React.Fragment>;
            const val = current[segment.slot] ?? "";
            return (
              <input
                key={i}
                type="text"
                value={val}
                onChange={(e) => setSlot(segment.slot, e.target.value)}
                placeholder={segment.placeholder}
                aria-label={segment.placeholder}
                size={Math.max((val || segment.placeholder).length, 4)}
                className="mx-0.5 inline-block rounded-md border-b-2 border-dashed border-brand/50 bg-brand-muted/40 px-1 text-center text-brand placeholder:text-brand/60 focus:border-solid focus:border-brand focus:outline-none"
              />
            );
          })}
        </p>
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center rounded-lg bg-info px-3 py-2 text-sm font-medium text-info-foreground transition-colors hover:bg-info/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    );
  },
);
PromptTemplate.displayName = "PromptTemplate";

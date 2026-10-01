import * as React from "react";
import { cn } from "@nucleux/utils";
import { Check } from "lucide-react";

export interface StructuredOption {
  /** Stable value. */
  value: string;
  /** Display label. */
  label: React.ReactNode;
}

export interface StructuredInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "onSubmit"> {
  /** The clarifying question the agent is asking. */
  question: React.ReactNode;
  /** The selectable answers. */
  options: StructuredOption[];
  /** Allow selecting more than one option. */
  multiple?: boolean;
  /** Selected values (controlled). */
  value?: string[];
  /** Initial selection (uncontrolled). */
  defaultValue?: string[];
  /** Called when the selection changes. */
  onValueChange?: (values: string[]) => void;
  /** Show a free-text "something else" escape. */
  allowOther?: boolean;
  /** Label for the other escape. Defaults to `"Something else…"`. */
  otherPlaceholder?: string;
  /** Called when the answer is submitted. */
  onSubmit?: (values: string[], other?: string) => void;
  /** Called when the user skips the question. Renders the skip control when set. */
  onSkip?: () => void;
  submitLabel?: React.ReactNode;
  skipLabel?: React.ReactNode;
}

/**
 * An agent-generated clarifying question rendered as a structured choice —
 * single or multi-select options, a free-text escape, and a skip.
 * Source: Figma "Expressive Input / Structured Input".
 */
export const StructuredInput = React.forwardRef<HTMLDivElement, StructuredInputProps>(
  (
    {
      question,
      options,
      multiple = false,
      value,
      defaultValue = [],
      onValueChange,
      allowOther = false,
      otherPlaceholder = "Something else…",
      onSubmit,
      onSkip,
      submitLabel = "Continue",
      skipLabel = "Skip",
      className,
      ...props
    },
    ref,
  ) => {
    const [internal, setInternal] = React.useState<string[]>(defaultValue);
    const [other, setOther] = React.useState("");
    const selected = value !== undefined ? value : internal;

    const setSelected = (next: string[]) => {
      if (value === undefined) setInternal(next);
      onValueChange?.(next);
    };
    const toggle = (val: string) => {
      if (multiple) {
        setSelected(selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]);
      } else {
        setSelected([val]);
      }
    };

    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-4 rounded-xl border border-border bg-background p-5", className)}
        {...props}
      >
        <p className="text-base font-medium text-foreground">{question}</p>
        <div
          role={multiple ? "group" : "radiogroup"}
          aria-label={typeof question === "string" ? question : "Options"}
          className="flex flex-col gap-2"
        >
          {options.map((option) => {
            const active = selected.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                role={multiple ? "checkbox" : "radio"}
                aria-checked={active}
                onClick={() => toggle(option.value)}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "border-brand bg-brand-muted/50 text-foreground"
                    : "border-border bg-background text-foreground hover:bg-accent",
                )}
              >
                <span
                  className={cn(
                    "inline-flex size-5 shrink-0 items-center justify-center border transition-colors [&_svg]:size-3.5",
                    multiple ? "rounded-md" : "rounded-full",
                    active ? "border-brand bg-brand text-brand-foreground" : "border-border",
                  )}
                >
                  {active && <Check aria-hidden="true" />}
                </span>
                <span className="flex-1">{option.label}</span>
              </button>
            );
          })}
        </div>
        {allowOther && (
          <input
            type="text"
            value={other}
            onChange={(e) => setOther(e.target.value)}
            placeholder={otherPlaceholder}
            aria-label={otherPlaceholder}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        )}
        <div className="flex items-center justify-end gap-2">
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {skipLabel}
            </button>
          )}
          {onSubmit && (
            <button
              type="button"
              onClick={() => onSubmit(selected, allowOther ? other : undefined)}
              disabled={selected.length === 0 && !(allowOther && other.trim())}
              className="inline-flex items-center rounded-lg bg-info px-3 py-2 text-sm font-medium text-info-foreground transition-colors hover:bg-info/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              {submitLabel}
            </button>
          )}
        </div>
      </div>
    );
  },
);
StructuredInput.displayName = "StructuredInput";

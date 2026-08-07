import * as React from "react";
import { cn } from "@nucleux/utils";

export interface ToneOption {
  /** Stable value passed to `onValueChange`. */
  value: string;
  /** Display label. */
  label: React.ReactNode;
  /** Optional leading icon. */
  icon?: React.ReactNode;
}

/** The default set of output tones. */
export const defaultTones: ToneOption[] = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "direct", label: "Direct" },
  { value: "playful", label: "Playful" },
];

export interface ToneSelectorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Tone options. Defaults to {@link defaultTones}. */
  options?: ToneOption[];
  /** Selected value (controlled). */
  value?: string;
  /** Initial value (uncontrolled). */
  defaultValue?: string;
  /** Called when a tone is chosen. */
  onValueChange?: (value: string) => void;
  /** Group label. Defaults to `"Tone"`. */
  label?: React.ReactNode;
}

/**
 * A tone/voice picker that steers the style of generated output — pick a tone
 * and the assistant regenerates in it.
 * Source: Figma "Expressive Input / Voice & Tone".
 */
export const ToneSelector = React.forwardRef<HTMLDivElement, ToneSelectorProps>(
  ({ options = defaultTones, value, defaultValue, onValueChange, label = "Tone", className, ...props }, ref) => {
    const [internal, setInternal] = React.useState<string | undefined>(defaultValue);
    const current = value !== undefined ? value : internal;
    const select = (next: string) => {
      if (value === undefined) setInternal(next);
      onValueChange?.(next);
    };
    return (
      <div ref={ref} className={cn("flex flex-col gap-2", className)} {...props}>
        {label && <span className="text-xs font-medium text-muted-foreground">{label}</span>}
        <div role="radiogroup" aria-label={typeof label === "string" ? label : "Tone"} className="flex flex-wrap gap-1.5">
          {options.map((option) => {
            const active = current === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => select(option.value)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-3.5",
                  active
                    ? "border-brand bg-brand-muted text-brand"
                    : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {option.icon}
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  },
);
ToneSelector.displayName = "ToneSelector";

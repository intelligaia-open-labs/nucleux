import * as React from "react";
import { cn } from "../lib/utils";

interface RadioGroupContextValue {
  value: string | undefined;
  setValue: (v: string) => void;
  name: string;
}
const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Controlled selected value. */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  /** Called with the newly selected value. */
  onValueChange?: (value: string) => void;
  /** Accessible group label. */
  label?: string;
}

/** Single-select radio group. Compose with {@link Radio}. */
export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ value, defaultValue, onValueChange, label, className, ...props }, ref) => {
    const [internal, setInternal] = React.useState(defaultValue);
    const isControlled = value != null;
    const current = isControlled ? value : internal;
    const name = React.useId();

    const setValue = React.useCallback(
      (v: string) => {
        if (!isControlled) setInternal(v);
        onValueChange?.(v);
      },
      [isControlled, onValueChange],
    );

    return (
      <RadioGroupContext.Provider value={{ value: current, setValue, name }}>
        <div
          ref={ref}
          role="radiogroup"
          aria-label={label}
          className={cn("flex flex-col gap-2", className)}
          {...props}
        />
      </RadioGroupContext.Provider>
    );
  },
);
RadioGroup.displayName = "RadioGroup";

export interface RadioProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value" | "type"> {
  /** The value this radio represents. */
  value: string;
}

/** A single radio button; must be used inside a {@link RadioGroup}. */
export const Radio = React.forwardRef<HTMLButtonElement, RadioProps>(
  ({ value, disabled, className, ...props }, ref) => {
    const ctx = React.useContext(RadioGroupContext);
    if (!ctx) throw new Error("<Radio> must be used inside <RadioGroup>");
    const checked = ctx.value === value;
    return (
      <button
        ref={ref}
        type="button"
        role="radio"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && ctx.setValue(value)}
        className={cn(
          "inline-flex size-4 shrink-0 items-center justify-center rounded-full border shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "border-primary" : "border-input bg-background",
          className,
        )}
        {...props}
      >
        {checked && <span className="size-2 rounded-full bg-primary" />}
      </button>
    );
  },
);
Radio.displayName = "Radio";

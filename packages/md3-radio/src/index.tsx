import * as React from "react";
import { cn } from "@nucleux/utils";

interface RadioGroupContextValue {
  value: string | undefined;
  setValue: (v: string) => void;
  name: string;
}
const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

export interface Md3RadioGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Accessible label for the group. */
  label?: string;
}

/** A Material Design 3 radio group. Compose with {@link Md3Radio}. */
export const Md3RadioGroup = React.forwardRef<HTMLDivElement, Md3RadioGroupProps>(
  ({ value, defaultValue, onValueChange, label, className, children, ...props }, ref) => {
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState(defaultValue);
    const current = isControlled ? value : internal;
    const name = React.useId();

    const setValue = (v: string) => {
      if (!isControlled) setInternal(v);
      onValueChange?.(v);
    };

    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-label={label}
        className={cn("flex flex-col gap-1", className)}
        {...props}
      >
        <RadioGroupContext.Provider value={{ value: current, setValue, name }}>
          {children}
        </RadioGroupContext.Provider>
      </div>
    );
  },
);
Md3RadioGroup.displayName = "Md3RadioGroup";

export interface Md3RadioProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  value: string;
}

/** A single Material Design 3 radio button within a {@link Md3RadioGroup}. */
export const Md3Radio = React.forwardRef<HTMLButtonElement, Md3RadioProps>(
  ({ value, disabled, className, ...props }, ref) => {
    const ctx = React.useContext(RadioGroupContext);
    if (!ctx) throw new Error("Md3Radio must be used within a Md3RadioGroup");
    const selected = ctx.value === value;

    return (
      <button
        ref={ref}
        type="button"
        role="radio"
        aria-checked={selected}
        disabled={disabled}
        onClick={() => ctx.setValue(value)}
        className={cn(
          "relative inline-flex h-10 w-10 items-center justify-center rounded-full outline-none",
          "before:absolute before:inset-0 before:rounded-full before:bg-md-on-surface before:opacity-0 before:transition-opacity before:content-['']",
          "hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12] active:before:opacity-[0.12]",
          "focus-visible:ring-2 focus-visible:ring-md-primary",
          "disabled:pointer-events-none disabled:opacity-[0.38]",
          className,
        )}
        {...props}
      >
        <span
          className={cn(
            "relative flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
            selected ? "border-md-primary" : "border-md-on-surface-variant",
          )}
        >
          {selected && <span className="h-2.5 w-2.5 rounded-full bg-md-primary" />}
        </span>
      </button>
    );
  },
);
Md3Radio.displayName = "Md3Radio";

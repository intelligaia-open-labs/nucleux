import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@nucleux/utils";

export interface CheckboxProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "value" | "type"> {
  /** Controlled checked state. */
  checked?: boolean;
  /** Initial state when uncontrolled. */
  defaultChecked?: boolean;
  /** Called with the next checked state. */
  onCheckedChange?: (checked: boolean) => void;
}

/** Accessible checkbox (role=checkbox). Controlled via `checked` or uncontrolled. */
export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ checked, defaultChecked = false, onCheckedChange, disabled, className, ...props }, ref) => {
    const [internal, setInternal] = React.useState(defaultChecked);
    const isControlled = checked != null;
    const value = isControlled ? checked : internal;

    const toggle = () => {
      if (disabled) return;
      if (!isControlled) setInternal(!value);
      onCheckedChange?.(!value);
    };

    return (
      <button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={value}
        disabled={disabled}
        data-state={value ? "checked" : "unchecked"}
        onClick={toggle}
        className={cn(
          "inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] border shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          value ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background",
          className,
        )}
        {...props}
      >
        {value && <Check className="size-3" strokeWidth={3} />}
      </button>
    );
  },
);
Checkbox.displayName = "Checkbox";

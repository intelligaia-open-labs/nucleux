import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@nucleux/utils";

export interface Md3SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Show a check icon in the handle when on (Material 3 default behaviour). */
  showIcon?: boolean;
}

/** A Material Design 3 switch with a growing handle and optional check icon. */
export const Md3Switch = React.forwardRef<HTMLButtonElement, Md3SwitchProps>(
  ({ checked, defaultChecked = false, onCheckedChange, showIcon = true, disabled, className, onClick, ...props }, ref) => {
    const isControlled = checked !== undefined;
    const [internal, setInternal] = React.useState(defaultChecked);
    const on = isControlled ? checked : internal;

    const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (e.defaultPrevented || disabled) return;
      const next = !on;
      if (!isControlled) setInternal(next);
      onCheckedChange?.(next);
    };

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={on}
        disabled={disabled}
        onClick={toggle}
        className={cn(
          "relative inline-flex h-8 w-[52px] shrink-0 items-center rounded-full border-2 transition-colors outline-none",
          "focus-visible:ring-2 focus-visible:ring-md-primary focus-visible:ring-offset-2 focus-visible:ring-offset-md-surface",
          "disabled:pointer-events-none disabled:opacity-[0.38]",
          on ? "border-md-primary bg-md-primary" : "border-md-outline bg-md-surface-container-high",
          className,
        )}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none flex items-center justify-center rounded-full transition-all",
            on
              ? "translate-x-[22px] h-6 w-6 bg-md-on-primary text-md-on-primary-container"
              : "translate-x-1 h-4 w-4 bg-md-outline text-transparent",
          )}
        >
          {showIcon && on && <Check aria-hidden className="h-4 w-4" />}
        </span>
      </button>
    );
  },
);
Md3Switch.displayName = "Md3Switch";

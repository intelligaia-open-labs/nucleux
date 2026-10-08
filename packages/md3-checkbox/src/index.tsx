import * as React from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "@nucleux/utils";

export interface Md3CheckboxProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "type"> {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

/** A Material Design 3 checkbox with a circular state layer and error-free tokens. */
export const Md3Checkbox = React.forwardRef<HTMLButtonElement, Md3CheckboxProps>(
  ({ checked, defaultChecked = false, indeterminate = false, onCheckedChange, disabled, className, onClick, ...props }, ref) => {
    const isControlled = checked !== undefined;
    const [internal, setInternal] = React.useState(defaultChecked);
    const on = isControlled ? checked : internal;
    const active = on || indeterminate;

    return (
      <button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={indeterminate ? "mixed" : on}
        disabled={disabled}
        onClick={(e) => {
          onClick?.(e);
          if (e.defaultPrevented || disabled) return;
          const next = !on;
          if (!isControlled) setInternal(next);
          onCheckedChange?.(next);
        }}
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
            "relative flex h-[18px] w-[18px] items-center justify-center rounded-[2px] border-2 transition-colors [&_svg]:size-[14px]",
            active
              ? "border-md-primary bg-md-primary text-md-on-primary"
              : "border-md-on-surface-variant text-transparent",
          )}
        >
          {indeterminate ? <Minus aria-hidden /> : on ? <Check aria-hidden /> : null}
        </span>
      </button>
    );
  },
);
Md3Checkbox.displayName = "Md3Checkbox";

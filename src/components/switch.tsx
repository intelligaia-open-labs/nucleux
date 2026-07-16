import * as React from "react";
import { cn } from "../lib/utils";

export type SwitchSize = "sm" | "md";

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "value"> {
  /** Controlled on/off state. */
  checked?: boolean;
  /** Initial state when uncontrolled. */
  defaultChecked?: boolean;
  /** Called with the next state when toggled. */
  onCheckedChange?: (checked: boolean) => void;
  size?: SwitchSize;
}

const track: Record<SwitchSize, string> = {
  sm: "h-4 w-7",
  md: "h-5 w-9",
};
const thumb: Record<SwitchSize, string> = {
  sm: "size-3 data-[state=checked]:translate-x-[14px] data-[state=unchecked]:translate-x-0.5",
  md: "size-4 data-[state=checked]:translate-x-[18px] data-[state=unchecked]:translate-x-0.5",
};

/** Accessible on/off toggle. Controlled via `checked`, or uncontrolled via `defaultChecked`. */
export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    { checked, defaultChecked = false, onCheckedChange, size = "md", disabled, className, ...props },
    ref,
  ) => {
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
        role="switch"
        aria-checked={value}
        disabled={disabled}
        data-state={value ? "checked" : "unchecked"}
        onClick={toggle}
        className={cn(
          "inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          value ? "bg-primary" : "bg-input",
          track[size],
          className,
        )}
        {...props}
      >
        <span
          data-state={value ? "checked" : "unchecked"}
          className={cn(
            "pointer-events-none inline-block rounded-full bg-background shadow-sm ring-0 transition-transform",
            thumb[size],
          )}
        />
      </button>
    );
  },
);
Switch.displayName = "Switch";

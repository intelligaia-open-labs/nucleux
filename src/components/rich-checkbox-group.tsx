import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "../lib/utils";

export interface RichCheckboxOptionProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "value" | "type"> {
  /** Primary label. */
  label: React.ReactNode;
  /** Supporting secondary text. */
  description?: React.ReactNode;
  /** Controlled checked state. */
  checked?: boolean;
  /** Initial state when uncontrolled. */
  defaultChecked?: boolean;
  /** Called with the next checked state. */
  onCheckedChange?: (checked: boolean) => void;
}

/**
 * A selectable option card with a checkbox, label, and description. The whole
 * card is one accessible checkbox control (click anywhere to toggle).
 */
export const RichCheckboxOption = React.forwardRef<HTMLButtonElement, RichCheckboxOptionProps>(
  ({ label, description, checked, defaultChecked = false, onCheckedChange, disabled, className, ...props }, ref) => {
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
        onClick={toggle}
        className={cn(
          "flex w-full items-start gap-2 rounded-[10px] border bg-card px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          value ? "border-primary/40 bg-primary/[0.03]" : "border-border hover:bg-accent/50",
          className,
        )}
        {...props}
      >
        <span
          aria-hidden
          className={cn(
            "mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] border shadow-sm transition-colors",
            value ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background",
          )}
        >
          {value && <Check className="size-3" strokeWidth={3} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm text-foreground">{label}</span>
          {description && (
            <span className="block text-xs text-muted-foreground">{description}</span>
          )}
        </span>
      </button>
    );
  },
);
RichCheckboxOption.displayName = "RichCheckboxOption";

export interface RichCheckboxGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accessible group label. */
  label?: string;
}

/** Vertical group of {@link RichCheckboxOption}s. */
export const RichCheckboxGroup = React.forwardRef<HTMLDivElement, RichCheckboxGroupProps>(
  ({ label, className, ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      aria-label={label}
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  ),
);
RichCheckboxGroup.displayName = "RichCheckboxGroup";

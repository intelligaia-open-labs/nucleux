import * as React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@nucleux/utils";

export type Md3ChipVariant = "assist" | "filter" | "input" | "suggestion";

export interface Md3ChipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onSelect"> {
  variant?: Md3ChipVariant;
  /** Filter chips: selected state (shows a leading check). */
  selected?: boolean;
  /** Leading icon (assist/input/suggestion). */
  icon?: React.ReactNode;
  /** Input chips: renders a trailing remove button and fires this on click. */
  onRemove?: () => void;
}

const stateLayer =
  "before:absolute before:inset-0 before:bg-current before:opacity-0 before:transition-opacity before:content-[''] hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12] active:before:opacity-[0.12]";

/**
 * A Material Design 3 chip (assist, filter, input, suggestion). Filter chips
 * toggle a selected state; input chips render a trailing remove affordance.
 */
export const Md3Chip = React.forwardRef<HTMLButtonElement, Md3ChipProps>(
  ({ variant = "assist", selected = false, icon, onRemove, className, children, type = "button", ...props }, ref) => {
    const base = cn(
      "relative inline-flex h-8 items-center gap-1.5 overflow-hidden rounded-md-sm px-3 text-sm font-medium transition-colors [&_svg]:size-[18px]",
      selected
        ? "border border-transparent bg-md-secondary-container text-md-on-secondary-container"
        : "border border-md-outline bg-transparent text-md-on-surface-variant",
      "outline-none focus-visible:ring-2 focus-visible:ring-md-primary",
      "disabled:pointer-events-none disabled:opacity-[0.38]",
    );

    // Input chip: a container with a label and a nested remove button.
    if (variant === "input") {
      return (
        <span ref={ref as React.Ref<HTMLElement> as never} className={cn(base, "pr-1", className)}>
          {icon && <span className="relative shrink-0">{icon}</span>}
          <span className="relative">{children}</span>
          <button
            type="button"
            aria-label="Remove"
            onClick={onRemove}
            className="relative z-10 ml-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-current hover:bg-current/10 [&_svg]:size-4"
          >
            <X aria-hidden />
          </button>
        </span>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        aria-pressed={variant === "filter" ? selected : undefined}
        className={cn(base, stateLayer, className)}
        {...props}
      >
        {variant === "filter" && selected ? (
          <Check aria-hidden className="relative shrink-0" />
        ) : (
          icon && <span className="relative shrink-0">{icon}</span>
        )}
        <span className="relative">{children}</span>
      </button>
    );
  },
);
Md3Chip.displayName = "Md3Chip";

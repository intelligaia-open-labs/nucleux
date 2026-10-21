import * as React from "react";
import { cn } from "@nucleux/utils";

export type Md3ButtonVariant = "filled" | "tonal" | "elevated" | "outlined" | "text";

export interface Md3ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Md3ButtonVariant;
  /** Leading icon element. */
  icon?: React.ReactNode;
}

const variants: Record<Md3ButtonVariant, string> = {
  filled: "bg-md-primary text-md-on-primary hover:shadow-md-1",
  tonal: "bg-md-secondary-container text-md-on-secondary-container hover:shadow-md-1",
  elevated: "bg-md-surface-container-low text-md-primary shadow-md-1 hover:shadow-md-2",
  outlined: "border border-md-outline bg-transparent text-md-primary",
  text: "bg-transparent text-md-primary",
};

/**
 * A Material Design 3 button. Five variants (filled, tonal, elevated, outlined,
 * text) with an on-color state layer for hover/focus/press.
 */
export const Md3Button = React.forwardRef<HTMLButtonElement, Md3ButtonProps>(
  ({ variant = "filled", icon, className, children, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        // Shape, layout, typography
        "relative inline-flex h-10 items-center justify-center gap-2 overflow-hidden rounded-full text-sm font-medium transition-shadow",
        variant === "text" ? "px-3" : "px-6",
        "[&_svg]:size-[18px]",
        // State layer (Material 3): on-color overlay at 8% hover / 12% focus+press
        "before:absolute before:inset-0 before:bg-current before:opacity-0 before:transition-opacity before:content-['']",
        "hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12] active:before:opacity-[0.12]",
        // Focus ring + disabled
        "outline-none focus-visible:ring-2 focus-visible:ring-md-primary focus-visible:ring-offset-2 focus-visible:ring-offset-md-surface",
        "disabled:pointer-events-none disabled:opacity-[0.38] disabled:shadow-none",
        variants[variant],
        className,
      )}
      {...props}
    >
      {icon && <span className="relative shrink-0">{icon}</span>}
      <span className="relative">{children}</span>
    </button>
  ),
);
Md3Button.displayName = "Md3Button";

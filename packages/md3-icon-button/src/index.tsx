import * as React from "react";
import { cn } from "@nucleux/utils";

export type Md3IconButtonVariant = "standard" | "filled" | "tonal" | "outlined";

export interface Md3IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Md3IconButtonVariant;
  /** Toggle-selected state (affects filled/tonal background). */
  selected?: boolean;
  /** Required for icon-only buttons. */
  "aria-label": string;
}

const variants: Record<Md3IconButtonVariant, string> = {
  standard: "bg-transparent text-md-on-surface-variant",
  filled: "bg-md-primary text-md-on-primary",
  tonal: "bg-md-secondary-container text-md-on-secondary-container",
  outlined: "border border-md-outline bg-transparent text-md-on-surface-variant",
};

/** A Material Design 3 icon button (standard, filled, tonal, outlined). */
export const Md3IconButton = React.forwardRef<HTMLButtonElement, Md3IconButtonProps>(
  ({ variant = "standard", selected = false, className, children, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-pressed={props["aria-pressed"] ?? (selected || undefined)}
      className={cn(
        "relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full transition-colors [&_svg]:size-6",
        "before:absolute before:inset-0 before:bg-current before:opacity-0 before:transition-opacity before:content-['']",
        "hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12] active:before:opacity-[0.12]",
        "outline-none focus-visible:ring-2 focus-visible:ring-md-primary focus-visible:ring-offset-2 focus-visible:ring-offset-md-surface",
        "disabled:pointer-events-none disabled:opacity-[0.38]",
        variants[variant],
        className,
      )}
      {...props}
    >
      <span className="relative">{children}</span>
    </button>
  ),
);
Md3IconButton.displayName = "Md3IconButton";

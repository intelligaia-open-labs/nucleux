import * as React from "react";
import { cn } from "@nucleux/utils";

export type Md3FabSize = "small" | "regular" | "large" | "extended";
export type Md3FabColor = "primary" | "surface" | "secondary" | "tertiary";

export interface Md3FabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: Md3FabSize;
  color?: Md3FabColor;
  icon: React.ReactNode;
}

const colors: Record<Md3FabColor, string> = {
  primary: "bg-md-primary-container text-md-on-primary-container",
  surface: "bg-md-surface-container-high text-md-primary",
  secondary: "bg-md-secondary-container text-md-on-secondary-container",
  tertiary: "bg-md-tertiary-container text-md-on-tertiary-container",
};

const sizes: Record<Md3FabSize, string> = {
  small: "h-10 w-10 rounded-md-md [&_svg]:size-6",
  regular: "h-14 w-14 rounded-md-lg [&_svg]:size-6",
  large: "h-24 w-24 rounded-md-xl [&_svg]:size-9",
  extended: "h-14 gap-3 rounded-md-lg px-4 text-sm font-medium [&_svg]:size-6",
};

/**
 * A Material Design 3 floating action button. Sizes small/regular/large plus an
 * extended variant with a label; four container colors. Elevated with a state layer.
 */
export const Md3Fab = React.forwardRef<HTMLButtonElement, Md3FabProps>(
  ({ size = "regular", color = "primary", icon, className, children, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden shadow-md-3 transition-shadow hover:shadow-md-4",
        "before:absolute before:inset-0 before:bg-current before:opacity-0 before:transition-opacity before:content-['']",
        "hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12] active:before:opacity-[0.12]",
        "outline-none focus-visible:ring-2 focus-visible:ring-md-primary focus-visible:ring-offset-2 focus-visible:ring-offset-md-surface",
        "disabled:pointer-events-none disabled:opacity-[0.38] disabled:shadow-none",
        colors[color],
        sizes[size],
        className,
      )}
      {...props}
    >
      <span className="relative shrink-0">{icon}</span>
      {size === "extended" && children && <span className="relative">{children}</span>}
    </button>
  ),
);
Md3Fab.displayName = "Md3Fab";

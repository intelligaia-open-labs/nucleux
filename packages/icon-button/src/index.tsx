import * as React from "react";
import { cn } from "@nucleux/utils";

export type IconButtonVariant = "ghost" | "active" | "solid";
export type IconButtonSize = "sm" | "md" | "lg";

const iconButtonVariants: Record<IconButtonVariant, string> = {
  ghost: "rounded-md text-muted-foreground hover:bg-accent hover:text-foreground",
  active: "rounded-md bg-accent text-foreground",
  solid: "rounded-lg bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
};

const iconButtonSizes: Record<IconButtonSize, string> = {
  sm: "size-8",
  md: "size-9",
  lg: "size-10",
};

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible label — required since the button has no visible text. */
  "aria-label": string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
}

/** Square icon-only button — nav rails, toolbars, card actions. */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = "ghost", size = "md", type = "button", className, children, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex shrink-0 items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-5",
        iconButtonVariants[variant],
        iconButtonSizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);
IconButton.displayName = "IconButton";

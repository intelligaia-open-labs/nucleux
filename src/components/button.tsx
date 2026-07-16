import * as React from "react";
import { cn } from "../lib/utils";

export type ButtonVariant =
  | "primary"
  | "cta"
  | "secondary"
  | "ghost"
  | "destructive";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  cta: "bg-info text-info-foreground hover:bg-info/90",
  secondary: "border border-border bg-background text-foreground hover:bg-accent",
  ghost: "text-foreground hover:bg-accent",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 rounded-md px-3 text-sm",
  md: "h-9 rounded-md px-4 text-sm",
  lg: "h-10 rounded-lg px-5 text-sm",
  icon: "size-9 rounded-md",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Icon rendered before the label. */
  leftIcon?: React.ReactNode;
  /** Icon rendered after the label. */
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", leftIcon, rightIcon, type = "button", className, children, ...props },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    >
      {leftIcon && <span className="inline-flex shrink-0 items-center">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="inline-flex shrink-0 items-center">{rightIcon}</span>}
    </button>
  ),
);
Button.displayName = "Button";

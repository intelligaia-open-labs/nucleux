import * as React from "react";
import { cn } from "../lib/utils";

export type ButtonVariant =
  | "primary"
  | "cta"
  | "secondary"
  | "ghost"
  | "destructive";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

// Canonical spec (Figma "Button"): rounded-lg, semibold 14px, subtle border +
// shadow-sm on filled/outline variants; ghost is chromeless.
const buttonVariants: Record<ButtonVariant, string> = {
  primary: "border border-border bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
  cta: "border border-border bg-info text-info-foreground shadow-sm hover:bg-info/90",
  secondary: "border border-border bg-background text-foreground shadow-sm hover:bg-accent",
  ghost: "text-foreground hover:bg-accent",
  destructive:
    "border border-border bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 rounded-lg px-3 text-sm",
  md: "h-9 rounded-lg px-4 text-sm",
  lg: "h-10 rounded-lg px-5 text-sm",
  icon: "size-9 rounded-lg",
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
        "inline-flex select-none items-center justify-center gap-1.5 whitespace-nowrap font-semibold tracking-[0.005em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
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

import * as React from "react";
import { cn, Slot } from "@nucleux/utils";

export type ButtonVariant = "primary" | "cta" | "secondary" | "ghost" | "destructive" | "link";

export type ButtonSize = "sm" | "md" | "lg" | "icon" | "icon-sm" | "icon-lg";

// Canonical spec (Figma "Button"): rounded-lg, semibold 14px, subtle border +
// shadow-sm on filled/outline variants; ghost is chromeless.
const buttonVariants: Record<ButtonVariant, string> = {
  primary: "border border-border bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
  cta: "border border-border bg-info text-info-foreground shadow-sm hover:bg-info/90",
  secondary: "border border-border bg-background text-foreground shadow-sm hover:bg-accent",
  ghost: "text-foreground hover:bg-accent",
  destructive:
    "border border-border bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
  link: "text-foreground underline decoration-from-font underline-offset-2 hover:opacity-70",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 rounded-lg px-3 text-sm",
  md: "h-9 rounded-lg px-4 text-sm",
  lg: "h-10 rounded-lg px-5 text-sm",
  icon: "size-9 rounded-lg",
  "icon-sm": "size-8 rounded-lg",
  "icon-lg": "size-10 rounded-lg",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style: "primary" (default), "cta", "secondary", "ghost", "destructive", or "link". */
  variant?: ButtonVariant;
  /**
   * Alias of `variant` (MUI/Chakra vocabulary). Deprecated — use `variant`.
   * @deprecated Use `variant` instead. Alias kept so MUI/Chakra-trained
   *   agents and users are caught; it maps 1:1.
   */
  color?: ButtonVariant;
  /**
   * Size preset: "sm", "md" (default), "lg", or a square icon-only size
   * ("icon-sm", "icon", "icon-lg"). Icon-only buttons need an `aria-label`.
   */
  size?: ButtonSize;
  /**
   * Render the single child element (e.g. an `<a>` or a router `Link`) with
   * the button's styles instead of a `<button>`. `leftIcon`/`rightIcon` are
   * ignored; put icons inside the child.
   */
  asChild?: boolean;
  /** Icon rendered before the label. */
  leftIcon?: React.ReactNode;
  /** Icon rendered after the label. */
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      color,
      variant = color ?? "primary",
      size = "md",
      asChild = false,
      leftIcon,
      rightIcon,
      type = "button",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const classes = cn(
      "inline-flex select-none items-center justify-center gap-1.5 whitespace-nowrap font-semibold tracking-[0.005em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
      buttonVariants[variant],
      buttonSizes[size],
      variant === "link" && "h-auto px-0",
      className,
    );
    if (asChild) {
      return (
        <Slot ref={ref} className={classes} {...(props as React.HTMLAttributes<HTMLElement>)}>
          {children}
        </Slot>
      );
    }
    return (
      <button ref={ref} type={type} className={classes} {...props}>
        {leftIcon && <span className="inline-flex shrink-0 items-center">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="inline-flex shrink-0 items-center">{rightIcon}</span>}
      </button>
    );
  },
);
Button.displayName = "Button";

import * as React from "react";
import { cn } from "@nucleux/utils";

export interface ToggleProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** Controlled pressed state. */
  pressed?: boolean;
  /** Uncontrolled initial pressed state. */
  defaultPressed?: boolean;
  /** Fired with the next pressed state on activation. */
  onPressedChange?: (pressed: boolean) => void;
  variant?: "default" | "outline";
  size?: "sm" | "md" | "lg";
}

const sizes: Record<NonNullable<ToggleProps["size"]>, string> = {
  sm: "h-8 min-w-8 px-1.5",
  md: "h-9 min-w-9 px-2",
  lg: "h-10 min-w-10 px-2.5",
};

/** A two-state button that stays pressed until toggled off. */
export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      pressed,
      defaultPressed = false,
      onPressedChange,
      onClick,
      variant = "default",
      size = "md",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [internal, setInternal] = React.useState(defaultPressed);
    const isControlled = pressed !== undefined;
    const on = isControlled ? pressed : internal;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;
      const next = !on;
      if (!isControlled) setInternal(next);
      onPressedChange?.(next);
    };

    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={on}
        data-state={on ? "on" : "off"}
        onClick={handleClick}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors",
          "hover:bg-muted hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
          "disabled:pointer-events-none disabled:opacity-50",
          "data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
          variant === "outline" && "border border-input bg-transparent shadow-sm",
          sizes[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
Toggle.displayName = "Toggle";

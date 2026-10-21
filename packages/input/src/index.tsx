import * as React from "react";
import { cn } from "@nucleux/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Render an error ring and set `aria-invalid`. */
  invalid?: boolean;
}

/** A single-line text input, tokenized and themeable. */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", invalid = false, "aria-invalid": ariaInvalid, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      aria-invalid={ariaInvalid ?? (invalid || undefined)}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        invalid && "border-destructive focus-visible:ring-destructive",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

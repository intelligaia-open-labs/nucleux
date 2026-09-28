import * as React from "react";
import { cn } from "@nucleux/utils";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Show a destructive-colored asterisk to mark the field required. */
  required?: boolean;
}

/** An accessible caption for a form control. Pair with `htmlFor`. */
export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required = false, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    >
      {children}
      {required && (
        <span aria-hidden className="ml-0.5 text-destructive">
          *
        </span>
      )}
    </label>
  ),
);
Label.displayName = "Label";

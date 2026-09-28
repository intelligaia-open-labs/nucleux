import * as React from "react";
import { cn } from "@nucleux/utils";

export type Md3TextFieldVariant = "filled" | "outlined";

export interface Md3TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "placeholder"> {
  label: string;
  variant?: Md3TextFieldVariant;
  supportingText?: React.ReactNode;
  error?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

/**
 * A Material Design 3 text field (filled or outlined) with a floating label,
 * optional leading/trailing icons, supporting text, and an error state.
 */
export const Md3TextField = React.forwardRef<HTMLInputElement, Md3TextFieldProps>(
  (
    {
      label,
      variant = "filled",
      supportingText,
      error = false,
      leadingIcon,
      trailingIcon,
      id,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const supportId = `${inputId}-support`;
    const filled = variant === "filled";

    return (
      <div className={cn("w-full", disabled && "opacity-[0.38]", className)}>
        <div className="relative">
          {leadingIcon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-md-on-surface-variant [&_svg]:size-5">
              {leadingIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            placeholder=" "
            disabled={disabled}
            aria-invalid={error || undefined}
            aria-describedby={supportingText ? supportId : undefined}
            className={cn(
              "peer h-14 w-full text-base text-md-on-surface outline-none transition-colors placeholder:text-transparent disabled:cursor-not-allowed",
              leadingIcon ? "pl-11" : "pl-4",
              trailingIcon ? "pr-11" : "pr-4",
              filled
                ? cn(
                    "rounded-t-md-xs border-0 border-b-2 bg-md-surface-container-high pb-2 pt-6",
                    error ? "border-md-error" : "border-md-on-surface-variant focus:border-md-primary",
                  )
                : cn(
                    "rounded-md-xs border bg-transparent py-4",
                    error ? "border-md-error" : "border-md-outline focus:border-md-primary",
                  ),
            )}
            {...props}
          />

          <label
            htmlFor={inputId}
            className={cn(
              "pointer-events-none absolute transition-all",
              leadingIcon ? "left-11" : "left-4",
              // Floated (default: filled value / outlined value) position
              filled ? "top-2 text-xs" : "-top-2 bg-md-surface px-1 text-xs",
              // Resting position when empty & unfocused
              "peer-placeholder-shown:text-base peer-placeholder-shown:text-md-on-surface-variant",
              filled
                ? "peer-placeholder-shown:top-4"
                : "peer-placeholder-shown:top-4 peer-placeholder-shown:bg-transparent",
              // Focused position + color
              filled
                ? "peer-focus:top-2 peer-focus:text-xs"
                : "peer-focus:-top-2 peer-focus:bg-md-surface peer-focus:px-1 peer-focus:text-xs",
              error
                ? "text-md-error peer-focus:text-md-error"
                : "text-md-on-surface-variant peer-focus:text-md-primary",
            )}
          >
            {label}
          </label>

          {trailingIcon && (
            <span
              className={cn(
                "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 [&_svg]:size-5",
                error ? "text-md-error" : "text-md-on-surface-variant",
              )}
            >
              {trailingIcon}
            </span>
          )}
        </div>

        {supportingText && (
          <p
            id={supportId}
            className={cn("px-4 pt-1 text-xs", error ? "text-md-error" : "text-md-on-surface-variant")}
          >
            {supportingText}
          </p>
        )}
      </div>
    );
  },
);
Md3TextField.displayName = "Md3TextField";

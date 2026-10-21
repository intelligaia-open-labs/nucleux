import * as React from "react";
import { cn } from "@nucleux/utils";

export interface InputOtpProps {
  /** Number of code cells. */
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Fired once every cell is filled. */
  onComplete?: (value: string) => void;
  disabled?: boolean;
  /** Only accept digits (default true). */
  numeric?: boolean;
  className?: string;
  "aria-label"?: string;
}

/** A segmented input for one-time codes / PINs. */
export const InputOtp = React.forwardRef<HTMLDivElement, InputOtpProps>(
  (
    {
      length = 6,
      value,
      defaultValue = "",
      onChange,
      onComplete,
      disabled = false,
      numeric = true,
      className,
      "aria-label": ariaLabel = "One-time code",
    },
    ref,
  ) => {
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState(defaultValue.slice(0, length));
    const code = (isControlled ? value : internal).slice(0, length);
    const refs = React.useRef<(HTMLInputElement | null)[]>([]);

    const commit = (next: string) => {
      const clean = next.slice(0, length);
      if (!isControlled) setInternal(clean);
      onChange?.(clean);
      if (clean.length === length) onComplete?.(clean);
    };

    const setChar = (index: number, char: string) => {
      const chars = code.split("");
      while (chars.length < length) chars.push("");
      chars[index] = char;
      commit(chars.join("").replace(/\s+$/g, ""));
    };

    const focusCell = (i: number) => refs.current[i]?.focus();

    const handleChange = (i: number, raw: string) => {
      const filtered = numeric ? raw.replace(/\D/g, "") : raw;
      if (!filtered) return;
      // If the user pasted or typed multiple chars, distribute from this cell.
      if (filtered.length > 1) {
        const chars = code.split("");
        while (chars.length < length) chars.push("");
        for (let k = 0; k < filtered.length && i + k < length; k++) chars[i + k] = filtered[k]!;
        commit(chars.join(""));
        focusCell(Math.min(i + filtered.length, length - 1));
        return;
      }
      setChar(i, filtered);
      if (i < length - 1) focusCell(i + 1);
    };

    const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        e.preventDefault();
        if (code[i]) setChar(i, "");
        else if (i > 0) {
          setChar(i - 1, "");
          focusCell(i - 1);
        }
      } else if (e.key === "ArrowLeft" && i > 0) {
        e.preventDefault();
        focusCell(i - 1);
      } else if (e.key === "ArrowRight" && i < length - 1) {
        e.preventDefault();
        focusCell(i + 1);
      }
    };

    return (
      <div
        ref={ref}
        role="group"
        aria-label={ariaLabel}
        className={cn("flex items-center gap-2", className)}
      >
        {Array.from({ length }, (_, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            type="text"
            inputMode={numeric ? "numeric" : "text"}
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            disabled={disabled}
            aria-label={`Digit ${i + 1}`}
            value={code[i] ?? ""}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onFocus={(e) => e.target.select()}
            className={cn(
              "h-11 w-10 rounded-md border border-input bg-background text-center text-lg font-medium text-foreground shadow-sm outline-none transition-colors",
              "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          />
        ))}
      </div>
    );
  },
);
InputOtp.displayName = "InputOtp";

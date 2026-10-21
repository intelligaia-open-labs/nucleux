import * as React from "react";
import { cn } from "@nucleux/utils";

export interface SliderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onValueChange?: (value: number) => void;
  /** Accessible name for the thumb (falls back to aria-label on the root). */
  "aria-label"?: string;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const roundToStep = (n: number, min: number, step: number) =>
  min + Math.round((n - min) / step) * step;

/** A single-thumb slider for choosing a numeric value from a range. */
export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      value,
      defaultValue = 0,
      min = 0,
      max = 100,
      step = 1,
      disabled = false,
      onValueChange,
      className,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const trackRef = React.useRef<HTMLDivElement>(null);
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState(clamp(defaultValue, min, max));
    const current = clamp(isControlled ? value : internal, min, max);
    const pct = ((current - min) / (max - min)) * 100;

    const commit = (next: number) => {
      const v = clamp(roundToStep(next, min, step), min, max);
      if (v === current) return;
      if (!isControlled) setInternal(v);
      onValueChange?.(v);
    };

    const valueFromClientX = (clientX: number) => {
      const track = trackRef.current;
      if (!track) return current;
      const rect = track.getBoundingClientRect();
      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
      return min + ratio * (max - min);
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      commit(valueFromClientX(e.clientX));
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled || e.buttons === 0) return;
      commit(valueFromClientX(e.clientX));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      const big = Math.max(step, (max - min) / 10);
      let next: number | null = null;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowUp":
          next = current + step;
          break;
        case "ArrowLeft":
        case "ArrowDown":
          next = current - step;
          break;
        case "PageUp":
          next = current + big;
          break;
        case "PageDown":
          next = current - big;
          break;
        case "Home":
          next = min;
          break;
        case "End":
          next = max;
          break;
        default:
          return;
      }
      e.preventDefault();
      commit(next);
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center py-2",
          disabled && "pointer-events-none opacity-50",
          className,
        )}
        {...props}
      >
        <div
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          className="relative h-1.5 w-full grow cursor-pointer rounded-full bg-muted"
        >
          <div className="absolute h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
          <div
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-label={ariaLabel}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={current}
            aria-disabled={disabled || undefined}
            aria-orientation="horizontal"
            onKeyDown={handleKeyDown}
            className={cn(
              "absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary bg-background shadow-sm",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
            )}
            style={{ left: `${pct}%` }}
          />
        </div>
      </div>
    );
  },
);
Slider.displayName = "Slider";

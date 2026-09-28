import * as React from "react";
import { cn } from "@nucleux/utils";

export interface Md3SliderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onValueChange?: (value: number) => void;
  "aria-label"?: string;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const roundToStep = (n: number, min: number, step: number) => min + Math.round((n - min) / step) * step;

/** A Material Design 3 slider (single value) with pointer + keyboard control. */
export const Md3Slider = React.forwardRef<HTMLDivElement, Md3SliderProps>(
  (
    { value, defaultValue = 0, min = 0, max = 100, step = 1, disabled = false, onValueChange, className, "aria-label": ariaLabel, ...props },
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
      return min + clamp((clientX - rect.left) / rect.width, 0, 1) * (max - min);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      const map: Record<string, number> = {
        ArrowRight: current + step,
        ArrowUp: current + step,
        ArrowLeft: current - step,
        ArrowDown: current - step,
        Home: min,
        End: max,
      };
      if (!(e.key in map)) return;
      e.preventDefault();
      commit(map[e.key]!);
    };

    return (
      <div
        ref={ref}
        className={cn("relative flex w-full touch-none select-none items-center py-2", disabled && "pointer-events-none opacity-[0.38]", className)}
        {...props}
      >
        <div
          ref={trackRef}
          onPointerDown={(e) => {
            e.preventDefault();
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
            commit(valueFromClientX(e.clientX));
          }}
          onPointerMove={(e) => {
            if (e.buttons === 0) return;
            commit(valueFromClientX(e.clientX));
          }}
          className="relative h-1 w-full grow cursor-pointer rounded-full bg-md-surface-variant"
        >
          <div className="absolute h-full rounded-full bg-md-primary" style={{ width: `${pct}%` }} />
          <div
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-label={ariaLabel}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={current}
            aria-disabled={disabled || undefined}
            aria-orientation="horizontal"
            onKeyDown={onKeyDown}
            className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-md-primary shadow-md-1 outline-none focus-visible:ring-2 focus-visible:ring-md-primary focus-visible:ring-offset-2 focus-visible:ring-offset-md-surface"
            style={{ left: `${pct}%` }}
          />
        </div>
      </div>
    );
  },
);
Md3Slider.displayName = "Md3Slider";

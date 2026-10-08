import * as React from "react";
import { cn } from "@nucleux/utils";

export type Md3TimePeriod = "AM" | "PM";
export interface Md3TimeValue {
  hour: number; // 1–12
  minute: number; // 0–59
  period: Md3TimePeriod;
}

export interface Md3TimePickerProps {
  value?: Md3TimeValue;
  defaultValue?: Md3TimeValue;
  onValueChange?: (value: Md3TimeValue) => void;
  className?: string;
}

const clampNum = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const pad = (n: number) => n.toString().padStart(2, "0");

/** A Material Design 3 time picker (input variant): hour, minute, and AM/PM. */
export const Md3TimePicker = React.forwardRef<HTMLDivElement, Md3TimePickerProps>(
  ({ value, defaultValue = { hour: 9, minute: 0, period: "AM" }, onValueChange, className }, ref) => {
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState<Md3TimeValue>(defaultValue);
    const current = isControlled ? value : internal;

    const update = (patch: Partial<Md3TimeValue>) => {
      const next = { ...current, ...patch };
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    };

    const fieldClass =
      "h-14 w-16 rounded-md-sm bg-md-surface-container-high text-center text-2xl text-md-on-surface outline-none focus:ring-2 focus:ring-md-primary";
    const periodBtn = (p: Md3TimePeriod) =>
      cn(
        "flex-1 px-3 py-2 text-sm font-medium outline-none transition-colors",
        current.period === p ? "bg-md-tertiary-container text-md-on-tertiary-container" : "text-md-on-surface-variant",
      );

    return (
      <div ref={ref} className={cn("inline-flex items-center gap-2", className)}>
        <input
          type="number"
          min={1}
          max={12}
          aria-label="Hour"
          value={current.hour}
          onChange={(e) => update({ hour: clampNum(parseInt(e.target.value || "1", 10), 1, 12) })}
          className={fieldClass}
        />
        <span className="text-2xl text-md-on-surface">:</span>
        <input
          type="number"
          min={0}
          max={59}
          aria-label="Minute"
          value={pad(current.minute)}
          onChange={(e) => update({ minute: clampNum(parseInt(e.target.value || "0", 10), 0, 59) })}
          className={fieldClass}
        />
        <div className="ml-1 flex h-14 flex-col overflow-hidden rounded-md-sm border border-md-outline">
          <button type="button" className={periodBtn("AM")} onClick={() => update({ period: "AM" })}>
            AM
          </button>
          <span className="h-px bg-md-outline" />
          <button type="button" className={periodBtn("PM")} onClick={() => update({ period: "PM" })}>
            PM
          </button>
        </div>
      </div>
    );
  },
);
Md3TimePicker.displayName = "Md3TimePicker";

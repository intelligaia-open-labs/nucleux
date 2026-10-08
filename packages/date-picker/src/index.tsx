import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@nucleux/calendar";
import { cn } from "@nucleux/utils";

export interface DatePickerProps {
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Disable individual days. */
  isDateDisabled?: (date: Date) => boolean;
  className?: string;
  "aria-label"?: string;
}

const formatDate = (d: Date) =>
  d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

/** A text trigger that reveals a {@link Calendar} to pick a single date. */
export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      placeholder = "Pick a date",
      disabled = false,
      isDateDisabled,
      className,
      "aria-label": ariaLabel = "Pick a date",
    },
    ref,
  ) => {
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState<Date | undefined>(defaultValue);
    const selected = isControlled ? value : internal;
    const [open, setOpen] = React.useState(false);
    const rootRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (!open) return;
      const onDown = (e: MouseEvent) => {
        if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
      };
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
      document.addEventListener("mousedown", onDown);
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("mousedown", onDown);
        document.removeEventListener("keydown", onKey);
      };
    }, [open]);

    const choose = (date: Date | undefined) => {
      if (!isControlled) setInternal(date);
      onValueChange?.(date);
      setOpen(false);
    };

    return (
      <div ref={rootRef} className={cn("relative inline-block", className)}>
        <button
          ref={ref}
          type="button"
          disabled={disabled}
          aria-label={ariaLabel}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex h-9 w-60 items-center gap-2 rounded-md border border-input bg-background px-3 text-left text-sm shadow-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
            "disabled:cursor-not-allowed disabled:opacity-50",
            !selected && "text-muted-foreground",
          )}
        >
          <CalendarIcon aria-hidden className="h-4 w-4 shrink-0 opacity-70" />
          <span className="truncate">{selected ? formatDate(selected) : placeholder}</span>
        </button>

        {open && (
          <div
            role="dialog"
            aria-label="Choose date"
            className="absolute z-50 mt-1 animate-nx-fade-in rounded-md border border-border bg-background shadow-md"
          >
            <Calendar
              mode="single"
              selected={selected}
              onSelect={choose}
              disabled={isDateDisabled}
              initialFocus
            />
          </div>
        )}
      </div>
    );
  },
);
DatePicker.displayName = "DatePicker";

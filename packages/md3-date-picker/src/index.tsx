import * as React from "react";
import { CalendarDays } from "lucide-react";
import { Calendar } from "@nucleux/calendar";
import { cn } from "@nucleux/utils";

export interface Md3DatePickerProps {
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (date: Date | undefined) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

const formatDate = (d: Date) =>
  d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

// Material 3 restyle of the react-day-picker grid.
const md3CalendarClassNames = {
  caption_label: "text-sm font-medium text-md-on-surface",
  nav_button:
    "inline-flex h-8 w-8 items-center justify-center rounded-full text-md-on-surface-variant hover:bg-md-on-surface/[0.08]",
  head_cell: "w-9 text-xs font-normal text-md-on-surface-variant",
  day: "inline-flex h-9 w-9 items-center justify-center rounded-full text-sm text-md-on-surface hover:bg-md-on-surface/[0.08]",
  day_selected: "bg-md-primary text-md-on-primary hover:bg-md-primary",
  day_today: "border border-md-primary",
  day_outside: "text-md-on-surface-variant opacity-40",
} as const;

/** A Material Design 3 date picker: an outlined field that opens a calendar. */
export const Md3DatePicker = React.forwardRef<HTMLButtonElement, Md3DatePickerProps>(
  ({ value, defaultValue, onValueChange, label = "Date", disabled = false, className, "aria-label": ariaLabel, ...rest }, ref) => {
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
      <div ref={rootRef} className={cn("relative inline-block", className)} {...rest}>
        <button
          ref={ref}
          type="button"
          disabled={disabled}
          aria-label={ariaLabel ?? label}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex h-14 w-64 items-center justify-between gap-2 rounded-md-xs border border-md-outline bg-transparent px-4 text-left text-base text-md-on-surface outline-none focus-visible:border-md-primary",
            "disabled:pointer-events-none disabled:opacity-[0.38]",
          )}
        >
          <span className={cn("flex flex-col", !selected && "justify-center")}>
            <span className="text-xs text-md-on-surface-variant">{label}</span>
            {selected && <span>{formatDate(selected)}</span>}
          </span>
          <CalendarDays aria-hidden className="h-5 w-5 shrink-0 text-md-on-surface-variant" />
        </button>

        {open && (
          <div
            role="dialog"
            aria-label="Choose date"
            className="absolute z-50 mt-2 animate-nx-fade-in rounded-md-md bg-md-surface-container-high p-2 shadow-md-3"
          >
            <Calendar mode="single" selected={selected} onSelect={choose} classNames={md3CalendarClassNames} initialFocus />
          </div>
        )}
      </div>
    );
  },
);
Md3DatePicker.displayName = "Md3DatePicker";

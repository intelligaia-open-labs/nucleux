import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@nucleux/utils";

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  /** Accessible name for the trigger. */
  "aria-label"?: string;
}

/** A single-select control combining a text filter with a dropdown list. */
export const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(
  (
    {
      options,
      value,
      defaultValue = "",
      onValueChange,
      placeholder = "Select…",
      searchPlaceholder = "Search…",
      emptyText = "No results found.",
      disabled = false,
      className,
      "aria-label": ariaLabel,
    },
    ref,
  ) => {
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState(defaultValue);
    const selected = isControlled ? value : internal;
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");
    const [active, setActive] = React.useState(0);
    const rootRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const filtered = React.useMemo(
      () => options.filter((o) => o.label.toLowerCase().includes(search.trim().toLowerCase())),
      [options, search],
    );
    const selectedLabel = options.find((o) => o.value === selected)?.label;

    React.useEffect(() => {
      if (!open) return;
      const onDown = (e: MouseEvent) => {
        if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
      };
      document.addEventListener("mousedown", onDown);
      return () => document.removeEventListener("mousedown", onDown);
    }, [open]);

    React.useEffect(() => {
      if (open) inputRef.current?.focus();
      else setSearch("");
    }, [open]);

    React.useEffect(() => setActive(0), [search]);

    const choose = (opt: ComboboxOption) => {
      if (opt.disabled) return;
      if (!isControlled) setInternal(opt.value);
      onValueChange?.(opt.value);
      setOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const opt = filtered[active];
        if (opt) choose(opt);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };

    return (
      <div ref={rootRef} className={cn("relative inline-block", className)}>
        <button
          ref={ref}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={ariaLabel}
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex h-9 w-56 items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-sm shadow-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
            "disabled:cursor-not-allowed disabled:opacity-50",
            !selectedLabel && "text-muted-foreground",
          )}
        >
          <span className="truncate">{selectedLabel ?? placeholder}</span>
          <ChevronsUpDown aria-hidden className="h-4 w-4 shrink-0 opacity-50" />
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-56 animate-nx-fade-in overflow-hidden rounded-md border border-border bg-background shadow-md">
            <div className="border-b border-border px-3">
              <input
                ref={inputRef}
                type="text"
                value={search}
                placeholder={searchPlaceholder}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div role="listbox" className="max-h-60 overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">{emptyText}</div>
              ) : (
                filtered.map((opt, i) => (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={opt.value === selected}
                    aria-disabled={opt.disabled || undefined}
                    onMouseMove={() => setActive(i)}
                    onClick={() => choose(opt)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm",
                      i === active && "bg-accent text-accent-foreground",
                      opt.disabled && "pointer-events-none opacity-50",
                    )}
                  >
                    <span className="truncate">{opt.label}</span>
                    {opt.value === selected && <Check aria-hidden className="h-4 w-4 shrink-0" />}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  },
);
Combobox.displayName = "Combobox";

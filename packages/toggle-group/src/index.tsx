import * as React from "react";
import { cn } from "@nucleux/utils";

type Value = string;

interface ToggleGroupContextValue {
  value: Value[];
  toggle: (item: Value) => void;
  size: "sm" | "md" | "lg";
  variant: "default" | "outline";
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue | null>(null);

export interface ToggleGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** "single" allows one active item; "multiple" allows many. */
  type?: "single" | "multiple";
  value?: Value | Value[];
  defaultValue?: Value | Value[];
  onValueChange?: (value: Value | Value[]) => void;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline";
}

const asArray = (v: Value | Value[] | undefined): Value[] =>
  v === undefined ? [] : Array.isArray(v) ? v : [v];

/** A set of {@link ToggleGroupItem}s behaving as a single- or multi-select group. */
export const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  (
    {
      type = "single",
      value,
      defaultValue,
      onValueChange,
      size = "md",
      variant = "default",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState<Value[]>(asArray(defaultValue));
    const current = isControlled ? asArray(value) : internal;

    const toggle = (item: Value) => {
      let next: Value[];
      if (type === "single") {
        next = current[0] === item ? [] : [item];
      } else {
        next = current.includes(item) ? current.filter((v) => v !== item) : [...current, item];
      }
      if (!isControlled) setInternal(next);
      onValueChange?.(type === "single" ? (next[0] ?? "") : next);
    };

    return (
      <div
        ref={ref}
        role="group"
        className={cn("inline-flex items-center gap-1", className)}
        {...props}
      >
        <ToggleGroupContext.Provider value={{ value: current, toggle, size, variant }}>
          {children}
        </ToggleGroupContext.Provider>
      </div>
    );
  },
);
ToggleGroup.displayName = "ToggleGroup";

export interface ToggleGroupItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: Value;
}

const sizes = {
  sm: "h-8 min-w-8 px-1.5",
  md: "h-9 min-w-9 px-2",
  lg: "h-10 min-w-10 px-2.5",
} as const;

/** A single selectable item within a {@link ToggleGroup}. */
export const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  ({ value, className, children, onClick, ...props }, ref) => {
    const ctx = React.useContext(ToggleGroupContext);
    if (!ctx) throw new Error("ToggleGroupItem must be used within a ToggleGroup");
    const on = ctx.value.includes(value);

    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={on}
        data-state={on ? "on" : "off"}
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented) ctx.toggle(value);
        }}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors",
          "hover:bg-muted hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
          "disabled:pointer-events-none disabled:opacity-50",
          "data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
          ctx.variant === "outline" && "border border-input bg-transparent shadow-sm",
          sizes[ctx.size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
ToggleGroupItem.displayName = "ToggleGroupItem";

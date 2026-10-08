import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@nucleux/utils";

interface SegmentedContextValue {
  value: string[];
  toggle: (v: string) => void;
  multiple: boolean;
}
const SegmentedContext = React.createContext<SegmentedContextValue | null>(null);

export interface Md3SegmentedButtonProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  type?: "single" | "multiple";
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
}

const asArray = (v: string | string[] | undefined) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

/** A Material Design 3 segmented button group. Compose with Md3SegmentedButtonItem. */
export const Md3SegmentedButton = React.forwardRef<HTMLDivElement, Md3SegmentedButtonProps>(
  ({ type = "single", value, defaultValue, onValueChange, className, children, ...props }, ref) => {
    const multiple = type === "multiple";
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState<string[]>(asArray(defaultValue));
    const current = isControlled ? asArray(value) : internal;

    const toggle = (v: string) => {
      let next: string[];
      if (multiple) next = current.includes(v) ? current.filter((x) => x !== v) : [...current, v];
      else next = current[0] === v ? [] : [v];
      if (!isControlled) setInternal(next);
      onValueChange?.(multiple ? next : (next[0] ?? ""));
    };

    return (
      <div
        ref={ref}
        role="group"
        className={cn("inline-flex h-10 divide-x divide-md-outline overflow-hidden rounded-full border border-md-outline", className)}
        {...props}
      >
        <SegmentedContext.Provider value={{ value: current, toggle, multiple }}>
          {children}
        </SegmentedContext.Provider>
      </div>
    );
  },
);
Md3SegmentedButton.displayName = "Md3SegmentedButton";

export interface Md3SegmentedButtonItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  icon?: React.ReactNode;
}

/** A single segment within a {@link Md3SegmentedButton}. */
export const Md3SegmentedButtonItem = React.forwardRef<HTMLButtonElement, Md3SegmentedButtonItemProps>(
  ({ value, icon, className, children, ...props }, ref) => {
    const ctx = React.useContext(SegmentedContext);
    if (!ctx) throw new Error("Md3SegmentedButtonItem must be used within a Md3SegmentedButton");
    const selected = ctx.value.includes(value);

    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={selected}
        onClick={() => ctx.toggle(value)}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 overflow-hidden px-4 text-sm font-medium transition-colors [&_svg]:size-[18px]",
          "before:absolute before:inset-0 before:bg-current before:opacity-0 before:transition-opacity before:content-['']",
          "hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12]",
          "outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-md-primary",
          selected ? "bg-md-secondary-container text-md-on-secondary-container" : "text-md-on-surface",
          className,
        )}
        {...props}
      >
        {selected ? (
          <Check aria-hidden className="relative shrink-0" />
        ) : (
          icon && <span className="relative shrink-0">{icon}</span>
        )}
        <span className="relative">{children}</span>
      </button>
    );
  },
);
Md3SegmentedButtonItem.displayName = "Md3SegmentedButtonItem";

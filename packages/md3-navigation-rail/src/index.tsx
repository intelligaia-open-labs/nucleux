import * as React from "react";
import { cn } from "@nucleux/utils";

interface RailContextValue {
  value: string | undefined;
  setValue: (v: string) => void;
}
const RailContext = React.createContext<RailContextValue | null>(null);

export interface Md3NavigationRailProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "defaultValue"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Optional header content (e.g. a menu button or FAB), shown at the top. */
  header?: React.ReactNode;
}

/** A Material Design 3 navigation rail. Compose with Md3NavigationRailItem. */
export const Md3NavigationRail = React.forwardRef<HTMLElement, Md3NavigationRailProps>(
  ({ value, defaultValue, onValueChange, header, className, children, ...props }, ref) => {
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState(defaultValue);
    const current = isControlled ? value : internal;
    const setValue = (v: string) => {
      if (!isControlled) setInternal(v);
      onValueChange?.(v);
    };
    return (
      <nav
        ref={ref}
        className={cn("flex w-20 flex-col items-center gap-3 bg-md-surface py-4", className)}
        {...props}
      >
        {header && <div className="mb-2 flex flex-col items-center gap-3">{header}</div>}
        <RailContext.Provider value={{ value: current, setValue }}>{children}</RailContext.Provider>
      </nav>
    );
  },
);
Md3NavigationRail.displayName = "Md3NavigationRail";

export interface Md3NavigationRailItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  icon: React.ReactNode;
  label: React.ReactNode;
}

/** A destination in a {@link Md3NavigationRail}. */
export const Md3NavigationRailItem = React.forwardRef<HTMLButtonElement, Md3NavigationRailItemProps>(
  ({ value, icon, label, className, ...props }, ref) => {
    const ctx = React.useContext(RailContext);
    if (!ctx) throw new Error("Md3NavigationRailItem must be used within a Md3NavigationRail");
    const active = ctx.value === value;
    return (
      <button
        ref={ref}
        type="button"
        aria-current={active ? "page" : undefined}
        onClick={() => ctx.setValue(value)}
        className={cn("group flex w-full flex-col items-center gap-1 outline-none", className)}
        {...props}
      >
        <span
          className={cn(
            "relative flex h-8 w-14 items-center justify-center overflow-hidden rounded-full transition-colors [&_svg]:size-6",
            "before:absolute before:inset-0 before:bg-md-on-surface before:opacity-0 before:transition-opacity before:content-['']",
            "group-hover:before:opacity-[0.08] group-focus-visible:before:opacity-[0.12]",
            active ? "bg-md-secondary-container text-md-on-secondary-container" : "text-md-on-surface-variant",
          )}
        >
          <span className="relative">{icon}</span>
        </span>
        <span className={cn("text-xs font-medium", active ? "text-md-on-surface" : "text-md-on-surface-variant")}>
          {label}
        </span>
      </button>
    );
  },
);
Md3NavigationRailItem.displayName = "Md3NavigationRailItem";

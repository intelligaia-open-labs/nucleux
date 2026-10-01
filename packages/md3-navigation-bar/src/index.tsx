import * as React from "react";
import { cn } from "@nucleux/utils";

interface NavContextValue {
  value: string | undefined;
  setValue: (v: string) => void;
}
const NavContext = React.createContext<NavContextValue | null>(null);

export interface Md3NavigationBarProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "defaultValue"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

/** A Material Design 3 bottom navigation bar. Compose with Md3NavigationBarItem. */
export const Md3NavigationBar = React.forwardRef<HTMLElement, Md3NavigationBarProps>(
  ({ value, defaultValue, onValueChange, className, children, ...props }, ref) => {
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
        className={cn("flex h-20 items-stretch justify-around bg-md-surface-container px-2", className)}
        {...props}
      >
        <NavContext.Provider value={{ value: current, setValue }}>{children}</NavContext.Provider>
      </nav>
    );
  },
);
Md3NavigationBar.displayName = "Md3NavigationBar";

export interface Md3NavigationBarItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  icon: React.ReactNode;
  label: React.ReactNode;
}

/** A destination in a {@link Md3NavigationBar}. */
export const Md3NavigationBarItem = React.forwardRef<HTMLButtonElement, Md3NavigationBarItemProps>(
  ({ value, icon, label, className, ...props }, ref) => {
    const ctx = React.useContext(NavContext);
    if (!ctx) throw new Error("Md3NavigationBarItem must be used within a Md3NavigationBar");
    const active = ctx.value === value;
    return (
      <button
        ref={ref}
        type="button"
        aria-current={active ? "page" : undefined}
        onClick={() => ctx.setValue(value)}
        className={cn(
          "group flex flex-1 flex-col items-center justify-center gap-1 pt-3 pb-2 outline-none",
          className,
        )}
        {...props}
      >
        <span
          className={cn(
            "relative flex h-8 w-16 items-center justify-center overflow-hidden rounded-full transition-colors [&_svg]:size-6",
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
Md3NavigationBarItem.displayName = "Md3NavigationBarItem";

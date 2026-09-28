import * as React from "react";
import { cn } from "@nucleux/utils";

interface DrawerContextValue {
  value: string | undefined;
  setValue: (v: string) => void;
}
const DrawerContext = React.createContext<DrawerContextValue | null>(null);

export interface Md3NavigationDrawerProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "defaultValue"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Render as a modal drawer with a scrim (controlled via open/onOpenChange). */
  modal?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** A Material Design 3 navigation drawer (standard or modal). */
export const Md3NavigationDrawer = React.forwardRef<HTMLElement, Md3NavigationDrawerProps>(
  ({ value, defaultValue, onValueChange, modal = false, open = true, onOpenChange, className, children, ...props }, ref) => {
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState(defaultValue);
    const current = isControlled ? value : internal;
    const setValue = (v: string) => {
      if (!isControlled) setInternal(v);
      onValueChange?.(v);
    };

    React.useEffect(() => {
      if (!modal || !open) return;
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && onOpenChange?.(false);
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }, [modal, open, onOpenChange]);

    const panel = (
      <nav
        ref={ref}
        className={cn(
          "flex w-80 flex-col gap-1 bg-md-surface-container-low p-3",
          modal ? "h-full rounded-r-md-xl" : "rounded-md-xl",
          className,
        )}
        {...props}
      >
        <DrawerContext.Provider value={{ value: current, setValue }}>{children}</DrawerContext.Provider>
      </nav>
    );

    if (!modal) return panel;
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex">
        <div aria-hidden className="absolute inset-0 bg-md-inverse-surface/40" onClick={() => onOpenChange?.(false)} />
        <div className="relative z-10 animate-nx-fade-in">{panel}</div>
      </div>
    );
  },
);
Md3NavigationDrawer.displayName = "Md3NavigationDrawer";

export interface Md3NavigationDrawerItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  icon?: React.ReactNode;
  /** Trailing content (e.g. a count). */
  trailing?: React.ReactNode;
}

/** A destination row within a {@link Md3NavigationDrawer}. */
export const Md3NavigationDrawerItem = React.forwardRef<HTMLButtonElement, Md3NavigationDrawerItemProps>(
  ({ value, icon, trailing, className, children, ...props }, ref) => {
    const ctx = React.useContext(DrawerContext);
    if (!ctx) throw new Error("Md3NavigationDrawerItem must be used within a Md3NavigationDrawer");
    const active = ctx.value === value;
    return (
      <button
        ref={ref}
        type="button"
        aria-current={active ? "page" : undefined}
        onClick={() => ctx.setValue(value)}
        className={cn(
          "relative flex h-14 items-center gap-3 overflow-hidden rounded-full px-4 text-sm font-medium outline-none transition-colors [&_svg]:size-6",
          "before:absolute before:inset-0 before:bg-md-on-surface before:opacity-0 before:transition-opacity before:content-['']",
          "hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12]",
          active ? "bg-md-secondary-container text-md-on-secondary-container" : "text-md-on-surface-variant",
          className,
        )}
        {...props}
      >
        {icon && <span className="relative shrink-0">{icon}</span>}
        <span className="relative flex-1 truncate text-left">{children}</span>
        {trailing && <span className="relative shrink-0">{trailing}</span>}
      </button>
    );
  },
);
Md3NavigationDrawerItem.displayName = "Md3NavigationDrawerItem";

/** A titled section heading within a {@link Md3NavigationDrawer}. */
export const Md3NavigationDrawerSection = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("px-4 pb-1 pt-4 text-sm font-medium text-md-on-surface-variant", className)} {...props} />
  ),
);
Md3NavigationDrawerSection.displayName = "Md3NavigationDrawerSection";

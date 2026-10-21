import * as React from "react";
import { cn } from "@nucleux/utils";

interface TabsContextValue {
  value: string | undefined;
  setValue: (v: string) => void;
}
const TabsContext = React.createContext<TabsContextValue | null>(null);
const useTabs = (c: string) => {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error(`${c} must be used within Md3Tabs`);
  return ctx;
};

export interface Md3TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

/** Material Design 3 primary tabs. Compose Md3TabsList, Md3Tab, Md3TabPanel. */
export const Md3Tabs = React.forwardRef<HTMLDivElement, Md3TabsProps>(
  ({ value, defaultValue, onValueChange, className, children, ...props }, ref) => {
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState(defaultValue);
    const current = isControlled ? value : internal;
    const setValue = (v: string) => {
      if (!isControlled) setInternal(v);
      onValueChange?.(v);
    };
    return (
      <div ref={ref} className={className} {...props}>
        <TabsContext.Provider value={{ value: current, setValue }}>{children}</TabsContext.Provider>
      </div>
    );
  },
);
Md3Tabs.displayName = "Md3Tabs";

export const Md3TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} role="tablist" className={cn("flex border-b border-md-surface-variant bg-md-surface", className)} {...props} />
  ),
);
Md3TabsList.displayName = "Md3TabsList";

export interface Md3TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  icon?: React.ReactNode;
}

/** A single tab. */
export const Md3Tab = React.forwardRef<HTMLButtonElement, Md3TabProps>(
  ({ value, icon, className, children, ...props }, ref) => {
    const { value: active, setValue } = useTabs("Md3Tab");
    const selected = active === value;
    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={selected}
        onClick={() => setValue(value)}
        className={cn(
          "relative inline-flex h-12 flex-1 items-center justify-center gap-2 overflow-hidden px-4 text-sm font-medium transition-colors [&_svg]:size-5",
          "before:absolute before:inset-0 before:bg-current before:opacity-0 before:transition-opacity before:content-['']",
          "hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12]",
          "outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-md-primary",
          selected ? "text-md-primary" : "text-md-on-surface-variant",
          className,
        )}
        {...props}
      >
        {icon && <span className="relative">{icon}</span>}
        <span className="relative">{children}</span>
        {selected && (
          <span aria-hidden className="absolute inset-x-0 bottom-0 mx-auto h-[3px] w-3/5 rounded-t-full bg-md-primary" />
        )}
      </button>
    );
  },
);
Md3Tab.displayName = "Md3Tab";

export interface Md3TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

/** The panel shown for the active tab. */
export const Md3TabPanel = React.forwardRef<HTMLDivElement, Md3TabPanelProps>(
  ({ value, className, ...props }, ref) => {
    const { value: active } = useTabs("Md3TabPanel");
    if (active !== value) return null;
    return <div ref={ref} role="tabpanel" className={cn("p-4 text-md-on-surface", className)} {...props} />;
  },
);
Md3TabPanel.displayName = "Md3TabPanel";

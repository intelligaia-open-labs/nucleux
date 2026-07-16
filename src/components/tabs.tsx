import * as React from "react";
import { cn } from "../lib/utils";

type Orientation = "horizontal" | "vertical";

interface TabsContextValue {
  value: string;
  setValue: (v: string) => void;
  orientation: Orientation;
  baseId: string;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabs(component: string): TabsContextValue {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <Tabs>`);
  return ctx;
}

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Controlled active tab value. */
  value?: string;
  /** Initial active tab when uncontrolled. */
  defaultValue?: string;
  /** Called with the newly selected value. */
  onValueChange?: (value: string) => void;
  orientation?: Orientation;
}

/** Accessible tabs root. Compose with TabsList, TabsTrigger, and TabsContent. */
export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ value, defaultValue = "", onValueChange, orientation = "horizontal", className, ...props }, ref) => {
    const [internal, setInternal] = React.useState(defaultValue);
    const isControlled = value != null;
    const current = isControlled ? value : internal;
    const baseId = React.useId();

    const setValue = React.useCallback(
      (v: string) => {
        if (!isControlled) setInternal(v);
        onValueChange?.(v);
      },
      [isControlled, onValueChange],
    );

    return (
      <TabsContext.Provider value={{ value: current, setValue, orientation, baseId }}>
        <div
          ref={ref}
          data-orientation={orientation}
          className={cn(orientation === "vertical" ? "flex gap-4" : "flex flex-col gap-3", className)}
          {...props}
        />
      </TabsContext.Provider>
    );
  },
);
Tabs.displayName = "Tabs";

export const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, onKeyDown, ...props }, ref) => {
    const { orientation } = useTabs("TabsList");

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      const keys =
        orientation === "vertical" ? ["ArrowDown", "ArrowUp"] : ["ArrowRight", "ArrowLeft"];
      if (![...keys, "Home", "End"].includes(e.key)) return;
      const tabs = Array.from(
        e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'),
      );
      const idx = tabs.indexOf(document.activeElement as HTMLButtonElement);
      if (idx === -1) return;
      e.preventDefault();
      let next = idx;
      if (e.key === keys[0]) next = (idx + 1) % tabs.length;
      else if (e.key === keys[1]) next = (idx - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = tabs.length - 1;
      tabs[next]?.focus();
      tabs[next]?.click();
    };

    return (
      <div
        ref={ref}
        role="tablist"
        aria-orientation={orientation}
        onKeyDown={handleKeyDown}
        className={cn(
          "gap-1 rounded-lg bg-muted p-1 text-muted-foreground",
          orientation === "vertical" ? "flex flex-col" : "inline-flex items-center",
          className,
        )}
        {...props}
      />
    );
  },
);
TabsList.displayName = "TabsList";

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Value linking this trigger to its TabsContent. */
  value: string;
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, className, disabled, ...props }, ref) => {
    const { value: current, setValue, baseId } = useTabs("TabsTrigger");
    const active = current === value;
    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        id={`${baseId}-trigger-${value}`}
        aria-selected={active}
        aria-controls={`${baseId}-content-${value}`}
        tabIndex={active ? 0 : -1}
        disabled={disabled}
        onClick={() => setValue(value)}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",
          active ? "bg-background text-foreground shadow-sm" : "hover:text-foreground",
          className,
        )}
        {...props}
      />
    );
  },
);
TabsTrigger.displayName = "TabsTrigger";

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, className, ...props }, ref) => {
    const { value: current, baseId } = useTabs("TabsContent");
    if (current !== value) return null;
    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`${baseId}-content-${value}`}
        aria-labelledby={`${baseId}-trigger-${value}`}
        tabIndex={0}
        className={cn("focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
        {...props}
      />
    );
  },
);
TabsContent.displayName = "TabsContent";

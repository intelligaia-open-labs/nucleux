import * as React from "react";
import { cn } from "@nucleux/utils";

interface MenubarContextValue {
  openValue: string | null;
  setOpenValue: (v: string | null) => void;
}
const MenubarContext = React.createContext<MenubarContextValue | null>(null);

const MenuValueContext = React.createContext<string | null>(null);

export type MenubarProps = React.HTMLAttributes<HTMLDivElement>;

/** A horizontal bar of top-level menus (File / Edit / View …). */
export const Menubar = React.forwardRef<HTMLDivElement, MenubarProps>(
  ({ className, children, ...props }, ref) => {
    const [openValue, setOpenValue] = React.useState<string | null>(null);
    const rootRef = React.useRef<HTMLDivElement>(null);
    const setRefs = (node: HTMLDivElement | null) => {
      (rootRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    };

    React.useEffect(() => {
      if (openValue === null) return;
      const onDown = (e: MouseEvent) => {
        if (!rootRef.current?.contains(e.target as Node)) setOpenValue(null);
      };
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenValue(null);
      document.addEventListener("mousedown", onDown);
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("mousedown", onDown);
        document.removeEventListener("keydown", onKey);
      };
    }, [openValue]);

    return (
      <div
        ref={setRefs}
        role="menubar"
        className={cn(
          "flex items-center gap-0.5 rounded-md border border-border bg-background p-1 shadow-sm",
          className,
        )}
        {...props}
      >
        <MenubarContext.Provider value={{ openValue, setOpenValue }}>
          {children}
        </MenubarContext.Provider>
      </div>
    );
  },
);
Menubar.displayName = "Menubar";

export interface MenubarMenuProps {
  /** Unique key for this menu. Auto-generated if omitted. */
  value?: string;
  children: React.ReactNode;
}

/** Groups a {@link MenubarTrigger} with its {@link MenubarContent}. */
export function MenubarMenu({ value, children }: MenubarMenuProps) {
  const generated = React.useId();
  const menuValue = value ?? generated;
  return (
    <MenuValueContext.Provider value={menuValue}>
      <div className="relative">{children}</div>
    </MenuValueContext.Provider>
  );
}

export type MenubarTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

/** The button that opens a menu. */
export const MenubarTrigger = React.forwardRef<HTMLButtonElement, MenubarTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const bar = React.useContext(MenubarContext);
    const value = React.useContext(MenuValueContext);
    if (!bar || value === null) throw new Error("MenubarTrigger must be used within a MenubarMenu");
    const open = bar.openValue === value;
    return (
      <button
        ref={ref}
        type="button"
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => bar.setOpenValue(open ? null : value)}
        onMouseEnter={() => bar.openValue !== null && bar.setOpenValue(value)}
        className={cn(
          "flex items-center rounded-sm px-3 py-1 text-sm font-medium outline-none transition-colors",
          "focus-visible:ring-2 focus-visible:ring-ring",
          open ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-accent",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
MenubarTrigger.displayName = "MenubarTrigger";

export type MenubarContentProps = React.HTMLAttributes<HTMLDivElement>;

/** The dropdown panel revealed when a menu is open. */
export const MenubarContent = React.forwardRef<HTMLDivElement, MenubarContentProps>(
  ({ className, children, ...props }, ref) => {
    const bar = React.useContext(MenubarContext);
    const value = React.useContext(MenuValueContext);
    if (!bar || value === null) throw new Error("MenubarContent must be used within a MenubarMenu");
    if (bar.openValue !== value) return null;
    return (
      <div
        ref={ref}
        role="menu"
        className={cn(
          "absolute left-0 top-full z-50 mt-1 min-w-[12rem] animate-nx-fade-in rounded-lg border border-border bg-background p-1 text-foreground shadow-md",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
MenubarContent.displayName = "MenubarContent";

export interface MenubarItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  trailing?: React.ReactNode;
  destructive?: boolean;
}

/** A selectable item inside a {@link MenubarContent}. */
export const MenubarItem = React.forwardRef<HTMLButtonElement, MenubarItemProps>(
  ({ className, children, trailing, destructive = false, onClick, ...props }, ref) => {
    const bar = React.useContext(MenubarContext);
    return (
      <button
        ref={ref}
        type="button"
        role="menuitem"
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented) bar?.setOpenValue(null);
        }}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",
          destructive ? "text-destructive hover:bg-destructive/10" : "text-foreground hover:bg-accent",
          className,
        )}
        {...props}
      >
        <span className="flex-1 truncate">{children}</span>
        {trailing && <span className="shrink-0 text-muted-foreground">{trailing}</span>}
      </button>
    );
  },
);
MenubarItem.displayName = "MenubarItem";

export const MenubarSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} role="separator" className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
  ),
);
MenubarSeparator.displayName = "MenubarSeparator";

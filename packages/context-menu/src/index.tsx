import * as React from "react";
import { cn } from "@nucleux/utils";

interface ContextMenuContextValue {
  close: () => void;
}
const ContextMenuContext = React.createContext<ContextMenuContextValue | null>(null);

export interface ContextMenuProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "content"> {
  /** Menu items — compose ContextMenuItem / ContextMenuSeparator / ContextMenuLabel. */
  content: React.ReactNode;
  /** The area that opens the menu on right-click. */
  children: React.ReactNode;
}

/** Wraps a region so right-clicking it opens a menu at the cursor. */
export const ContextMenu = React.forwardRef<HTMLDivElement, ContextMenuProps>(
  ({ content, children, className, ...props }, ref) => {
    const [pos, setPos] = React.useState<{ x: number; y: number } | null>(null);
    const menuRef = React.useRef<HTMLDivElement>(null);
    const close = React.useCallback(() => setPos(null), []);

    React.useEffect(() => {
      if (!pos) return;
      const onDown = (e: MouseEvent) => {
        if (!menuRef.current?.contains(e.target as Node)) close();
      };
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
      const onScroll = () => close();
      document.addEventListener("mousedown", onDown);
      document.addEventListener("keydown", onKey);
      window.addEventListener("scroll", onScroll, true);
      return () => {
        document.removeEventListener("mousedown", onDown);
        document.removeEventListener("keydown", onKey);
        window.removeEventListener("scroll", onScroll, true);
      };
    }, [pos, close]);

    React.useEffect(() => {
      if (pos) menuRef.current?.focus();
    }, [pos]);

    return (
      <div
        ref={ref}
        onContextMenu={(e) => {
          e.preventDefault();
          setPos({ x: e.clientX, y: e.clientY });
        }}
        className={className}
        {...props}
      >
        {children}
        {pos && (
          <div
            ref={menuRef}
            role="menu"
            tabIndex={-1}
            style={{ top: pos.y, left: pos.x }}
            className={cn(
              "fixed z-50 min-w-[12rem] animate-nx-fade-in rounded-lg border border-border bg-background p-1 text-foreground shadow-md outline-none",
            )}
          >
            <ContextMenuContext.Provider value={{ close }}>{content}</ContextMenuContext.Provider>
          </div>
        )}
      </div>
    );
  },
);
ContextMenu.displayName = "ContextMenu";

export interface ContextMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  destructive?: boolean;
}

/** A selectable item inside a {@link ContextMenu}. Closes the menu on click. */
export const ContextMenuItem = React.forwardRef<HTMLButtonElement, ContextMenuItemProps>(
  ({ icon, trailing, destructive = false, className, children, onClick, ...props }, ref) => {
    const ctx = React.useContext(ContextMenuContext);
    return (
      <button
        ref={ref}
        type="button"
        role="menuitem"
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented) ctx?.close();
        }}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",
          destructive ? "text-destructive hover:bg-destructive/10" : "text-foreground hover:bg-accent",
          className,
        )}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        <span className="flex-1 truncate">{children}</span>
        {trailing && <span className="shrink-0 text-muted-foreground">{trailing}</span>}
      </button>
    );
  },
);
ContextMenuItem.displayName = "ContextMenuItem";

export const ContextMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} role="separator" className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
  ),
);
ContextMenuSeparator.displayName = "ContextMenuSeparator";

export const ContextMenuLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground", className)} {...props} />
  ),
);
ContextMenuLabel.displayName = "ContextMenuLabel";

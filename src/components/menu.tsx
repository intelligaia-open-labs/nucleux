import * as React from "react";
import { cn } from "../lib/utils";

/**
 * A menu surface (dropdown / context menu panel). Presentational — pair with
 * your own trigger/positioning. Compose with MenuItem, MenuSeparator, MenuLabel.
 */
export const Menu = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="menu"
      className={cn(
        "min-w-[12rem] rounded-lg border border-border bg-background p-1 text-foreground shadow-md",
        className,
      )}
      {...props}
    />
  ),
);
Menu.displayName = "Menu";

export interface MenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Leading icon. */
  icon?: React.ReactNode;
  /** Trailing content — shortcut hint or submenu chevron. */
  trailing?: React.ReactNode;
  /** Style as a destructive action. */
  destructive?: boolean;
}

export const MenuItem = React.forwardRef<HTMLButtonElement, MenuItemProps>(
  ({ icon, trailing, destructive = false, type = "button", className, children, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      role="menuitem"
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",
        destructive
          ? "text-destructive hover:bg-destructive/10"
          : "text-foreground hover:bg-accent",
        className,
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="flex-1 truncate">{children}</span>
      {trailing && <span className="shrink-0 text-muted-foreground">{trailing}</span>}
    </button>
  ),
);
MenuItem.displayName = "MenuItem";

export const MenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} role="separator" className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
  ),
);
MenuSeparator.displayName = "MenuSeparator";

export const MenuLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground", className)}
      {...props}
    />
  ),
);
MenuLabel.displayName = "MenuLabel";

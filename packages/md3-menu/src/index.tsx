import * as React from "react";
import { cn } from "@nucleux/utils";

/**
 * A Material Design 3 menu surface (presentational — pair with your own trigger
 * and positioning). Compose with Md3MenuItem and Md3MenuDivider.
 */
export const Md3Menu = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="menu"
      className={cn(
        "min-w-[12rem] rounded-md-xs bg-md-surface-container py-2 text-md-on-surface shadow-md-2",
        className,
      )}
      {...props}
    />
  ),
);
Md3Menu.displayName = "Md3Menu";

export interface Md3MenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  /** Trailing content — a shortcut hint or submenu marker. */
  trailing?: React.ReactNode;
}

/** A selectable row inside a {@link Md3Menu}. */
export const Md3MenuItem = React.forwardRef<HTMLButtonElement, Md3MenuItemProps>(
  ({ icon, trailing, className, children, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      role="menuitem"
      className={cn(
        "relative flex h-12 w-full items-center gap-3 overflow-hidden px-3 text-left text-sm text-md-on-surface outline-none [&_svg]:size-6",
        "before:absolute before:inset-0 before:bg-md-on-surface before:opacity-0 before:transition-opacity before:content-['']",
        "hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12]",
        "disabled:pointer-events-none disabled:opacity-[0.38]",
        className,
      )}
      {...props}
    >
      {icon && <span className="relative shrink-0 text-md-on-surface-variant">{icon}</span>}
      <span className="relative flex-1 truncate">{children}</span>
      {trailing && <span className="relative shrink-0 text-md-on-surface-variant">{trailing}</span>}
    </button>
  ),
);
Md3MenuItem.displayName = "Md3MenuItem";

export const Md3MenuDivider = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} role="separator" className={cn("my-2 h-px bg-md-surface-variant", className)} {...props} />
  ),
);
Md3MenuDivider.displayName = "Md3MenuDivider";

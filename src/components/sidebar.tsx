import * as React from "react";
import { cn } from "../lib/utils";

/**
 * Collapsed application sidebar — a narrow vertical icon rail. Compose a brand
 * mark, {@link SidebarItem}s, {@link SidebarSeparator}s, and a pinned `footer`:
 *
 * ```tsx
 * <Sidebar footer={<SidebarItem icon={<Settings />} label="Settings" />}>
 *   <BrandMark />
 *   <SidebarItem icon={<Home />} label="Home" active />
 *   <SidebarItem icon={<Sparkles />} label="Assistant" />
 * </Sidebar>
 * ```
 */
export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  /** Content pinned to the bottom of the rail (e.g. settings). */
  footer?: React.ReactNode;
}

export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  ({ footer, className, children, ...props }, ref) => (
    <nav
      ref={ref}
      className={cn(
        "flex h-full w-[69px] shrink-0 flex-col items-center gap-4 border-r border-border bg-background p-4",
        className,
      )}
      {...props}
    >
      {children}
      {footer && <div className="mt-auto flex flex-col items-center gap-1">{footer}</div>}
    </nav>
  ),
);
Sidebar.displayName = "Sidebar";

export interface SidebarItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** The icon to render. */
  icon: React.ReactNode;
  /** Accessible label + tooltip (rail is icon-only). */
  label: string;
  /** Marks the item as the current page. */
  active?: boolean;
}

/** A single icon entry in a collapsed {@link Sidebar}. */
export const SidebarItem = React.forwardRef<HTMLButtonElement, SidebarItemProps>(
  ({ icon, label, active = false, type = "button", className, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      title={label}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-5",
        active
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  ),
);
SidebarItem.displayName = "SidebarItem";

/** Horizontal hairline separating groups of sidebar items. */
export const SidebarSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      className={cn("h-px w-9 shrink-0 bg-border", className)}
      {...props}
    />
  ),
);
SidebarSeparator.displayName = "SidebarSeparator";

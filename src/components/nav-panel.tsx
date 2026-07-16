import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";

/**
 * An expanded vertical navigation panel (docs/library sidebar) with a header,
 * collapsible {@link NavSection}s, and text {@link NavItem}s.
 */
export const NavPanel = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <nav
      ref={ref}
      className={cn(
        "flex h-full w-64 shrink-0 flex-col gap-4 overflow-y-auto border-r border-border bg-muted/30 py-4",
        className,
      )}
      {...props}
    />
  ),
);
NavPanel.displayName = "NavPanel";

export interface NavPanelHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Trailing meta text, e.g. a count. */
  meta?: React.ReactNode;
}

export const NavPanelHeader = React.forwardRef<HTMLDivElement, NavPanelHeaderProps>(
  ({ meta, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center gap-2 px-4", className)}
      {...props}
    >
      <span className="flex-1 text-xs font-semibold uppercase tracking-wide text-foreground">
        {children}
      </span>
      {meta && <span className="text-[10px] text-muted-foreground">{meta}</span>}
    </div>
  ),
);
NavPanelHeader.displayName = "NavPanelHeader";

export interface NavSectionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Section title. */
  title: React.ReactNode;
  /** Whether the section is collapsible (shows a chevron toggle). */
  collapsible?: boolean;
  /** Initial open state (collapsible sections). */
  defaultOpen?: boolean;
}

export const NavSection = React.forwardRef<HTMLDivElement, NavSectionProps>(
  ({ title, collapsible = false, defaultOpen = true, className, children, ...props }, ref) => {
    const [open, setOpen] = React.useState(defaultOpen);
    const showChildren = !collapsible || open;
    return (
      <div ref={ref} className={cn("flex flex-col gap-0.5", className)} {...props}>
        {collapsible ? (
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-7 items-center gap-2 px-4 text-left text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex-1">{title}</span>
            <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
          </button>
        ) : (
          <div className="flex h-7 items-center px-4 text-sm font-semibold text-foreground">
            {title}
          </div>
        )}
        {showChildren && <div className="flex flex-col">{children}</div>}
      </div>
    );
  },
);
NavSection.displayName = "NavSection";

export interface NavItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Marks the item as the current page. */
  active?: boolean;
}

export const NavItem = React.forwardRef<HTMLAnchorElement, NavItemProps>(
  ({ active = false, className, ...props }, ref) => (
    <a
      ref={ref}
      aria-current={active ? "page" : undefined}
      className={cn(
        "mx-2 flex h-7 cursor-pointer items-center rounded px-2 text-xs transition-colors",
        active
          ? "bg-accent font-medium text-foreground"
          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
        className,
      )}
      {...props}
    />
  ),
);
NavItem.displayName = "NavItem";

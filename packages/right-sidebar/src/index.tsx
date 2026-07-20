import * as React from "react";
import { cn } from "@nucleux/utils";

/**
 * A right-hand contextual panel — an "on this page" table of contents plus a
 * metadata list. Compose with the parts below. Source: Figma "AIUX / Right Sidebar".
 */
export const RightSidebar = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <nav
      ref={ref}
      aria-label="On this page"
      className={cn("flex w-44 shrink-0 flex-col py-8 pl-2 pr-4", className)}
      {...props}
    />
  ),
);
RightSidebar.displayName = "RightSidebar";

export const RightSidebarLabel = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground", className)}
      {...props}
    />
  ),
);
RightSidebarLabel.displayName = "RightSidebarLabel";

export interface RightSidebarAnchorProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Marks the current in-view anchor. */
  active?: boolean;
}

export const RightSidebarAnchor = React.forwardRef<HTMLAnchorElement, RightSidebarAnchorProps>(
  ({ active = false, className, children, ...props }, ref) => (
    <a
      ref={ref}
      aria-current={active ? "location" : undefined}
      className={cn(
        "flex items-center gap-1.5 py-1.5 text-xs transition-colors",
        active ? "font-medium text-info" : "text-muted-foreground hover:text-foreground",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn("h-4 w-0.5 shrink-0 rounded-full", active ? "bg-info" : "bg-transparent")}
      />
      {children}
    </a>
  ),
);
RightSidebarAnchor.displayName = "RightSidebarAnchor";

export interface RightSidebarMetaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Field name, e.g. "Stage". */
  label: React.ReactNode;
  /** Field value, e.g. "Onboarding". */
  value: React.ReactNode;
}

export const RightSidebarMeta = React.forwardRef<HTMLDivElement, RightSidebarMetaProps>(
  ({ label, value, className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-0.5 pb-3", className)} {...props}>
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className="text-xs font-medium text-foreground">{value}</span>
    </div>
  ),
);
RightSidebarMeta.displayName = "RightSidebarMeta";

export const RightSidebarSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} role="separator" className={cn("my-4 h-px w-full bg-border", className)} {...props} />
  ),
);
RightSidebarSeparator.displayName = "RightSidebarSeparator";

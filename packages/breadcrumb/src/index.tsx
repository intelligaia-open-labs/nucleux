import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@nucleux/utils";

/** Breadcrumb navigation landmark. Compose with the parts below. */
export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  /** Additional classes merged onto the outer nav wrapper. */
  className?: string;
}

/** Breadcrumb navigation trail (nav > ol). */
export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, children, ...props }, ref) => (
    <nav ref={ref} aria-label="Breadcrumb" className={className} {...props}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        {children}
      </ol>
    </nav>
  ),
);
Breadcrumb.displayName = "Breadcrumb";

export interface BreadcrumbItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  /** Additional classes merged onto the crumb list item. */
  className?: string;
}

/** One crumb in the breadcrumb trail. */
export const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("inline-flex items-center gap-1.5", className)} {...props} />
  ),
);
BreadcrumbItem.displayName = "BreadcrumbItem";

export interface BreadcrumbLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Additional classes merged onto the crumb anchor. */
  className?: string;
}

/** Clickable crumb link. */
export const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ className, ...props }, ref) => (
    <a
      ref={ref}
      className={cn(
        "transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  ),
);
BreadcrumbLink.displayName = "BreadcrumbLink";

/** The current page — non-interactive, marked with aria-current. */
export interface BreadcrumbPageProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Additional classes merged onto the current-page crumb. */
  className?: string;
}

/** The current (last, non-clickable) crumb. */
export const BreadcrumbPage = React.forwardRef<HTMLSpanElement, BreadcrumbPageProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("font-medium text-foreground", className)}
      {...props}
    />
  ),
);
BreadcrumbPage.displayName = "BreadcrumbPage";

export interface BreadcrumbSeparatorProps extends React.LiHTMLAttributes<HTMLLIElement> {
  /** Additional classes merged onto the separator glyph container. */
  className?: string;
  /** Custom separator glyph; defaults to a ChevronRight icon. */
  children?: React.ReactNode;
}

/** Glyph between crumbs; defaults to a ChevronRight icon. */
export const BreadcrumbSeparator = ({
  className,
  children,
  ...props
}: BreadcrumbSeparatorProps) => (
  <li role="presentation" aria-hidden className={cn("[&_svg]:size-3.5", className)} {...props}>
    {children ?? <ChevronRight />}
  </li>
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

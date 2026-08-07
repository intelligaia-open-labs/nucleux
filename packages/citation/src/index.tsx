import * as React from "react";
import { cn } from "@nucleux/utils";
import { FileText, ExternalLink } from "lucide-react";

export interface CitationProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "title"> {
  /** Source index shown in the chip, e.g. `4`. Ignored if `children` is given. */
  index?: number;
  /** Text label instead of a number, e.g. `"wikipedia.com"`. */
  label?: React.ReactNode;
}

/**
 * An inline citation chip embedded in an AI answer — a compact numbered or
 * domain marker that attributes a claim to a source.
 * Source: Figma "Explainability / Inline source chip".
 */
export const Citation = React.forwardRef<HTMLButtonElement, CitationProps>(
  ({ index, label, className, children, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center gap-1 rounded-full border border-border bg-muted px-1.5 align-middle text-[0.6875rem] font-medium leading-none text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    >
      {children ?? label ?? index}
    </button>
  ),
);
Citation.displayName = "Citation";

export interface SourceItemProps
  extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "title"> {
  /** Optional leading index, e.g. `1`. */
  index?: number;
  /** Icon shown in the leading slot. Defaults to a document icon. */
  icon?: React.ReactNode;
  /** Source title, e.g. a filename. */
  title: React.ReactNode;
  /** Metadata line, e.g. `"Source · PDF · Section 4.1"`. */
  meta?: React.ReactNode;
  /** If set, the open affordance becomes a link to this href. */
  href?: string;
  /** Label for the open affordance. Defaults to `"Open"`. */
  actionLabel?: React.ReactNode;
  /** Called when the open affordance is activated (button mode). */
  onOpen?: () => void;
}

/** A single row in a {@link SourceList}: icon, title, metadata and an open action. */
export const SourceItem = React.forwardRef<HTMLLIElement, SourceItemProps>(
  ({ index, icon, title, meta, href, actionLabel = "Open", onOpen, className, ...props }, ref) => {
    const action = href ? (
      <a
        href={href}
        className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-info transition-colors hover:bg-info/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {actionLabel}
        <ExternalLink className="size-3.5" aria-hidden="true" />
      </a>
    ) : (
      <button
        type="button"
        onClick={onOpen}
        className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-info transition-colors hover:bg-info/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {actionLabel}
        <ExternalLink className="size-3.5" aria-hidden="true" />
      </button>
    );
    return (
      <li
        ref={ref}
        className={cn("flex items-center gap-3 rounded-lg border border-border bg-background p-3", className)}
        {...props}
      >
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          {index != null ? (
            <span className="text-xs font-semibold">{index}</span>
          ) : (
            icon ?? <FileText className="size-4" aria-hidden="true" />
          )}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium text-foreground">{title}</span>
          {meta && <span className="truncate text-xs text-muted-foreground">{meta}</span>}
        </span>
        {action}
      </li>
    );
  },
);
SourceItem.displayName = "SourceItem";

export interface SourceListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Heading above the list, e.g. `"3 sources · 1 missing policy"`. */
  heading?: React.ReactNode;
}

/**
 * A grounded sources block: the knowledge sources an AI answer drew on, each an
 * openable {@link SourceItem}. Surfaces the retrieval set behind a response.
 */
export const SourceList = React.forwardRef<HTMLDivElement, SourceListProps>(
  ({ heading, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-3", className)}
      {...props}
    >
      {heading && (
        <p className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {heading}
        </p>
      )}
      <ul className="flex flex-col gap-2">{children}</ul>
    </div>
  ),
);
SourceList.displayName = "SourceList";

import * as React from "react";
import { ChevronDown, ChevronRight, Clock } from "lucide-react";
import { cn } from "@nucleux/utils";
import { Button } from "@nucleux/button";

/** Form of the disclaimer, from the spec's variants. */
export type DisclaimerVariant = "capabilities-list" | "limitations-card" | "cutoff-note";

/** A labelled row of the full statement: "Can", "Can't", "Needs your approval", "May get wrong". */
export interface DisclaimerGroup {
  /** Row label. */
  label: string;
  /** The points in this row. */
  items: React.ReactNode[];
}

export interface DisclaimerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** "capabilities-list" (default), "limitations-card" or "cutoff-note". */
  variant?: DisclaimerVariant;
  /** The agent's name, used in the default title and label. Defaults to "the assistant". */
  agentName?: string;
  /**
   * Heading. Defaults to "What {agent} can do" or "{Agent} won't". Pass
   * `null` for a heading-less summary: the icon then sits beside `children`.
   */
  title?: React.ReactNode;
  /**
   * Leading mark. The shadcn family shows none by default; the Material 3
   * twin shows an info icon. Pass `null` to omit it in either family.
   */
  icon?: React.ReactNode;
  /** Bulleted points (what it can do, or what it won't). */
  items?: React.ReactNode[];
  /** Labelled rows for the full statement (can / can't / needs approval / may get wrong). */
  groups?: DisclaimerGroup[];
  /** Knowledge cutoff, e.g. "April 2026". */
  cutoff?: string;
  /** Points shown before "Show all" — the spec's three-line limit. Defaults to 3. */
  maxItems?: number;
  /** Link to a fuller explanation. */
  learnMoreHref?: string;
  /** Label of the link. Defaults to "Learn more". */
  learnMoreLabel?: string;
  /**
   * Put `groups` behind a toggle with this label ("See what Aria can and
   * can't do") instead of showing them. Closed by default.
   */
  detailsLabel?: string;
  /** Label of the toggle while the groups are open. Defaults to "Hide details". */
  detailsCloseLabel?: string;
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * A short, honest statement of what the agent is, what it isn't and what it
 * doesn't know, shown at the start of the experience. As a capabilities list
 * it says what to ask for; as a limitations card it foregrounds the
 * boundaries (in warning, not error, colours — a known limit is not a
 * failure); as a cutoff note it is a one-line caption that travels with the
 * agent. Points beyond `maxItems` (3) sit behind "Show all", and `groups`
 * gives the full can / can't / needs approval / may get wrong statement.
 */
export const Disclaimer = React.forwardRef<HTMLDivElement, DisclaimerProps>(
  (
    {
      variant = "capabilities-list",
      agentName = "the assistant",
      title,
      items,
      groups,
      cutoff,
      maxItems = 3,
      learnMoreHref,
      learnMoreLabel = "Learn more",
      icon,
      detailsLabel,
      detailsCloseLabel = "Hide details",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const baseId = React.useId();
    const listId = `${baseId}-list`;
    const [expanded, setExpanded] = React.useState(false);
    const [detailsOpen, setDetailsOpen] = React.useState(false);
    const Agent = capitalize(agentName);

    if (variant === "cutoff-note") {
      return (
        <div
          ref={ref}
          role="note"
          aria-label="Knowledge cutoff"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground",
            className,
          )}
          {...props}
        >
          <Clock aria-hidden="true" className="size-3" />
          {children ?? (cutoff ? `${Agent} knows up to ${cutoff}` : `${Agent} may not know recent events`)}
          {learnMoreHref && (
            <a href={learnMoreHref} className="font-medium text-foreground underline underline-offset-2">
              {learnMoreLabel}
            </a>
          )}
        </div>
      );
    }

    const limitations = variant === "limitations-card";
    const heading =
      title === null ? null : (title ?? (limitations ? `${Agent} won't` : `What ${agentName} can do`));
    const visibleItems = items && !expanded ? items.slice(0, Math.max(0, maxItems)) : items;
    const mark = icon ? (
      <span aria-hidden="true" className="mt-px flex shrink-0 text-muted-foreground [&_svg]:size-4">
        {icon}
      </span>
    ) : null;
    const groupsId = `${baseId}-groups`;
    const groupsHidden = detailsLabel != null && !detailsOpen;

    return (
      <div
        ref={ref}
        role="note"
        aria-labelledby={heading != null ? `${baseId}-title` : undefined}
        aria-label={heading == null ? `About ${agentName}` : undefined}
        className={cn(
          "flex flex-col gap-2 text-xs leading-[18px]",
          limitations
            ? "rounded-r-lg border border-l-[3px] border-border border-l-warning bg-background px-3.5 py-3"
            : "rounded-lg border border-border bg-background p-4 shadow-sm",
          className,
        )}
        {...props}
      >
        {heading != null ? (
          <p id={`${baseId}-title`} className="flex items-center gap-1.5 text-[13px] font-semibold leading-5 text-foreground">
            {mark}
            {heading}
          </p>
        ) : null}
        {children != null &&
          (heading == null ? (
            <div className="flex items-start gap-2 text-[13px] leading-5 text-foreground">
              {mark}
              <div className="min-w-0">{children}</div>
            </div>
          ) : (
            <div className="text-muted-foreground">{children}</div>
          ))}
        {visibleItems && visibleItems.length > 0 && (
          <ul id={listId} className="m-0 flex list-none flex-col p-0 text-muted-foreground">
            {visibleItems.map((item, i) => (
              <li key={i} className="before:mr-1.5 before:content-['•']">
                {item}
              </li>
            ))}
          </ul>
        )}
        {items && items.length > maxItems && (
          <Button
            variant="link"
            size="sm"
            aria-expanded={expanded}
            aria-controls={listId}
            onClick={() => setExpanded((e) => !e)}
            className="h-auto self-start px-0 text-xs"
          >
            {expanded ? "Show less" : `Show all (${items.length})`}
          </Button>
        )}
        {groups && groups.length > 0 && detailsLabel != null && (
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={detailsOpen}
            aria-controls={groupsId}
            onClick={() => setDetailsOpen((o) => !o)}
            leftIcon={detailsOpen ? <ChevronDown aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
            className="h-7 self-start px-2 text-xs font-medium"
          >
            {detailsOpen ? detailsCloseLabel : detailsLabel}
          </Button>
        )}
        {groups && groups.length > 0 && (
          <dl id={groupsId} hidden={groupsHidden} className={cn("m-0 flex flex-col gap-2", groupsHidden && "hidden")}>
            {groups.map((g) => (
              <div key={g.label} className="flex flex-col gap-0.5">
                <dt className="font-semibold text-foreground">{g.label}</dt>
                {g.items.map((item, i) => (
                  <dd key={i} className="m-0 text-muted-foreground">
                    {item}
                  </dd>
                ))}
              </div>
            ))}
          </dl>
        )}
        {(cutoff || learnMoreHref) && (
          <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
            {cutoff && <span>Knowledge cutoff · {cutoff}</span>}
            {learnMoreHref && (
              <a
                href={learnMoreHref}
                className="ml-auto font-medium text-foreground underline underline-offset-2 hover:opacity-70"
              >
                {learnMoreLabel}
              </a>
            )}
          </div>
        )}
      </div>
    );
  },
);
Disclaimer.displayName = "Disclaimer";

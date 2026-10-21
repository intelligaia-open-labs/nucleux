import * as React from "react";
import { Clock, Info } from "lucide-react";
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
  /** Heading. Defaults to "What {agent} can do" or "{Agent} won't". */
  title?: React.ReactNode;
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
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const baseId = React.useId();
    const listId = `${baseId}-list`;
    const [expanded, setExpanded] = React.useState(false);
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
    const heading = title ?? (limitations ? `${Agent} won't` : `What ${agentName} can do`);
    const visibleItems = items && !expanded ? items.slice(0, Math.max(0, maxItems)) : items;

    return (
      <div
        ref={ref}
        role="note"
        aria-labelledby={`${baseId}-title`}
        className={cn(
          "flex flex-col gap-2 text-sm",
          limitations
            ? "rounded-r-lg border border-l-4 border-border border-l-warning bg-background px-4 py-3"
            : "rounded-lg border border-border bg-background p-4",
          className,
        )}
        {...props}
      >
        <p id={`${baseId}-title`} className="flex items-center gap-1.5 font-semibold text-foreground">
          {!limitations && <Info aria-hidden="true" className="size-4 text-brand" />}
          {heading}
        </p>
        {children != null && <div className="text-muted-foreground">{children}</div>}
        {visibleItems && visibleItems.length > 0 && (
          <ul id={listId} className="m-0 flex list-disc flex-col gap-0.5 pl-5 text-muted-foreground marker:text-muted-foreground/60">
            {visibleItems.map((item, i) => (
              <li key={i}>{item}</li>
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
            className="self-start text-xs"
          >
            {expanded ? "Show less" : `Show all (${items.length})`}
          </Button>
        )}
        {groups && groups.length > 0 && (
          <dl className="m-0 flex flex-col gap-2">
            {groups.map((g) => (
              <div key={g.label} className="flex flex-col gap-0.5">
                <dt className="text-xs font-semibold text-foreground">{g.label}</dt>
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
          <div className="mt-1 flex items-center gap-3 border-t border-border pt-2 text-xs text-muted-foreground">
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

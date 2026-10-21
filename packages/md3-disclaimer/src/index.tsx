import * as React from "react";
import { Clock, Info, ShieldAlert } from "lucide-react";
import { cn } from "@nucleux/utils";
import type { DisclaimerGroup, DisclaimerProps, DisclaimerVariant } from "@nucleux/disclaimer";
import { Md3Button } from "@nucleux/md3-button";
import { Md3Card } from "@nucleux/md3-card";

/** Props of {@link Md3Disclaimer} — identical to `DisclaimerProps` from `@nucleux/disclaimer`. */
export type Md3DisclaimerProps = DisclaimerProps;
/** "capabilities-list", "limitations-card" or "cutoff-note". */
export type Md3DisclaimerVariant = DisclaimerVariant;
export type { DisclaimerGroup };

// Copied from @nucleux/disclaimer (internal there).
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const linkClass =
  "rounded-md-xs font-medium text-md-primary underline underline-offset-2 outline-none hover:decoration-2 focus-visible:ring-2 focus-visible:ring-md-secondary";

/**
 * The Material 3 statement of what the agent can and can't do — the same API
 * and behaviour as `Disclaimer`. Calm and informative, never the error colour:
 * the capabilities list is a filled M3 card with an info mark in secondary;
 * the limitations card is a low surface whose leading rule takes the tertiary
 * role (a known limit is not a failure); the cutoff note is a full-corner,
 * body-small standing line. Points beyond `maxItems` (3) sit behind a text
 * "Show all" button, and `groups` render as labelled rows (can / can't /
 * needs approval / may get wrong) with the label in its own column.
 */
export const Md3Disclaimer = React.forwardRef<HTMLDivElement, Md3DisclaimerProps>(
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
            "inline-flex items-center gap-2 rounded-full bg-md-surface-container px-3.5 py-1.5 text-xs leading-4 tracking-[0.4px] text-md-on-surface-variant",
            className,
          )}
          {...props}
        >
          <Clock aria-hidden="true" className="size-3.5 shrink-0" />
          {children ?? (cutoff ? `${Agent} knows up to ${cutoff}` : `${Agent} may not know recent events`)}
          {learnMoreHref && (
            <a href={learnMoreHref} className={linkClass}>
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
      <Md3Card
        ref={ref}
        variant={limitations ? "outlined" : "filled"}
        role="note"
        aria-labelledby={`${baseId}-title`}
        className={cn(
          "flex flex-col gap-3 text-sm tracking-[0.25px]",
          limitations
            ? "rounded-l-md-xs rounded-r-md-md border-l-4 border-l-md-tertiary bg-md-surface-container-low px-4 py-3.5"
            : "rounded-md-lg p-5",
          className,
        )}
        {...props}
      >
        <p
          id={`${baseId}-title`}
          className="flex items-center gap-2 text-base font-medium leading-6 tracking-[0.15px] text-md-on-surface"
        >
          {limitations ? (
            <ShieldAlert aria-hidden="true" className="size-5 shrink-0 text-md-tertiary" />
          ) : (
            <Info aria-hidden="true" className="size-5 shrink-0 text-md-secondary" />
          )}
          {heading}
        </p>
        {children != null && <div className="text-md-on-surface-variant">{children}</div>}
        {visibleItems && visibleItems.length > 0 && (
          <ul
            id={listId}
            className="m-0 flex list-disc flex-col gap-1 pl-5 text-md-on-surface-variant marker:text-md-outline"
          >
            {visibleItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}
        {items && items.length > maxItems && (
          <Md3Button
            variant="text"
            aria-expanded={expanded}
            aria-controls={listId}
            onClick={() => setExpanded((e) => !e)}
            className="-ml-3 h-8 self-start px-3"
          >
            {expanded ? "Show less" : `Show all (${items.length})`}
          </Md3Button>
        )}
        {groups && groups.length > 0 && (
          <dl className="m-0 flex flex-col gap-2.5">
            {groups.map((g) => (
              <div key={g.label} className="grid grid-cols-[minmax(5.5rem,auto)_minmax(0,1fr)] items-baseline gap-x-3 gap-y-0.5">
                <dt className="font-medium text-md-on-surface">{g.label}</dt>
                {g.items.map((item, i) => (
                  <dd key={i} className="col-start-2 m-0 text-md-on-surface-variant">
                    {item}
                  </dd>
                ))}
              </div>
            ))}
          </dl>
        )}
        {(cutoff || learnMoreHref) && (
          <div className="flex items-center gap-3 border-t border-md-outline-variant pt-3 text-xs tracking-[0.4px] text-md-on-surface-variant">
            {cutoff && <span>Knowledge cutoff · {cutoff}</span>}
            {learnMoreHref && (
              <a href={learnMoreHref} className={cn("ml-auto", linkClass)}>
                {learnMoreLabel}
              </a>
            )}
          </div>
        )}
      </Md3Card>
    );
  },
);
Md3Disclaimer.displayName = "Md3Disclaimer";

import * as React from "react";
import { cn } from "@nucleux/utils";

export interface CapabilitySection {
  /** Column title, e.g. `"Examples"`, `"Capabilities"`, `"Limits"`. */
  title: React.ReactNode;
  /** Leading icon for the column. */
  icon?: React.ReactNode;
  /** The lines listed in the column. */
  items: React.ReactNode[];
}

export interface CapabilityOverviewProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The columns to show — typically Examples / Capabilities / Limits. */
  sections: CapabilitySection[];
  /** Heading above the columns. */
  heading?: React.ReactNode;
  /** Footnote, e.g. a knowledge-cutoff note. */
  footnote?: React.ReactNode;
}

/**
 * A first-run card that sets expectations for an agent — what it can do, and
 * where it falls short — as Examples / Capabilities / Limits columns.
 * Source: Figma "Onboarding / Generic Assistant Overview".
 */
export const CapabilityOverview = React.forwardRef<HTMLDivElement, CapabilityOverviewProps>(
  ({ sections, heading, footnote, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col gap-5 rounded-xl border border-border bg-background p-6", className)}
      {...props}
    >
      {heading && <h3 className="text-center text-lg font-semibold text-foreground">{heading}</h3>}
      <div className="grid gap-4 sm:grid-cols-3">
        {sections.map((section, i) => (
          <section key={i} className="flex flex-col gap-3">
            <div className="flex flex-col items-center gap-1.5 text-center">
              {section.icon && (
                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-4">
                  {section.icon}
                </span>
              )}
              <span className="text-sm font-medium text-foreground">{section.title}</span>
            </div>
            <ul className="flex flex-col gap-2">
              {section.items.map((item, j) => (
                <li
                  key={j}
                  className="rounded-lg bg-muted/50 px-3 py-2 text-center text-xs leading-relaxed text-muted-foreground"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      {footnote && <p className="text-center text-xs text-muted-foreground">{footnote}</p>}
    </div>
  ),
);
CapabilityOverview.displayName = "CapabilityOverview";

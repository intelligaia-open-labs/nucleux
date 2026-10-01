import * as React from "react";
import { cn } from "@nucleux/utils";
import { Brain, RotateCw, Plus } from "lucide-react";

export interface MemoryGroup {
  /** Section title, e.g. `"About you"`. */
  title: React.ReactNode;
  /** Remembered facts in this section. */
  items: React.ReactNode[];
}

export interface MemorySummaryProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The grouped facts the assistant remembers. */
  groups: MemoryGroup[];
  /** Heading. Defaults to `"What I remember"`. */
  heading?: React.ReactNode;
  /** Freshness line, e.g. `"Updated 1 minute ago"`. */
  updatedAt?: React.ReactNode;
  /** Called when the refresh control is used. Hidden if omitted. */
  onRefresh?: () => void;
  /** Called with the entered text to add/update a memory. Renders a composer when set. */
  onAdd?: (text: string) => void;
  addPlaceholder?: string;
}

/**
 * The user-facing view of an agent's long-term memory — grouped facts it holds
 * about the user, with freshness, refresh, and an add/update composer.
 * Source: Figma "Memory and Continuity / Memory summary".
 */
export const MemorySummary = React.forwardRef<HTMLDivElement, MemorySummaryProps>(
  (
    {
      groups,
      heading = "What I remember",
      updatedAt,
      onRefresh,
      onAdd,
      addPlaceholder = "Add or update a memory…",
      className,
      ...props
    },
    ref,
  ) => {
    const [draft, setDraft] = React.useState("");
    const submit = () => {
      const text = draft.trim();
      if (!text) return;
      onAdd?.(text);
      setDraft("");
    };
    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-4 rounded-xl border border-border bg-background p-5", className)}
        {...props}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-brand-muted text-brand [&_svg]:size-4">
              <Brain aria-hidden="true" />
            </span>
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-foreground">{heading}</h3>
              {updatedAt && <span className="text-xs text-muted-foreground">{updatedAt}</span>}
            </div>
          </div>
          {onRefresh && (
            <button
              type="button"
              aria-label="Refresh memory"
              onClick={onRefresh}
              className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4"
            >
              <RotateCw aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {groups.map((group, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{group.title}</p>
              <ul className="flex flex-col gap-1">
                {group.items.map((item, j) => (
                  <li key={j} className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-foreground">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {onAdd && (
          <div className="flex items-center gap-2 border-t border-border pt-3">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder={addPlaceholder}
              aria-label={addPlaceholder}
              className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="button"
              aria-label="Add memory"
              onClick={submit}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-info text-info-foreground transition-colors hover:bg-info/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4"
            >
              <Plus aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    );
  },
);
MemorySummary.displayName = "MemorySummary";

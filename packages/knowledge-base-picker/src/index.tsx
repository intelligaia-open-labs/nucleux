import * as React from "react";
import { cn } from "@nucleux/utils";
import { FileText, Check } from "lucide-react";

export interface KnowledgeSource {
  /** Stable id. */
  id: string;
  /** Source name, e.g. a filename. */
  name: React.ReactNode;
  /** Metadata line, e.g. `"PDF · 12 pages"`. */
  meta?: React.ReactNode;
  /** Leading icon. Defaults to a document glyph. */
  icon?: React.ReactNode;
}

export interface KnowledgeBasePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** The available knowledge sources. */
  sources: KnowledgeSource[];
  /** Selected source ids (controlled). */
  value?: string[];
  /** Initial selection (uncontrolled). */
  defaultValue?: string[];
  /** Called when the selection changes. */
  onValueChange?: (ids: string[]) => void;
  /** Heading above the list. Defaults to `"Knowledge sources"`. */
  heading?: React.ReactNode;
}

/**
 * A selectable list of context files/knowledge sources an agent may draw on —
 * curates the retrieval context for a turn.
 * Source: Figma "Context Expansion / Knowledge Bases".
 */
export const KnowledgeBasePicker = React.forwardRef<HTMLDivElement, KnowledgeBasePickerProps>(
  ({ sources, value, defaultValue = [], onValueChange, heading = "Knowledge sources", className, ...props }, ref) => {
    const [internal, setInternal] = React.useState<string[]>(defaultValue);
    const selected = value !== undefined ? value : internal;
    const toggle = (id: string) => {
      const next = selected.includes(id) ? selected.filter((v) => v !== id) : [...selected, id];
      if (value === undefined) setInternal(next);
      onValueChange?.(next);
    };
    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-2 rounded-xl border border-border bg-background p-3", className)}
        {...props}
      >
        {heading && (
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{heading}</p>
            {selected.length > 0 && (
              <span className="text-xs text-muted-foreground">{selected.length} selected</span>
            )}
          </div>
        )}
        <ul className="flex flex-col gap-1">
          {sources.map((source) => {
            const active = selected.includes(source.id);
            return (
              <li key={source.id}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={active}
                  onClick={() => toggle(source.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active ? "border-brand bg-brand-muted/40" : "border-transparent hover:bg-accent",
                  )}
                >
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground [&_svg]:size-4">
                    {source.icon ?? <FileText aria-hidden="true" />}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">{source.name}</span>
                    {source.meta && <span className="truncate text-xs text-muted-foreground">{source.meta}</span>}
                  </span>
                  <span
                    className={cn(
                      "inline-flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors [&_svg]:size-3.5",
                      active ? "border-brand bg-brand text-brand-foreground" : "border-border",
                    )}
                  >
                    {active && <Check aria-hidden="true" />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  },
);
KnowledgeBasePicker.displayName = "KnowledgeBasePicker";

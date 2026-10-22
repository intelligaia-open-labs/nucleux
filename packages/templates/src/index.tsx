import * as React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@nucleux/utils";
import { Button } from "@nucleux/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@nucleux/tabs";

/** A fill-in-the-blank slot: an id, the placeholder shown while empty, and optional type-ahead options. */
export interface PromptSlot {
  /** Slot id — the key in `values`. */
  slot: string;
  /** Shown while the slot is empty, and used in the prompt if it stays empty. */
  placeholder: string;
  /** Accessible name of the slot's field. Defaults to `placeholder`. */
  label?: string;
  /** Type-ahead options offered while typing (the field stays free text). */
  options?: string[];
  /** Must be filled before the template can be used. */
  required?: boolean;
}

/** A literal string, or a fill-in-the-blank slot. */
export type PromptSegment = string | PromptSlot;

export interface TemplatesProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
  /** The template as an ordered mix of literal text and named slots. */
  segments: PromptSegment[];
  /** Slot values (controlled), keyed by slot id. */
  values?: Record<string, string>;
  /** Initial slot values (uncontrolled). */
  defaultValues?: Record<string, string>;
  /** Called when any slot changes. */
  onValuesChange?: (values: Record<string, string>) => void;
  /** Called with the interpolated prompt (and raw values) on submit. Nothing runs on its own. */
  onComplete?: (prompt: string, values: Record<string, string>) => void;
  /** Submit button label. Defaults to `"Use this prompt"`. */
  submitLabel?: React.ReactNode;
  /**
   * Show the footer with the blanks count and the submit button. Defaults to
   * true; set false when the sentence sits inside a composer that sends it
   * (as on nucleux.in's preview); `onValuesChange` then carries the values.
   */
  showSubmit?: boolean;
}

/**
 * The fill-in-the-blank template: a sentence with highlighted slots the user
 * tabs through, so a good prompt reads as a sentence even before it is
 * filled. Slots are free-text fields with optional type-ahead `options`;
 * `required` slots are counted ("1 blank left") and must be filled before the
 * one-click "Use this prompt" fires `onComplete` with the interpolated text.
 * For a list of fully written prompts use {@link TemplatesList}; for a library
 * grouped by domain use {@link TemplatesBrowser}.
 */
export const Templates = React.forwardRef<HTMLFormElement, TemplatesProps>(
  (
    {
      segments,
      values,
      defaultValues = {},
      onValuesChange,
      onComplete,
      submitLabel = "Use this prompt",
      showSubmit = true,
      className,
      ...props
    },
    ref,
  ) => {
    const [internal, setInternal] = React.useState<Record<string, string>>(defaultValues);
    const current = values ?? internal;
    const baseId = React.useId();

    const setSlot = (slot: string, val: string) => {
      const next = { ...current, [slot]: val };
      if (values === undefined) setInternal(next);
      onValuesChange?.(next);
    };

    const interpolate = () =>
      segments
        .map((s) => (typeof s === "string" ? s : current[s.slot] || s.placeholder))
        .join("");

    const required = segments.filter((s): s is PromptSlot => typeof s !== "string" && !!s.required);
    const missing = required.filter((s) => !(current[s.slot] ?? "").trim()).length;
    const statusId = `${baseId}-status`;

    return (
      <form
        ref={ref}
        onSubmit={(e) => {
          e.preventDefault();
          if (missing > 0) return;
          onComplete?.(interpolate(), current);
        }}
        className={cn("flex flex-col gap-4 rounded-xl border border-border bg-background p-4 shadow-sm", className)}
        {...props}
      >
        <p className="text-sm leading-8 text-foreground">
          {segments.map((segment, i) => {
            if (typeof segment === "string") return <React.Fragment key={i}>{segment}</React.Fragment>;
            const val = current[segment.slot] ?? "";
            const listId = segment.options?.length ? `${baseId}-${segment.slot}-options` : undefined;
            return (
              <React.Fragment key={i}>
                <input
                  type="text"
                  value={val}
                  onChange={(e) => setSlot(segment.slot, e.target.value)}
                  placeholder={segment.placeholder}
                  aria-label={segment.label ?? segment.placeholder}
                  aria-required={segment.required || undefined}
                  list={listId}
                  autoComplete="off"
                  size={Math.max((val || segment.placeholder).length, 4)}
                  // Fit the field to its text (`size` alone under-measures once padding is added).
                  style={{ width: `calc(${Math.max((val || segment.placeholder).length, 4) * 0.8}ch + ${listId ? 2.25 : 1.125}rem)` }}
                  className={cn(
                    "mx-0.5 inline-block rounded-sm border border-dashed [&::-webkit-calendar-picker-indicator]:hidden border-brand bg-brand/5 px-2 py-0.5 text-center text-xs font-medium leading-5 text-brand placeholder:text-brand focus:border-solid focus:outline-none focus:ring-1 focus:ring-brand",
                    val && "border-solid bg-brand-muted",
                  )}
                />
                {listId && (
                  <datalist id={listId}>
                    {segment.options!.map((o) => (
                      <option key={o} value={o} />
                    ))}
                  </datalist>
                )}
              </React.Fragment>
            );
          })}
        </p>
        {showSubmit && (
          <div className="flex items-center justify-end gap-3">
            {required.length > 0 && (
              <span id={statusId} aria-live="polite" className="mr-auto text-sm text-muted-foreground">
                {missing === 0 ? "Ready to use" : `${missing} ${missing === 1 ? "blank" : "blanks"} left`}
              </span>
            )}
            <Button
              type="submit"
              variant="cta"
              disabled={missing > 0}
              aria-describedby={required.length > 0 ? statusId : undefined}
            >
              {submitLabel}
            </Button>
          </div>
        )}
      </form>
    );
  },
);
Templates.displayName = "Templates";

/** A fully written template in a list or browser. */
export interface TemplatesListItem {
  /** Stable id. Defaults to `title`. */
  id?: string;
  /** What the user sees ("Summarise yesterday's standup in 3 bullets"). */
  title: string;
  /** The prompt handed to `onSelect`. Defaults to `title`. */
  prompt?: string;
  /** One supporting line. */
  description?: string;
  /** Leading icon; replaces the default arrow. */
  icon?: React.ReactNode;
  /** A quiet line on what it takes ("3 inputs · Meeting knowledge, Google Drive"). */
  meta?: string;
}

/** "cards" (default): each template its own bordered row. "grouped": the rows share one container, like a list. */
export type TemplatesListVariant = "cards" | "grouped";

export interface TemplatesListProps extends Omit<React.HTMLAttributes<HTMLUListElement>, "onSelect"> {
  /** The templates, as strings or {@link TemplatesListItem}s. */
  items: Array<string | TemplatesListItem>;
  /** Called with the prompt and the item when one is picked. Place it in the composer — never send it. */
  onSelect?: (prompt: string, item: TemplatesListItem) => void;
  /** "cards" (default) or "grouped" (one container, rows divided by space; nucleux.in's Material 3 preview). */
  variant?: TemplatesListVariant;
}

const toListItem = (item: string | TemplatesListItem): TemplatesListItem =>
  typeof item === "string" ? { title: item } : item;

/**
 * The prefilled-list template surface: fully written prompts the user runs
 * with one tap, each a keyboard-reachable button in a labelled list. The
 * lowest-friction template surface; pass `aria-label` to name the list.
 */
export const TemplatesList = React.forwardRef<HTMLUListElement, TemplatesListProps>(
  ({ items, onSelect, variant = "cards", className, ...props }, ref) => {
    const grouped = variant === "grouped";
    return (
      <ul
        ref={ref}
        role="list"
        className={cn(
          "m-0 flex list-none flex-col p-0",
          grouped ? "overflow-hidden rounded-xl border border-border bg-background py-1" : "gap-1",
          className,
        )}
        {...props}
      >
        {items.map(toListItem).map((item) => (
          <li key={item.id ?? item.title}>
            <button
              type="button"
              onClick={() => onSelect?.(item.prompt ?? item.title, item)}
              className={cn(
                "flex w-full gap-2 text-left text-sm text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                grouped
                  ? "items-center gap-4 px-4 py-3 focus-visible:ring-inset"
                  : "items-start rounded-md border border-border bg-muted/40 px-3 py-2",
              )}
            >
              {item.icon ? (
                <span aria-hidden="true" className="shrink-0 text-muted-foreground [&_svg]:size-5">
                  {item.icon}
                </span>
              ) : (
                <ArrowRight aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              )}
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className={cn(grouped && "font-medium")}>{item.title}</span>
                {item.description && <span className="text-xs text-muted-foreground">{item.description}</span>}
                {item.meta && <span className="text-xs text-muted-foreground">{item.meta}</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>
    );
  },
);
TemplatesList.displayName = "TemplatesList";

/** A named group of templates in a {@link TemplatesBrowser}. */
export interface TemplatesCategory {
  /** Category id. */
  id: string;
  /** Tab label ("Sales"). */
  label: string;
  /** The templates in this category. */
  templates: Array<string | TemplatesListItem>;
}

export interface TemplatesBrowserProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect" | "defaultValue"> {
  /** The categories, in display order. */
  categories: TemplatesCategory[];
  /** Controlled active category id. */
  category?: string;
  /** Initial category when uncontrolled. Defaults to the first. */
  defaultCategory?: string;
  /** Called when the active category changes. */
  onCategoryChange?: (id: string) => void;
  /** Called with the prompt, the item and the category id when a template is picked. */
  onSelect?: (prompt: string, item: TemplatesListItem, category: string) => void;
}

/**
 * The categorised template browser: a library of templates grouped by domain,
 * with a vertical tab per category (arrow keys move between them) and the
 * category's templates as a {@link TemplatesList}. Scales to many prompt
 * families.
 */
export const TemplatesBrowser = React.forwardRef<HTMLDivElement, TemplatesBrowserProps>(
  ({ categories, category, defaultCategory, onCategoryChange, onSelect, className, ...props }, ref) => (
    <Tabs
      ref={ref}
      orientation="vertical"
      value={category}
      defaultValue={defaultCategory ?? categories[0]?.id ?? ""}
      onValueChange={onCategoryChange}
      className={cn("gap-3", className)}
      {...props}
    >
      <TabsList aria-label="Template categories" className="h-fit shrink-0 bg-transparent p-0">
        {categories.map((c) => (
          <TabsTrigger key={c.id} value={c.id} className="justify-start aria-selected:bg-muted aria-selected:shadow-none">
            {c.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {categories.map((c) => (
        <TabsContent key={c.id} value={c.id} className="min-w-0 flex-1">
          <TemplatesList
            aria-label={`${c.label} templates`}
            items={c.templates}
            onSelect={(prompt, item) => onSelect?.(prompt, item, c.id)}
          />
        </TabsContent>
      ))}
    </Tabs>
  ),
);
TemplatesBrowser.displayName = "TemplatesBrowser";

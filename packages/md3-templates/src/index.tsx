import * as React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@nucleux/utils";
import type {
  PromptSegment,
  PromptSlot,
  TemplatesBrowserProps,
  TemplatesCategory,
  TemplatesListItem,
  TemplatesListProps,
  TemplatesProps,
} from "@nucleux/templates";
import { Md3Button } from "@nucleux/md3-button";

/** Props of {@link Md3Templates} — identical to `TemplatesProps`. */
export type Md3TemplatesProps = TemplatesProps;
/** Props of {@link Md3TemplatesList} — identical to `TemplatesListProps`. */
export type Md3TemplatesListProps = TemplatesListProps;
/** Props of {@link Md3TemplatesBrowser} — identical to `TemplatesBrowserProps`. */
export type Md3TemplatesBrowserProps = TemplatesBrowserProps;
export type { PromptSegment, PromptSlot, TemplatesCategory, TemplatesListItem };

const stateLayer =
  "before:absolute before:inset-0 before:bg-current before:opacity-0 before:transition-opacity before:content-[''] hover:before:opacity-[0.08] focus-visible:before:opacity-[0.10] active:before:opacity-[0.10] motion-reduce:before:transition-none";
const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-md-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-md-surface";

/**
 * The Material 3 fill-in-the-blank template — the same API and behaviour as
 * `Templates`. An outlined M3 card whose sentence sits on a surface-container
 * ground; each slot is an inline free-text field drawn as a dashed, small-corner
 * gap while empty and a solid secondary-container chip once filled (the
 * difference is shape and weight, not hue). Required slots are counted
 * ("1 blank left") and hold the filled "Use this prompt" button until they are
 * filled; nothing runs on its own.
 */
export const Md3Templates = React.forwardRef<HTMLFormElement, Md3TemplatesProps>(
  (
    { segments, values, defaultValues = {}, onValuesChange, onComplete, submitLabel = "Use this prompt", className, ...props },
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
      segments.map((s) => (typeof s === "string" ? s : current[s.slot] || s.placeholder)).join("");

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
        className={cn(
          "flex flex-col gap-4 rounded-md-lg border border-md-outline-variant bg-md-surface p-5 text-md-on-surface",
          className,
        )}
        {...props}
      >
        <p className="rounded-md-md bg-md-surface-container px-4 py-3.5 text-base leading-[2.1] tracking-[0.5px] text-md-on-surface">
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
                  className={cn(
                    "mx-0.5 inline-block rounded-md-sm border px-2.5 py-0.5 text-center leading-6 outline-none caret-md-primary",
                    "transition-[background-color,border-color] duration-200 motion-reduce:transition-none",
                    "focus:border-solid focus:border-md-primary focus:ring-1 focus:ring-md-primary",
                    val
                      ? "border-solid border-transparent bg-md-secondary-container font-medium text-md-on-secondary-container"
                      : "border-dashed border-md-outline bg-transparent text-md-on-surface-variant placeholder:text-md-on-surface-variant hover:border-md-primary",
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
        <div className="flex items-center justify-end gap-3">
          {required.length > 0 && (
            <span id={statusId} aria-live="polite" className="mr-auto text-xs tracking-[0.4px] text-md-on-surface-variant">
              {missing === 0 ? "Ready to use" : `${missing} ${missing === 1 ? "blank" : "blanks"} left`}
            </span>
          )}
          <Md3Button type="submit" disabled={missing > 0} aria-describedby={required.length > 0 ? statusId : undefined}>
            {submitLabel}
          </Md3Button>
        </div>
      </form>
    );
  },
);
Md3Templates.displayName = "Md3Templates";

// Copied from @nucleux/templates (internal there).
const toListItem = (item: string | TemplatesListItem): TemplatesListItem =>
  typeof item === "string" ? { title: item } : item;

/**
 * The Material 3 prefilled template list — the same API as `TemplatesList`.
 * Fully written prompts as outlined, actionable M3 rows (medium corner,
 * on-surface state layer) with a supporting line and a trailing arrow, each
 * a keyboard-reachable button in a labelled list; pass `aria-label`.
 */
export const Md3TemplatesList = React.forwardRef<HTMLUListElement, Md3TemplatesListProps>(
  ({ items, onSelect, className, ...props }, ref) => (
    <ul ref={ref} role="list" className={cn("m-0 flex list-none flex-col gap-2 p-0", className)} {...props}>
      {items.map(toListItem).map((item) => (
        <li key={item.id ?? item.title}>
          <button
            type="button"
            onClick={() => onSelect?.(item.prompt ?? item.title, item)}
            className={cn(
              "relative flex w-full items-center gap-4 overflow-hidden rounded-md-md border border-md-outline-variant bg-md-surface px-4 py-3 text-left text-md-on-surface",
              stateLayer,
              focusRing,
            )}
          >
            <span className="relative flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-sm font-medium leading-5 tracking-[0.1px]">{item.title}</span>
              {item.description && (
                <span className="text-xs leading-4 tracking-[0.4px] text-md-on-surface-variant">{item.description}</span>
              )}
            </span>
            <ArrowRight aria-hidden="true" className="relative size-[18px] shrink-0 text-md-on-surface-variant" />
          </button>
        </li>
      ))}
    </ul>
  ),
);
Md3TemplatesList.displayName = "Md3TemplatesList";

/**
 * The Material 3 categorised template browser — the same API and behaviour as
 * `TemplatesBrowser`. Categories are a vertical tab list styled like M3
 * navigation-drawer items (full-corner, the active one in the secondary
 * container); Up/Down/Home/End move between them, and the active category's
 * templates show as an {@link Md3TemplatesList}.
 */
export const Md3TemplatesBrowser = React.forwardRef<HTMLDivElement, Md3TemplatesBrowserProps>(
  ({ categories, category, defaultCategory, onCategoryChange, onSelect, className, ...props }, ref) => {
    const baseId = React.useId();
    const [internal, setInternal] = React.useState(defaultCategory ?? categories[0]?.id ?? "");
    const active = category !== undefined ? category : internal;
    const setActive = (id: string) => {
      if (category === undefined) setInternal(id);
      onCategoryChange?.(id);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
      const tabs = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'));
      const idx = tabs.indexOf(document.activeElement as HTMLButtonElement);
      if (idx === -1) return;
      e.preventDefault();
      let next = idx;
      if (e.key === "ArrowDown") next = (idx + 1) % tabs.length;
      else if (e.key === "ArrowUp") next = (idx - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = tabs.length - 1;
      tabs[next]?.focus();
      tabs[next]?.click();
    };

    return (
      <div ref={ref} data-orientation="vertical" className={cn("flex gap-4 text-md-on-surface", className)} {...props}>
        <div
          role="tablist"
          aria-orientation="vertical"
          aria-label="Template categories"
          onKeyDown={onKeyDown}
          className="flex h-fit shrink-0 flex-col gap-1"
        >
          {categories.map((c) => {
            const selected = c.id === active;
            return (
              <button
                key={c.id}
                type="button"
                role="tab"
                id={`${baseId}-tab-${c.id}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel-${c.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(c.id)}
                className={cn(
                  "relative inline-flex h-10 items-center overflow-hidden rounded-full px-4 text-left text-sm font-medium tracking-[0.1px]",
                  stateLayer,
                  "outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-md-secondary",
                  selected ? "bg-md-secondary-container text-md-on-secondary-container" : "text-md-on-surface-variant",
                )}
              >
                <span className="relative">{c.label}</span>
              </button>
            );
          })}
        </div>
        {categories.map((c) =>
          c.id === active ? (
            <div
              key={c.id}
              role="tabpanel"
              id={`${baseId}-panel-${c.id}`}
              aria-labelledby={`${baseId}-tab-${c.id}`}
              tabIndex={0}
              className="min-w-0 flex-1 rounded-md-md outline-none focus-visible:ring-2 focus-visible:ring-md-secondary"
            >
              <Md3TemplatesList
                aria-label={`${c.label} templates`}
                items={c.templates}
                onSelect={(prompt, item) => onSelect?.(prompt, item, c.id)}
              />
            </div>
          ) : null,
        )}
      </div>
    );
  },
);
Md3TemplatesBrowser.displayName = "Md3TemplatesBrowser";

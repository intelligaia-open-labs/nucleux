import * as React from "react";
import { cn } from "@nucleux/utils";
import { Button } from "@nucleux/button";
import { Spinner } from "@nucleux/spinner";
import { AlertTriangle, Check, CircleAlert, FileText, Info, Plus, RotateCw } from "lucide-react";

/** Picker layout: a vertical list of rows, or a wrap of chips with document counts. */
export type KnowledgeBaseVariant = "list" | "chips";

/** Whether a source is usable yet, and whether it is still current. */
export type KnowledgeSourceStatus = "ready" | "processing" | "stale" | "error";

/** How well the knowledge base covers the question. */
export type KnowledgeBaseCoverageLevel = "high" | "partial" | "low";

export interface KnowledgeSource {
  /** Stable id. */
  id: string;
  /** Source name, e.g. a filename. */
  name: React.ReactNode;
  /** Metadata line, e.g. `"PDF · 12 pages"`. */
  meta?: React.ReactNode;
  /** Leading icon. Defaults to a document glyph. */
  icon?: React.ReactNode;
  /** Readiness, shown as a word on the row. Omit for plain sources. */
  status?: KnowledgeSourceStatus;
  /** Number of documents in the base, shown on chips: `"Product docs · 412"`. Chips show `meta` instead when there is no count (`"Product docs · 412 pages"`). */
  count?: number;
}

export interface KnowledgeBaseProps
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
  /** Layout. Defaults to `"list"`; `"chips"` is the compact "Grounded in" picker. */
  variant?: KnowledgeBaseVariant;
  /** Adds an "Add a base" control. */
  onAdd?: () => void;
  /** Label for the add control. Defaults to `"Add a base"`. */
  addLabel?: React.ReactNode;
  /** Recovery for a stale or failed source; renders Refresh / Retry on that row. */
  onRefresh?: (id: string) => void;
}

const statusWord: Record<KnowledgeSourceStatus, string> = {
  ready: "Ready",
  processing: "Processing",
  stale: "Needs refresh",
  error: "Couldn't process",
};

const statusTone: Record<KnowledgeSourceStatus, string> = {
  ready: "text-success",
  processing: "text-muted-foreground",
  stale: "text-warning",
  error: "text-destructive",
};

const nameText = (n: React.ReactNode, fallback: string) => (typeof n === "string" ? n : fallback);

/**
 * Lets people choose which knowledge bases the agent grounds in for this
 * session — a list of checkable rows (default) or a compact wrap of chips with
 * document counts (`variant="chips"`). Each source can carry its readiness as a
 * word (Ready, Processing, Needs refresh, Couldn't process) with the recovery
 * on the row that failed. Pair it with KnowledgeBaseSources (what an answer
 * actually read) and KnowledgeBaseCoverage (how well the base covers it).
 * Source: Figma "Context Expansion / Knowledge Bases".
 */
export const KnowledgeBase = React.forwardRef<HTMLDivElement, KnowledgeBaseProps>(
  (
    {
      sources,
      value,
      defaultValue = [],
      onValueChange,
      heading = "Knowledge sources",
      variant = "list",
      onAdd,
      addLabel = "Add a base",
      onRefresh,
      className,
      ...props
    },
    ref,
  ) => {
    const [internal, setInternal] = React.useState<string[]>(defaultValue);
    const selected = value !== undefined ? value : internal;
    const headingId = React.useId();
    const toggle = (id: string) => {
      const next = selected.includes(id) ? selected.filter((v) => v !== id) : [...selected, id];
      if (value === undefined) setInternal(next);
      onValueChange?.(next);
    };

    if (variant === "chips") {
      return (
        <div
          ref={ref}
          role="group"
          aria-labelledby={heading ? headingId : undefined}
          aria-label={heading ? undefined : "Knowledge sources"}
          className={cn("flex flex-col gap-2.5 rounded-xl border border-border bg-background p-3.5", className)}
          {...props}
        >
          {heading && (
            <p id={headingId} className="text-[10px] font-semibold uppercase leading-[1.55] tracking-[0.1em] text-faint">
              {heading}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {sources.map((source) => {
              const active = selected.includes(source.id);
              return (
                <button
                  key={source.id}
                  type="button"
                  role="checkbox"
                  aria-checked={active}
                  onClick={() => toggle(source.id)}
                  className={cn(
                    "inline-block rounded-lg border px-[11px] py-[5px] text-[11px] font-semibold leading-[1.55] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "border-brand bg-[rgb(99_102_241/0.08)] text-brand"
                      : "border-border font-medium text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {source.name}
                  {source.count != null ? (
                    <> · {source.count.toLocaleString()}</>
                  ) : (
                    source.meta != null && <> · {source.meta}</>
                  )}
                  {source.status && source.status !== "ready" && (
                    <span className={cn("font-normal", statusTone[source.status])}> · {statusWord[source.status]}</span>
                  )}
                </button>
              );
            })}
            {onAdd && (
              <button
                type="button"
                onClick={onAdd}
                className="inline-block rounded-lg border border-dashed border-border bg-[hsl(var(--nx-ink-25))] px-[11px] py-[5px] text-[11px] leading-[1.55] text-faint transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span aria-hidden="true">+ </span>
                {addLabel}
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-2 rounded-xl border border-border bg-background p-3", className)}
        {...props}
      >
        {heading && (
          <div className="flex items-center justify-between px-1">
            <p id={headingId} className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {heading}
            </p>
            {selected.length > 0 && (
              <span className="text-xs text-muted-foreground">{selected.length} selected</span>
            )}
          </div>
        )}
        <ul
          aria-labelledby={heading ? headingId : undefined}
          aria-label={heading ? undefined : "Knowledge sources"}
          className="flex flex-col gap-1"
        >
          {sources.map((source) => {
            const active = selected.includes(source.id);
            const recover =
              onRefresh && (source.status === "stale" || source.status === "error") ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRefresh(source.id)}
                  aria-label={`${source.status === "error" ? "Retry" : "Refresh"} ${nameText(source.name, source.id)}`}
                  leftIcon={<RotateCw aria-hidden="true" className="size-3.5" />}
                  className="h-7 shrink-0 px-2 text-xs"
                >
                  {source.status === "error" ? "Retry" : "Refresh"}
                </Button>
              ) : null;
            return (
              <li key={source.id} className="flex items-center gap-1" data-status={source.status}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={active}
                  onClick={() => toggle(source.id)}
                  className={cn(
                    "flex w-full min-w-0 flex-1 items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active ? "border-brand bg-brand-muted/40" : "border-transparent hover:bg-accent",
                  )}
                >
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground [&_svg]:size-4">
                    {source.icon ?? <FileText aria-hidden="true" />}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">{source.name}</span>
                    {(source.meta || source.status || source.count != null) && (
                      <span className="truncate text-xs text-muted-foreground">
                        {source.status && (
                          <span className={cn("font-medium", statusTone[source.status])}>
                            {statusWord[source.status]}
                          </span>
                        )}
                        {source.status && (source.meta || source.count != null) && " · "}
                        {source.count != null && `${source.count.toLocaleString()} docs`}
                        {source.count != null && source.meta && " · "}
                        {source.meta}
                      </span>
                    )}
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
                {recover}
              </li>
            );
          })}
        </ul>
        {onAdd && (
          <Button variant="ghost" size="sm" onClick={onAdd} leftIcon={<Plus aria-hidden="true" className="size-4" />} className="self-start">
            {addLabel}
          </Button>
        )}
      </div>
    );
  },
);
KnowledgeBase.displayName = "KnowledgeBase";

/** One document an answer drew on. */
export interface KnowledgeBaseSourceRef {
  /** Stable id. */
  id: string;
  /** Document title, e.g. `"Renewal Playbook v3"`. */
  name: React.ReactNode;
  /** Section the answer came from, e.g. `"§4.1"`. */
  section?: React.ReactNode;
  /** Link to open the document at that section. */
  href?: string;
}

export interface KnowledgeBaseSourcesProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The documents the answer read. */
  sources: KnowledgeBaseSourceRef[];
  /** The base they came from, for the heading: "Used 3 sources from Sales playbook". */
  baseName?: React.ReactNode;
  /** Heading override. Defaults to `"N sources"` (or the base sentence). */
  heading?: React.ReactNode;
  /** The agent is reading right now: shows "Reading…" and announces it. */
  reading?: boolean;
}

/**
 * The source list shown under an answer: exactly which knowledge-base
 * documents (and sections) the agent read, so the answer can be checked.
 * While `reading` it says so — politely announced — and swaps to provenance
 * when the answer finishes.
 */
export const KnowledgeBaseSources = React.forwardRef<HTMLDivElement, KnowledgeBaseSourcesProps>(
  ({ sources, baseName, heading, reading = false, className, ...props }, ref) => {
    const headingId = React.useId();
    const n = sources.length;
    const count = `${n} ${n === 1 ? "source" : "sources"}`;
    const title =
      heading ??
      (reading ? (
        <>Reading{baseName ? <> {baseName}</> : null}…</>
      ) : baseName ? (
        <>
          Used {count} from {baseName}
        </>
      ) : (
        count
      ));
    return (
      <div ref={ref} className={cn("flex flex-col gap-1.5", className)} {...props}>
        <p
          id={headingId}
          role="status"
          aria-live="polite"
          className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase leading-[1.55] tracking-[0.06em] text-faint"
        >
          {reading && <Spinner aria-hidden="true" role={undefined} className="size-3 motion-reduce:animate-none" />}
          {title}
        </p>
        {n > 0 && (
          <ul aria-labelledby={headingId} className="flex flex-col gap-1">
            {sources.map((s) => {
              const body = (
                <>
                  <span aria-hidden="true" className="shrink-0">📄</span>
                  <span className="min-w-0 truncate">
                    {s.name}
                    {s.section && <> · {s.section}</>}
                  </span>
                </>
              );
              const cls =
                "flex items-center gap-1.5 rounded-md bg-[hsl(var(--nx-ink-25))] px-2.5 py-1.5 text-[11.5px] leading-[1.55] text-foreground";
              return (
                <li key={s.id}>
                  {s.href ? (
                    <a
                      href={s.href}
                      className={cn(cls, "transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring")}
                    >
                      {body}
                    </a>
                  ) : (
                    <span className={cls}>{body}</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  },
);
KnowledgeBaseSources.displayName = "KnowledgeBaseSources";

export interface KnowledgeBaseCoverageProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** How well the base covers the question. */
  level: KnowledgeBaseCoverageLevel;
  /** Number of matching passages, e.g. `14`. */
  matches?: number;
  /** Label override. Defaults to "Well-covered", "Partly covered" or "Thin coverage". */
  label?: React.ReactNode;
}

const coverage: Record<KnowledgeBaseCoverageLevel, { word: string; icon: React.ReactNode; cls: string }> = {
  high: { word: "Well-covered", icon: <span aria-hidden="true" className="text-[9px] leading-none">✓</span>, cls: "bg-success text-success-foreground" },
  partial: { word: "Partly covered", icon: <AlertTriangle aria-hidden="true" className="size-2.5" />, cls: "bg-warning text-warning-foreground" },
  low: { word: "Thin coverage", icon: <CircleAlert aria-hidden="true" className="size-2.5" />, cls: "bg-destructive text-destructive-foreground" },
};

/**
 * A small badge saying how well the knowledge base covers the question —
 * "Well-covered · 14 matches", or a warning when context is thin. The word
 * carries the meaning; colour only reinforces it.
 */
export const KnowledgeBaseCoverage = React.forwardRef<HTMLSpanElement, KnowledgeBaseCoverageProps>(
  ({ level, matches, label, className, ...props }, ref) => {
    const c = coverage[level];
    return (
      <span
        ref={ref}
        data-level={level}
        className={cn(
          "inline-flex items-center gap-[7px] rounded-full border border-border bg-[hsl(var(--nx-ink-25))] px-3 py-1.5 text-[11.5px] font-medium leading-[1.55] text-foreground",
          className,
        )}
        {...props}
      >
        <span className={cn("inline-flex size-[18px] shrink-0 items-center justify-center rounded-full", c.cls)}>{c.icon}</span>
        <span>
          {label ?? c.word}
          {matches != null && <> · {matches} {matches === 1 ? "match" : "matches"}</>}
        </span>
      </span>
    );
  },
);
KnowledgeBaseCoverage.displayName = "KnowledgeBaseCoverage";

/** Whether a knowledge base is in play in this project. */
export type KnowledgeBaseCardStatus = "active" | "available" | "inactive";

export interface KnowledgeBaseCardProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** The base's name, e.g. `"Product Research"`. */
  name: React.ReactNode;
  /** Short mark on the tile. Defaults to the name's initials ("PR"). */
  monogram?: React.ReactNode;
  /** How many sources it holds: "12 sources". */
  sourceCount?: number;
  /** Active (in play here), Available (healthy, not used here) or Inactive (switched off here). Defaults to `"active"`. */
  status?: KnowledgeBaseCardStatus;
  /** Where it applies, e.g. `"Active in this project"`. Say only what is true. */
  scope?: React.ReactNode;
  /** Open the source list. Renders "Manage sources". */
  onManage?: () => void;
  /** Add sources. Renders "Add sources". */
  onAdd?: () => void;
  /** Switch the base on or off here (never deletes it). Renders "Stop using here" / "Use in this project". */
  onActiveChange?: (active: boolean) => void;
  /** Label overrides. */
  manageLabel?: React.ReactNode;
  addLabel?: React.ReactNode;
  deactivateLabel?: React.ReactNode;
  activateLabel?: React.ReactNode;
}

const baseStatusWord: Record<KnowledgeBaseCardStatus, string> = {
  active: "Active",
  available: "Available",
  inactive: "Inactive",
};

/** "Product Research" → "PR". */
export const knowledgeBaseInitials = (name: React.ReactNode) =>
  typeof name === "string"
    ? name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]!.toUpperCase())
        .join("")
    : null;

/**
 * One knowledge base as a compact card: its monogram, name and source count,
 * whether it is in play here (a word, never only a colour), where it applies,
 * and the three things a person does with it — open the sources, add more,
 * or stop using it here (which deletes nothing). Use it where a project shows
 * the base it grounds in; KnowledgeBase picks between bases and sources.
 */
export const KnowledgeBaseCard = React.forwardRef<HTMLElement, KnowledgeBaseCardProps>(
  (
    {
      name,
      monogram,
      sourceCount,
      status = "active",
      scope,
      onManage,
      onAdd,
      onActiveChange,
      manageLabel = "Manage sources",
      addLabel = "Add sources",
      deactivateLabel = "Stop using here",
      activateLabel = "Use in this project",
      className,
      ...props
    },
    ref,
  ) => {
    const titleId = React.useId();
    const active = status === "active";
    return (
      <section
        ref={ref}
        aria-labelledby={titleId}
        data-status={status}
        className={cn("flex flex-col gap-3 rounded-xl border border-border bg-background p-4 text-foreground", className)}
        {...props}
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-muted text-xs font-semibold text-brand"
          >
            {monogram ?? knowledgeBaseInitials(name)}
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <h3 id={titleId} className="truncate text-sm font-semibold">
              {name}
            </h3>
            {sourceCount != null && (
              <p className="text-xs text-muted-foreground">
                {sourceCount.toLocaleString()} {sourceCount === 1 ? "source" : "sources"}
              </p>
            )}
          </div>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
              active ? "border-transparent bg-muted text-foreground" : "border-border text-muted-foreground",
            )}
          >
            <span aria-hidden="true" className="size-2 rounded-full border-2 border-current" />
            {baseStatusWord[status]}
          </span>
        </div>
        {scope && (
          <p className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
            <Info aria-hidden="true" className="size-3.5 shrink-0" />
            {scope}
          </p>
        )}
        {(onManage || onAdd || onActiveChange) && (
          <div className="flex flex-wrap items-center gap-1">
            {onManage && (
              <Button size="sm" variant="secondary" onClick={onManage}>
                {manageLabel}
              </Button>
            )}
            {onAdd && (
              <Button size="sm" variant="ghost" onClick={onAdd}>
                {addLabel}
              </Button>
            )}
            {onActiveChange && (
              <Button size="sm" variant="ghost" onClick={() => onActiveChange(!active)}>
                {active ? deactivateLabel : activateLabel}
              </Button>
            )}
          </div>
        )}
      </section>
    );
  },
);
KnowledgeBaseCard.displayName = "KnowledgeBaseCard";

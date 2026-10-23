import * as React from "react";
import { cn } from "@nucleux/utils";
import { MsInfo } from "@nucleux/md3-icons";
import { Md3Button } from "@nucleux/md3-button";
import { Md3Chip } from "@nucleux/md3-chip";
import { AlertTriangle, Check, CircleAlert, FileText, Plus, RotateCw } from "lucide-react";
import { knowledgeBaseInitials } from "@nucleux/knowledge-base";
import type {
  KnowledgeBaseProps,
  KnowledgeBaseSourcesProps,
  KnowledgeBaseCoverageProps,
  KnowledgeBaseVariant,
  KnowledgeBaseCoverageLevel,
  KnowledgeSourceStatus,
  KnowledgeBaseCardProps,
  KnowledgeBaseCardStatus,
} from "@nucleux/knowledge-base";

// Same API as @nucleux/knowledge-base: props and data shapes come from the twin.
export type Md3KnowledgeBaseProps = KnowledgeBaseProps;
export type Md3KnowledgeBaseSourcesProps = KnowledgeBaseSourcesProps;
export type Md3KnowledgeBaseCoverageProps = KnowledgeBaseCoverageProps;
export type Md3KnowledgeBaseVariant = KnowledgeBaseVariant;
export type Md3KnowledgeBaseCoverageLevel = KnowledgeBaseCoverageLevel;
export type Md3KnowledgeSourceStatus = KnowledgeSourceStatus;
export type Md3KnowledgeBaseCardProps = KnowledgeBaseCardProps;
export type Md3KnowledgeBaseCardStatus = KnowledgeBaseCardStatus;
export type { KnowledgeSource, KnowledgeBaseSourceRef } from "@nucleux/knowledge-base";

const statusWord: Record<KnowledgeSourceStatus, string> = {
  ready: "Ready",
  processing: "Processing",
  stale: "Needs refresh",
  error: "Couldn't process",
};

const statusTone: Record<KnowledgeSourceStatus, string> = {
  ready: "text-md-primary",
  processing: "text-md-on-surface-variant",
  stale: "text-md-tertiary",
  error: "text-md-error",
};

/**
 * The status mark: a ring while the source cannot be used (processing, failed)
 * and a filled disc once it can (ready, stale) — the distinction is a shape,
 * not only a colour, so it survives greyscale.
 */
const StatusDot = ({ status }: { status: KnowledgeSourceStatus }) => {
  const usable = status === "ready" || status === "stale";
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-2 shrink-0 rounded-full border-2 border-current align-middle transition-colors duration-200 motion-reduce:transition-none",
        usable ? "bg-current" : "bg-transparent",
      )}
    />
  );
};

const nameText = (n: React.ReactNode, fallback: string) => (typeof n === "string" ? n : fallback);

/**
 * Material 3 twin of `KnowledgeBase`: lets people choose which knowledge bases
 * the agent grounds in for this session — a card holding a list of checkable
 * rows (default) or a wrap of filter chips with document counts
 * (`variant="chips"`). Readiness is a word on each row (Ready, Processing,
 * Needs refresh, Couldn't process) led by a ring (not usable yet) or a filled
 * disc (usable); a failed row is outlined in error, not flooded, with its
 * Retry/Refresh on the row itself. Shares the API of `@nucleux/knowledge-base`.
 */
export const Md3KnowledgeBase = React.forwardRef<HTMLDivElement, Md3KnowledgeBaseProps>(
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
          className={cn(
            "font-md",
            "flex flex-col gap-3 rounded-md-md bg-md-surface-container-low p-4 text-md-on-surface shadow-md-1",
            className,
          )}
          {...props}
        >
          {heading && (
            <p id={headingId} className="text-sm font-medium tracking-[0.1px] text-md-on-surface">
              {heading}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {sources.map((source) => {
              const active = selected.includes(source.id);
              return (
                <Md3Chip
                  key={source.id}
                  variant="filter"
                  selected={active}
                  role="checkbox"
                  aria-checked={active}
                  aria-pressed={undefined}
                  onClick={() => toggle(source.id)}
                  className="transition-colors duration-200 motion-reduce:transition-none"
                >
                  {source.name}
                  {source.count != null && (
                    <span className="font-normal"> · {source.count.toLocaleString()}</span>
                  )}
                  {source.status && source.status !== "ready" && (
                    <span className={cn("font-normal", statusTone[source.status])}> · {statusWord[source.status]}</span>
                  )}
                </Md3Chip>
              );
            })}
            {onAdd && (
              <Md3Chip variant="assist" icon={<Plus aria-hidden="true" />} onClick={onAdd}>
                {addLabel}
              </Md3Chip>
            )}
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "font-md",
          "flex flex-col gap-1 rounded-md-md bg-md-surface-container-low py-3 text-md-on-surface shadow-md-1",
          className,
        )}
        {...props}
      >
        {heading && (
          <div className="flex items-center justify-between px-4 pb-1">
            <p id={headingId} className="text-sm font-medium tracking-[0.1px] text-md-on-surface-variant">
              {heading}
            </p>
            {selected.length > 0 && (
              <span className="text-xs font-medium tracking-[0.5px] text-md-on-surface-variant">
                {selected.length} selected
              </span>
            )}
          </div>
        )}
        <ul
          aria-labelledby={heading ? headingId : undefined}
          aria-label={heading ? undefined : "Knowledge sources"}
          className="flex flex-col gap-1 px-2"
        >
          {sources.map((source) => {
            const active = selected.includes(source.id);
            const failed = source.status === "error";
            const recover =
              onRefresh && (source.status === "stale" || failed) ? (
                <Md3Button
                  variant="text"
                  onClick={() => onRefresh(source.id)}
                  aria-label={`${failed ? "Retry" : "Refresh"} ${nameText(source.name, source.id)}`}
                  icon={<RotateCw aria-hidden="true" />}
                  className="h-8 shrink-0 px-3 text-xs [&_svg]:size-4"
                >
                  {failed ? "Retry" : "Refresh"}
                </Md3Button>
              ) : null;
            return (
              <li
                key={source.id}
                data-status={source.status}
                className={cn(
                  "flex items-center gap-1 rounded-md-sm border pr-1",
                  failed ? "border-md-error" : "border-transparent",
                )}
              >
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={active}
                  onClick={() => toggle(source.id)}
                  className={cn(
                    "relative flex min-h-14 w-full min-w-0 flex-1 items-center gap-4 overflow-hidden rounded-md-sm px-2 py-2 text-left outline-none transition-colors duration-200 motion-reduce:transition-none",
                    "before:absolute before:inset-0 before:bg-md-on-surface before:opacity-0 before:transition-opacity before:content-['']",
                    "hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12] active:before:opacity-[0.12]",
                    "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-md-primary",
                    active && "bg-md-secondary-container text-md-on-secondary-container",
                  )}
                >
                  <span className="relative inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-md-surface-container-high text-md-on-surface-variant [&_svg]:size-5">
                    {source.icon ?? <FileText aria-hidden="true" />}
                  </span>
                  <span className="relative flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-base text-md-on-surface">{source.name}</span>
                    {(source.meta || source.status || source.count != null) && (
                      <span className="truncate text-sm text-md-on-surface-variant">
                        {source.status && (
                          <span className={cn("inline-flex items-center gap-1.5 font-medium", statusTone[source.status])}>
                            <StatusDot status={source.status} />
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
                  {/* Material 3 checkbox visual (the row itself is the checkbox). */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "relative inline-flex size-[18px] shrink-0 items-center justify-center rounded-[2px] border-2 transition-colors duration-200 motion-reduce:transition-none [&_svg]:size-[14px]",
                      active
                        ? "border-md-primary bg-md-primary text-md-on-primary"
                        : "border-md-on-surface-variant text-transparent",
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
          <Md3Button
            variant="text"
            onClick={onAdd}
            icon={<Plus aria-hidden="true" />}
            className="mx-2 mt-1 self-start px-3"
          >
            {addLabel}
          </Md3Button>
        )}
      </div>
    );
  },
);
Md3KnowledgeBase.displayName = "Md3KnowledgeBase";

/**
 * Material 3 twin of `KnowledgeBaseSources`: the source list under an answer —
 * exactly which knowledge-base documents (and sections) the agent read. While
 * `reading`, a pulsing band says so (politely announced; deliberately not a
 * progress bar, since no honest percentage exists) and it swaps to provenance
 * when the answer finishes. Shares the API of `@nucleux/knowledge-base`.
 */
export const Md3KnowledgeBaseSources = React.forwardRef<HTMLDivElement, Md3KnowledgeBaseSourcesProps>(
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
      <div ref={ref} className={cn("font-md", "flex flex-col gap-2 text-md-on-surface", className)} {...props}>
        <p
          id={headingId}
          role="status"
          aria-live="polite"
          className={cn(
            "inline-flex items-center gap-2 text-xs font-medium tracking-[0.5px] text-md-on-surface-variant",
            reading && "self-start rounded-full bg-md-secondary-container px-3 py-1 text-md-on-secondary-container",
          )}
        >
          {reading && (
            <span
              aria-hidden="true"
              className="size-2 shrink-0 rounded-full bg-md-primary animate-pulse motion-reduce:animate-none"
            />
          )}
          {title}
        </p>
        {n > 0 && (
          <ul aria-labelledby={headingId} className="flex flex-col gap-1">
            {sources.map((s) => {
              const body = (
                <>
                  <FileText aria-hidden="true" className="relative size-4 shrink-0 text-md-on-surface-variant" />
                  <span className="relative truncate">{s.name}</span>
                  {s.section && <span className="relative shrink-0 text-md-on-surface-variant">· {s.section}</span>}
                </>
              );
              const cls =
                "relative flex items-center gap-2 overflow-hidden rounded-md-sm bg-md-surface-container px-3 py-2 text-sm text-md-on-surface";
              return (
                <li key={s.id}>
                  {s.href ? (
                    <a
                      href={s.href}
                      className={cn(
                        cls,
                        "outline-none before:absolute before:inset-0 before:bg-md-on-surface before:opacity-0 before:transition-opacity before:content-['']",
                        "hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12] focus-visible:ring-2 focus-visible:ring-md-primary",
                      )}
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
Md3KnowledgeBaseSources.displayName = "Md3KnowledgeBaseSources";

const coverage: Record<KnowledgeBaseCoverageLevel, { word: string; icon: React.ReactNode; cls: string }> = {
  high: {
    word: "Well-covered",
    icon: <Check aria-hidden="true" className="size-3.5" />,
    cls: "bg-md-primary-container text-md-on-primary-container",
  },
  partial: {
    word: "Partly covered",
    icon: <AlertTriangle aria-hidden="true" className="size-3.5" />,
    cls: "bg-md-tertiary-container text-md-on-tertiary-container",
  },
  low: {
    word: "Thin coverage",
    icon: <CircleAlert aria-hidden="true" className="size-3.5" />,
    cls: "bg-md-error-container text-md-on-error-container",
  },
};

/**
 * Material 3 twin of `KnowledgeBaseCoverage`: a small tonal label saying how
 * well the knowledge base covers the question — "Well-covered · 14 matches",
 * or a warning when context is thin. The word carries the meaning; the
 * container colour only reinforces it. Shares the API of `@nucleux/knowledge-base`.
 */
export const Md3KnowledgeBaseCoverage = React.forwardRef<HTMLSpanElement, Md3KnowledgeBaseCoverageProps>(
  ({ level, matches, label, className, ...props }, ref) => {
    const c = coverage[level];
    return (
      <span
        ref={ref}
        data-level={level}
        className={cn(
          "font-md",
          "inline-flex h-6 items-center gap-1 rounded-md-sm px-2 text-xs font-medium tracking-[0.5px]",
          c.cls,
          className,
        )}
        {...props}
      >
        {c.icon}
        {label ?? c.word}
        {matches != null && (
          <span className="font-normal">
            · {matches} {matches === 1 ? "match" : "matches"}
          </span>
        )}
      </span>
    );
  },
);
Md3KnowledgeBaseCoverage.displayName = "Md3KnowledgeBaseCoverage";

const baseStatusWord: Record<KnowledgeBaseCardStatus, string> = {
  active: "Active",
  available: "Available",
  inactive: "Inactive",
};

/**
 * Material 3 twin of `KnowledgeBaseCard`: one knowledge base as an outlined
 * card — a tonal monogram tile, the name (title medium) and source count, an
 * assist-style status chip that says Active, Available or Inactive (a ring and
 * a word, never only a colour), the line saying where it applies, and an
 * outlined "Manage sources" with text buttons "Add sources" and "Stop using
 * here" (which deletes nothing). Shares the API of `@nucleux/knowledge-base`.
 */
/** The card's small action buttons, as nucleux.in draws them (`.md-button--sm`). */
const footButton = "h-8 px-4 tracking-[0.1px]";

export const Md3KnowledgeBaseCard = React.forwardRef<HTMLElement, Md3KnowledgeBaseCardProps>(
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
        className={cn(
          "font-sans leading-[1.55]",
          "flex flex-col gap-3 rounded-md-lg border border-md-outline-variant bg-md-surface-container-lowest p-4 text-md-on-surface",
          className,
        )}
        {...props}
      >
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="inline-flex size-[34px] shrink-0 items-center justify-center rounded-[10px] bg-md-secondary-container text-[10.5px] font-bold tracking-[0.04em] text-md-on-secondary-container"
          >
            {monogram ?? knowledgeBaseInitials(name)}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h3 id={titleId} className="truncate text-[14px] font-[650] leading-[1.55]">
              {name}
            </h3>
            {sourceCount != null && (
              <p className="truncate text-[12px] leading-[1.55] text-md-on-surface-variant">
                {sourceCount.toLocaleString()} {sourceCount === 1 ? "source" : "sources"}
              </p>
            )}
          </div>
          <span
            className={cn(
              "inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[11.5px] font-semibold",
              active ? "bg-md-surface-container-highest text-md-on-surface" : "border border-md-outline-variant text-md-on-surface-variant",
            )}
          >
            <span aria-hidden="true" className="size-2 rounded-full border-2 border-current" />
            {baseStatusWord[status]}
          </span>
        </div>
        {scope && (
          <p className="flex items-start gap-1.5 text-[11.5px] font-semibold leading-[1.5] text-md-on-surface">
            <MsInfo className="mt-px size-3.5" />
            {scope}
          </p>
        )}
        {(onManage || onAdd || onActiveChange) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {onManage && (
              <Md3Button variant="outlined" onClick={onManage} className={footButton + " border-md-outline-variant"}>
                {manageLabel}
              </Md3Button>
            )}
            {onAdd && (
              <Md3Button variant="text" onClick={onAdd} className={footButton}>
                {addLabel}
              </Md3Button>
            )}
            {onActiveChange && (
              <Md3Button variant="text" onClick={() => onActiveChange(!active)} className={footButton}>
                {active ? deactivateLabel : activateLabel}
              </Md3Button>
            )}
          </div>
        )}
      </section>
    );
  },
);
Md3KnowledgeBaseCard.displayName = "Md3KnowledgeBaseCard";

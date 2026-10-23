import * as React from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, CircleAlert, Plus, Sparkles, Undo2, X } from "lucide-react";
import { cn } from "@nucleux/utils";
import {
  madlibsBlankWidth,
  useMadlibs,
  useMadlibsBlank,
  type MadlibsBlank,
  type MadlibsBlankStyle,
  type MadlibsController,
  type MadlibsDensity,
  type MadlibsPart,
  type MadlibsProps,
  type MadlibsStatus,
  type MadlibsSuggestion,
  type MadlibsValues,
  type MadlibsVariant,
} from "@nucleux/madlibs";
import { Md3Button } from "@nucleux/md3-button";
import { Md3Card } from "@nucleux/md3-card";
import { Md3Chip } from "@nucleux/md3-chip";

/** Props of {@link Md3Madlibs} — identical to `MadlibsProps` from `@nucleux/madlibs`. */
export type Md3MadlibsProps = MadlibsProps;
/** "inline-dropdowns", "form-rows" or "chip-builder". */
export type Md3MadlibsVariant = MadlibsVariant;
/** "filled" or "underline". */
export type Md3MadlibsBlankStyle = MadlibsBlankStyle;
/** "comfortable" or "compact". */
export type Md3MadlibsDensity = MadlibsDensity;
/** Values keyed by blank id. */
export type Md3MadlibsValues = MadlibsValues;
/** One blank: id, label, options, placeholder. */
export type Md3MadlibsBlank = MadlibsBlank;
/** An agent-inferred value for an empty blank. */
export type Md3MadlibsSuggestion = MadlibsSuggestion;
/** "empty", "partial" or "complete". */
export type Md3MadlibsStatus = MadlibsStatus;

const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

const textAction =
  "relative inline-flex min-h-8 items-center gap-1 overflow-hidden rounded-full px-2.5 text-[13px] font-medium text-md-primary outline-none [&_svg]:size-[18px] before:absolute before:inset-0 before:bg-current before:opacity-0 before:transition-opacity before:content-[''] hover:before:opacity-[0.08] focus-visible:ring-2 focus-visible:ring-md-primary focus-visible:ring-offset-2 focus-visible:ring-offset-md-surface motion-reduce:before:transition-none";

interface BlankFieldProps {
  ctl: MadlibsController;
  id: string;
  blankStyle: MadlibsBlankStyle;
  inline: boolean;
  labelled?: boolean;
}

function BlankField({ ctl, id, blankStyle, inline, labelled }: BlankFieldProps) {
  const blank = ctl.getBlank(id);
  const isSug = ctl.suggestion?.blank === id;
  const value = isSug ? ctl.suggestion!.value : ctl.values[id] ?? "";
  const bad = ctl.errors.includes(id);
  const set = !isSug && !!value.trim();
  const placeholder = blank.placeholder ?? lower(blank.label);
  const name = `${blank.label}${blank.required ? "" : " (optional)"}`;
  const combo = useMadlibsBlank({
    inputId: ctl.ids.field(id),
    label: blank.label,
    value,
    options: blank.options ?? [],
    onValueChange: (v) => ctl.setValue(id, v),
    readOnly: isSug,
  });
  const describedBy = [bad ? ctl.ids.error : null, isSug ? ctl.ids.suggestion : null].filter(Boolean).join(" ") || undefined;
  const underline = blankStyle === "underline";

  return (
    <span className={cn("relative max-w-full align-middle leading-5", inline ? "mx-[3px] inline-flex" : "flex w-full")}>
      <input
        ref={ctl.registerField(id)}
        {...combo.inputProps}
        type="text"
        placeholder={placeholder}
        aria-label={labelled ? undefined : name}
        aria-required={blank.required || undefined}
        aria-invalid={bad || undefined}
        aria-describedby={describedBy}
        style={inline ? { width: madlibsBlankWidth(value || placeholder, 1.1, "3rem") } : undefined}
        className={cn(
          "h-9 min-w-0 max-w-full pl-3 pr-[30px] text-[15px] font-medium text-md-on-surface outline-none transition-colors motion-reduce:transition-none",
          "placeholder:font-normal placeholder:text-md-on-surface-variant",
          !inline && "w-full",
          underline
            ? cn(
                "rounded-t-md-xs border-0 border-b bg-md-surface-container-high",
                set ? "border-b-2 border-md-primary" : "border-md-on-surface-variant",
                "focus:border-b-2 focus:border-md-primary",
                isSug && "border-dashed border-md-primary italic text-md-primary",
                bad && "border-b-2 border-md-error",
              )
            : cn(
                "rounded-md-md",
                set
                  ? "border border-transparent bg-md-secondary-container text-md-on-secondary-container"
                  : "border border-dashed border-md-outline bg-transparent",
                "focus:border-2 focus:border-solid focus:border-md-primary focus:pl-[11px] focus:pr-[29px]",
                isSug && "border-dashed border-md-primary bg-md-primary/[0.06] italic text-md-primary",
                bad && "border-2 border-solid border-md-error bg-transparent pl-[11px] pr-[29px]",
              ),
          isSug && "cursor-default",
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute right-2 top-1/2 inline-flex -translate-y-1/2 [&_svg]:size-[18px]",
          isSug ? "text-md-primary" : set && !underline ? "text-md-on-secondary-container" : "text-md-on-surface-variant",
        )}
      >
        {isSug ? <Sparkles /> : combo.hasList ? <ChevronDown /> : null}
      </span>
      {combo.hasList && (
        <span
          {...combo.listboxProps}
          className={cn(
            "absolute left-0 top-full z-20 mt-1 block w-max min-w-full max-w-xs rounded-md-xs bg-md-surface-container py-2 text-left shadow-md-2",
            combo.listboxProps.hidden && "hidden",
          )}
        >
          {combo.filtered.map((o, i) => (
            <span
              key={o}
              {...combo.getOptionProps(i)}
              className={cn(
                "relative flex h-12 cursor-pointer items-center gap-3 px-3 text-sm font-normal text-md-on-surface",
                "before:absolute before:inset-0 before:bg-md-on-surface before:opacity-0 before:content-[''] hover:before:opacity-[0.08]",
                i === combo.active && "before:opacity-[0.12]",
              )}
            >
              <span className="relative flex-1">{o}</span>
              {o === value && <Check aria-hidden="true" className="relative size-[18px] text-md-on-surface-variant" />}
            </span>
          ))}
        </span>
      )}
    </span>
  );
}

function Sentence({ ctl, blankStyle, compact }: { ctl: MadlibsController; blankStyle: MadlibsBlankStyle; compact: boolean }) {
  const renderPart = (p: MadlibsPart, key: React.Key) =>
    p.kind === "text" ? (
      <span key={key} className={cn(p.optional && "text-md-on-surface-variant")}>
        {p.text}
      </span>
    ) : (
      <React.Fragment key={key}>
        <BlankField ctl={ctl} id={p.id} blankStyle={blankStyle} inline />
        {p.optional && !(ctl.suggestion?.blank === p.id) && (
          <span aria-hidden="true" className="-ml-px mr-1 inline-block align-middle text-[11.5px] leading-4 text-md-on-surface-variant">
            optional
          </span>
        )}
      </React.Fragment>
    );
  return (
    <div className={cn("text-md-on-surface", compact ? "text-base leading-10" : "text-[17px] leading-[44px]")}>
      {ctl.parts.map((p, i) => (p.kind === "clause" ? p.parts.map((q, j) => renderPart(q, `${i}-${j}`)) : renderPart(p, i)))}
    </div>
  );
}

function FormRows({ ctl, blankStyle }: { ctl: MadlibsController; blankStyle: MadlibsBlankStyle }) {
  return (
    <div className="flex flex-col gap-2">
      {ctl.blanks.map((b) => (
        <div key={b.id} className="grid grid-cols-[6rem_minmax(0,1fr)] items-center gap-3">
          <label htmlFor={ctl.ids.field(b.id)} className="text-right text-xs font-medium tracking-[0.5px] text-md-on-surface-variant">
            {b.label}
            {!b.required && <span className="block font-normal">optional</span>}
          </label>
          <BlankField ctl={ctl} id={b.id} blankStyle={blankStyle} inline={false} labelled />
        </div>
      ))}
    </div>
  );
}

function ChipBuilder({ ctl }: { ctl: MadlibsController }) {
  const firstEmpty = ctl.blanks.find((b) => !(ctl.values[b.id] ?? "").trim())?.id ?? null;
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const current = activeId && !(ctl.values[activeId] ?? "").trim() ? activeId : firstEmpty;
  const blank = current ? ctl.getBlank(current) : null;
  const [draft, setDraft] = React.useState("");

  const commit = (id: string, v: string) => {
    if (!v.trim()) return;
    ctl.setValue(id, v.trim());
    setDraft("");
    setActiveId(null);
  };

  const renderPart = (p: MadlibsPart, key: React.Key) => {
    if (p.kind === "text") {
      return (
        <span key={key} className={cn("whitespace-pre-wrap", p.optional && "text-md-on-surface-variant")}>
          {p.text}
        </span>
      );
    }
    const b = ctl.getBlank(p.id);
    const v = (ctl.values[p.id] ?? "").trim();
    const isSug = ctl.suggestion?.blank === p.id;
    const bad = ctl.errors.includes(p.id);
    if (v) {
      return (
        <Md3Chip key={key} selected onClick={() => ctl.setValue(p.id, "")} aria-label={`${b.label}: ${v}. Remove`} className="mx-0.5 h-7 px-2.5">
          <span className="inline-flex items-center gap-1">
            {v}
            <X aria-hidden="true" className="!size-4" />
          </span>
        </Md3Chip>
      );
    }
    return (
      <button
        key={key}
        type="button"
        ref={ctl.registerField(p.id)}
        onClick={() => setActiveId(p.id)}
        aria-pressed={current === p.id}
        aria-invalid={bad || undefined}
        aria-describedby={bad ? ctl.ids.error : isSug ? ctl.ids.suggestion : undefined}
        className={cn(
          "relative mx-0.5 inline-flex h-7 items-center gap-1 overflow-hidden rounded-md-sm px-2 text-sm italic outline-none",
          "before:absolute before:inset-0 before:bg-current before:opacity-0 before:content-[''] hover:before:opacity-[0.08] focus-visible:ring-2 focus-visible:ring-md-primary",
          current === p.id ? "border border-md-primary text-md-primary" : "border border-dashed border-md-outline text-md-on-surface-variant",
          bad && "border-2 border-solid border-md-error text-md-error",
        )}
      >
        {isSug ? <Sparkles aria-hidden="true" className="relative size-4 text-md-primary" /> : <Plus aria-hidden="true" className="relative size-4" />}
        <span className="relative">{isSug ? ctl.suggestion!.value : `add ${lower(b.label)}${b.required ? "" : " (optional)"}`}</span>
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex min-h-11 flex-wrap items-center gap-y-1.5 rounded-md-md border border-dashed border-md-outline-variant bg-md-surface-container-low px-3 py-2 text-[15px] leading-7 text-md-on-surface">
        {ctl.parts.map((p, i) => (p.kind === "clause" ? p.parts.map((q, j) => renderPart(q, `${i}-${j}`)) : renderPart(p, i)))}
      </div>
      {blank && current && (
        <div role="group" aria-label={`Choose ${lower(blank.label)}`} className="flex flex-wrap items-center gap-2">
          <span aria-hidden="true" className="mr-1 text-xs font-medium tracking-[0.5px] text-md-on-surface-variant">
            {blank.label}
          </span>
          {(blank.options ?? []).map((o) => (
            <Md3Chip key={o} variant="suggestion" onClick={() => commit(current, o)}>
              {o}
            </Md3Chip>
          ))}
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit(current, draft);
              }
            }}
            placeholder="or type your own"
            aria-label={`${blank.label}${blank.required ? "" : " (optional)"}, your own`}
            className="h-8 w-40 rounded-md-sm border border-md-outline bg-transparent px-3 text-sm text-md-on-surface outline-none placeholder:text-md-on-surface-variant focus:border-2 focus:border-md-primary focus:px-[11px]"
          />
        </div>
      )}
    </div>
  );
}

/**
 * Material 3 Madlibs — the same scaffold and API as `Madlibs` from
 * `@nucleux/madlibs`: a sentence with labelled blanks (tonal inline fields
 * that settle into the sentence as they fill), optional clauses, the
 * assembled request below, and Use prompt, which places the sentence in the
 * composer (never sends) and confirms with Undo. An agent-suggested value is
 * italic, primary-tinted and marked until kept; a missing required blank
 * gets an error outline and words, and keeps everything else.
 */
export const Md3Madlibs = React.forwardRef<HTMLDivElement, Md3MadlibsProps>((props, ref) => {
  const ctl = useMadlibs(props);
  const {
    template: _template,
    blanks: _blanks,
    values: _values,
    defaultValues: _defaultValues,
    onValuesChange: _onValuesChange,
    onUse: _onUse,
    onUndo: _onUndo,
    placed: _placed,
    defaultPlaced: _defaultPlaced,
    onPlacedChange: _onPlacedChange,
    suggestion: _suggestion,
    onSuggestionKeep: _onSuggestionKeep,
    onSuggestionClear: _onSuggestionClear,
    defaultShowErrors: _defaultShowErrors,
    agentName = "the assistant",
    heading = "Build your request",
    description,
    note = "Nothing is sent until you send it.",
    submitLabel = "Use prompt",
    placedHeading = "Placed in the composer",
    placedMessage = "It's an ordinary request now — edit it in the composer, then send.",
    showPreview = true,
    previewLabel = "Preview",
    variant = "inline-dropdowns",
    blankStyle = "filled",
    density = "comfortable",
    className,
    ...rest
  } = props;
  const compact = density === "compact";

  return (
    <Md3Card
      ref={ref}
      variant="outlined"
      role="group"
      aria-labelledby={ctl.ids.heading}
      data-status={ctl.placed ? "placed" : ctl.status}
      className={cn(
        "font-md",
        "flex w-full max-w-[620px] flex-col overflow-visible rounded-md-lg bg-md-surface-container-lowest",
        "animate-nx-fade-in motion-reduce:animate-none",
        compact ? "gap-2.5 px-4 py-3.5" : "gap-3.5 px-5 py-[18px]",
        className,
      )}
      {...rest}
    >
      <p
        id={ctl.ids.heading}
        className={cn(
          "flex items-center gap-1.5 text-[11.5px] font-semibold uppercase leading-4 tracking-[0.06em]",
          ctl.placed ? "text-md-primary" : "text-md-on-surface-variant",
        )}
      >
        {ctl.placed && <Check aria-hidden="true" className="size-4" />}
        {ctl.placed ? placedHeading : heading}
      </p>

      {ctl.placed ? (
        <>
          <p className="text-sm text-md-on-surface-variant">{placedMessage}</p>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button type="button" className={textAction} onClick={ctl.back}>
              <ArrowLeft aria-hidden="true" className="relative" />
              <span className="relative">Back to the blanks</span>
            </button>
            {ctl.canUndo && (
              <Md3Button variant="tonal" icon={<Undo2 aria-hidden="true" />} onClick={ctl.undo}>
                Undo
              </Md3Button>
            )}
          </div>
        </>
      ) : (
        <>
          {description != null && <p className="-mt-2.5 text-[13px] leading-5 text-md-on-surface-variant">{description}</p>}

          {variant === "form-rows" ? (
            <FormRows ctl={ctl} blankStyle={blankStyle} />
          ) : variant === "chip-builder" ? (
            <ChipBuilder ctl={ctl} />
          ) : (
            <Sentence ctl={ctl} blankStyle={blankStyle} compact={compact} />
          )}

          {ctl.suggestion && (
            <div
              id={ctl.ids.suggestion}
              role="status"
              className="flex flex-wrap items-center gap-2 rounded-md-md border border-dashed border-md-outline-variant bg-md-surface-container-low py-2 pl-3 pr-2 text-[13px] leading-5 text-md-on-surface"
            >
              <Sparkles aria-hidden="true" className="size-[18px] shrink-0 text-md-primary" />
              <span className="min-w-0 flex-[1_1_12.5rem]">
                <span className="font-semibold">{ctl.suggestion.value}</span> suggested by {agentName}
                {ctl.suggestion.reason != null && <> — {ctl.suggestion.reason}</>}
              </span>
              <span className="inline-flex gap-0.5">
                <button type="button" className={textAction} onClick={ctl.keepSuggestion}>
                  <span className="relative">Keep</span>
                </button>
                <button type="button" className={textAction} onClick={ctl.clearSuggestion}>
                  <span className="relative">Clear</span>
                </button>
              </span>
            </div>
          )}

          {ctl.errorMessage && (
            <p id={ctl.ids.error} role="alert" className="flex items-start gap-1.5 text-[12.5px] leading-[18px] text-md-error">
              <CircleAlert aria-hidden="true" className="mt-px size-4 shrink-0" />
              <span>{ctl.errorMessage}</span>
            </p>
          )}

          {showPreview && (
            <p className="flex items-baseline gap-2 rounded-md-md bg-md-on-surface/[0.04] px-3.5 py-2.5 text-[13px] leading-5 text-md-on-surface">
              <span className="shrink-0 font-semibold text-md-on-surface-variant">{previewLabel}</span>
              <span data-madlibs-preview="">{ctl.prompt}</span>
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            {note != null && note !== false ? <span className="text-xs tracking-[0.4px] text-md-on-surface-variant">{note}</span> : <span />}
            <Md3Button variant="filled" icon={<ArrowRight aria-hidden="true" />} className="ml-auto" onClick={ctl.use}>
              {submitLabel}
            </Md3Button>
          </div>
        </>
      )}

      <p role="status" className="sr-only">
        {ctl.announcement}
      </p>
    </Md3Card>
  );
});
Md3Madlibs.displayName = "Md3Madlibs";

import * as React from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, CircleAlert, Plus, Sparkles, Undo2, X } from "lucide-react";
import { cn } from "@nucleux/utils";
import { Button } from "@nucleux/button";
import { CardContainer } from "@nucleux/card";

/* ────────────────────────────────────────────────────────────────────────────
 * Types
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Layout of the scaffold, from the spec's variants:
 * "inline-dropdowns" (default) — a flowing sentence whose blanks are inline fields;
 * "form-rows" — one labelled row per blank, for when each slot needs room;
 * "chip-builder" — tap chips to fill the sentence, no menu hunting.
 */
export type MadlibsVariant = "inline-dropdowns" | "form-rows" | "chip-builder";

/** How a blank is drawn: a "filled" inline field, or an "underline" in the sentence. */
export type MadlibsBlankStyle = "filled" | "underline";

/** Spacing of the card. */
export type MadlibsDensity = "comfortable" | "compact";

/** What the person has entered, keyed by blank id. */
export type MadlibsValues = Record<string, string>;

/** One blank in the sentence. Its `id` is what `{id}` refers to in the template. */
export interface MadlibsBlank {
  /** Id used in the template as `{id}` and as the key in `values`. */
  id: string;
  /** Human label ("Audience", not "field2") — the blank's accessible name and its error wording. */
  label: string;
  /** Suggested values offered in the blank's list. People can always type their own. */
  options?: string[];
  /** Placeholder while empty. Defaults to the label in lower case. */
  placeholder?: string;
}

/**
 * A value the agent inferred for an empty blank. It is shown as a suggestion —
 * marked, not part of the request — until the person keeps it.
 */
export interface MadlibsSuggestion {
  /** Id of the blank it is for. */
  blank: string;
  /** The suggested value. */
  value: string;
  /** Why it was suggested, in plain words ("The document's owner is the leadership team."). */
  reason?: React.ReactNode;
}

/** A piece of a parsed template. */
export type MadlibsPart =
  | { kind: "text"; text: string; optional: boolean }
  | { kind: "blank"; id: string; optional: boolean };

/** A parsed template: top-level parts, with `[ … ]` clauses grouped. */
export type MadlibsTemplatePart = MadlibsPart | { kind: "clause"; parts: MadlibsPart[] };

/** Whether the request is empty, partly filled or has every required blank. */
export type MadlibsStatus = "empty" | "partial" | "complete";

export interface MadlibsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  /**
   * The scaffold sentence. `{id}` is a blank; `[ … ]` wraps an optional clause
   * that leaves the sentence while its blank is empty:
   * `"Summarize {document} for {audience}[, focusing on {topic}]."`
   * Blanks outside a clause are required. Keep it to two–four blanks — more is a form.
   */
  template: string;
  /** Label and options for each blank in the template. */
  blanks: MadlibsBlank[];
  /** Controlled values, keyed by blank id. */
  values?: MadlibsValues;
  /** Initial values when uncontrolled. */
  defaultValues?: MadlibsValues;
  /** Called with every change to the values. */
  onValuesChange?: (values: MadlibsValues) => void;
  /**
   * Called by Use prompt once every required blank is filled, with the
   * assembled sentence. Put it in the composer for a final edit — the scaffold
   * never sends.
   */
  onUse?: (prompt: string, values: MadlibsValues) => void;
  /**
   * Called by Undo after the prompt was placed. Restore the composer's previous
   * draft; the scaffold returns to its blanks. Without it, no Undo is offered.
   */
  onUndo?: () => void;
  /** Controlled "placed in the composer" state. */
  placed?: boolean;
  /** Initial placed state when uncontrolled. */
  defaultPlaced?: boolean;
  /** Called when the placed state changes (Use prompt, Undo, Back to the blanks). */
  onPlacedChange?: (placed: boolean) => void;
  /** A value the agent inferred for an empty blank, shown marked until kept. */
  suggestion?: MadlibsSuggestion | null;
  /** Called when the person keeps the suggestion (its value becomes the blank's value). */
  onSuggestionKeep?: (suggestion: MadlibsSuggestion) => void;
  /** Called when the person clears the suggestion. */
  onSuggestionClear?: (suggestion: MadlibsSuggestion) => void;
  /** Who suggests values. Defaults to "the assistant". */
  agentName?: string;
  /** Overline above the sentence. Defaults to "Build your request". */
  heading?: React.ReactNode;
  /** Helper line under the heading. */
  description?: React.ReactNode;
  /** Small print beside Use prompt. Defaults to "Nothing is sent until you send it."; `null` hides it. */
  note?: React.ReactNode;
  /** Label of the use button. Defaults to "Use prompt". */
  submitLabel?: string;
  /** Overline once placed. Defaults to "Placed in the composer". */
  placedHeading?: React.ReactNode;
  /** Message once placed. */
  placedMessage?: React.ReactNode;
  /** Show the assembled request as it fills. Defaults to true. */
  showPreview?: boolean;
  /** Label of the assembled request. Defaults to "Preview". */
  previewLabel?: string;
  /** Layout. Defaults to "inline-dropdowns". */
  variant?: MadlibsVariant;
  /** Blank treatment. Defaults to "filled". */
  blankStyle?: MadlibsBlankStyle;
  /** Spacing. Defaults to "comfortable". */
  density?: MadlibsDensity;
  /** Flag missing required blanks from the start, as if Use prompt had been pressed. */
  defaultShowErrors?: boolean;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Non-visual logic, shared with @nucleux/md3-madlibs
 * ──────────────────────────────────────────────────────────────────────────── */

/** Parse `"Summarize {document} for {audience}[, focusing on {topic}]."` into parts. */
export function parseMadlibsTemplate(template: string): MadlibsTemplatePart[] {
  const out: MadlibsTemplatePart[] = [];
  const re = /\[([^\]]*)\]|\{([^}]+)\}|([^[{]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(template))) {
    if (m[1] !== undefined) {
      const parts: MadlibsPart[] = [];
      const inner = /\{([^}]+)\}|([^{]+)/g;
      let n: RegExpExecArray | null;
      while ((n = inner.exec(m[1]))) {
        if (n[1]) parts.push({ kind: "blank", id: n[1].trim(), optional: true });
        else parts.push({ kind: "text", text: n[2] ?? "", optional: true });
      }
      out.push({ kind: "clause", parts });
    } else if (m[2]) {
      out.push({ kind: "blank", id: m[2].trim(), optional: false });
    } else {
      out.push({ kind: "text", text: m[3] ?? "", optional: false });
    }
  }
  return out;
}

/** Every blank of a parsed template in order, with whether it is required. */
export function getMadlibsBlanks(parts: MadlibsTemplatePart[]): { id: string; required: boolean }[] {
  const ids: { id: string; required: boolean }[] = [];
  for (const p of parts) {
    if (p.kind === "blank") ids.push({ id: p.id, required: true });
    if (p.kind === "clause") for (const q of p.parts) if (q.kind === "blank") ids.push({ id: q.id, required: false });
  }
  return ids;
}

/**
 * The request as it reads now: an empty required blank shows "…", and an
 * optional clause is left out while its blank is empty.
 */
export function assembleMadlibsPrompt(parts: MadlibsTemplatePart[], values: MadlibsValues): string {
  const val = (id: string) => (values[id] ?? "").trim();
  return parts
    .map((p) => {
      if (p.kind === "text") return p.text;
      if (p.kind === "blank") return val(p.id) || "…";
      const filled = p.parts.every((q) => q.kind === "text" || val(q.id));
      return filled ? p.parts.map((q) => (q.kind === "text" ? q.text : val(q.id))).join("") : "";
    })
    .join("")
    .replace(/\s+([.,;:!?])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Width of an inline blank: as wide as what is in it, plus room for its icon.
 * `perChar` scales the text width (in `ch`) for the family's font size.
 */
export function madlibsBlankWidth(text: string, perChar = 1.05, padding = "2.25rem"): string {
  return `calc(${Math.max(4, text.length * perChar).toFixed(1)}ch + ${padding})`;
}

const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/** Everything `useMadlibs` hands a family's renderer. */
export interface MadlibsController {
  parts: MadlibsTemplatePart[];
  blanks: (MadlibsBlank & { required: boolean })[];
  getBlank: (id: string) => MadlibsBlank & { required: boolean };
  values: MadlibsValues;
  setValue: (id: string, value: string) => void;
  prompt: string;
  status: MadlibsStatus;
  errors: string[];
  errorMessage: string | null;
  placed: boolean;
  /** The suggestion while it is still pending (its blank empty, not kept or cleared). */
  suggestion: MadlibsSuggestion | null;
  keepSuggestion: () => void;
  clearSuggestion: () => void;
  use: () => void;
  undo: () => void;
  back: () => void;
  canUndo: boolean;
  announcement: string;
  /** Register a blank's focus target, so validation can move focus to it. */
  registerField: (id: string) => (el: HTMLElement | null) => void;
  ids: { heading: string; error: string; suggestion: string; field: (blank: string) => string };
}

/**
 * The state machine of a Madlibs scaffold, shared by both families: values
 * (controlled or not), validation that names what is missing and clears
 * nothing, the agent's suggestion (pending until kept), and the placed state
 * with Undo. It never sends.
 */
export function useMadlibs(props: MadlibsProps): MadlibsController {
  const {
    template,
    blanks: blankDefs,
    values: valuesProp,
    defaultValues,
    onValuesChange,
    onUse,
    onUndo,
    placed: placedProp,
    defaultPlaced = false,
    onPlacedChange,
    suggestion: suggestionProp,
    onSuggestionKeep,
    onSuggestionClear,
    defaultShowErrors = false,
  } = props;

  const uid = React.useId();
  const parts = React.useMemo(() => parseMadlibsTemplate(template), [template]);
  const blanks = React.useMemo(
    () =>
      getMadlibsBlanks(parts).map(({ id, required }) => {
        const def = blankDefs.find((b) => b.id === id);
        return { id, label: def?.label ?? id, options: def?.options, placeholder: def?.placeholder, required };
      }),
    [parts, blankDefs],
  );
  const getBlank = React.useCallback(
    (id: string) => blanks.find((b) => b.id === id) ?? { id, label: id, required: true },
    [blanks],
  );

  const isControlled = valuesProp !== undefined;
  const [internal, setInternal] = React.useState<MadlibsValues>(defaultValues ?? {});
  const values = isControlled ? valuesProp : internal;
  const valuesRef = React.useRef(values);
  valuesRef.current = values;

  const missingOf = (v: MadlibsValues) => blanks.filter((b) => b.required && !(v[b.id] ?? "").trim()).map((b) => b.id);
  const [errors, setErrors] = React.useState<string[]>(() => (defaultShowErrors ? missingOf(values) : []));

  const placedControlled = placedProp !== undefined;
  const [placedInternal, setPlacedInternal] = React.useState(defaultPlaced);
  const placed = placedControlled ? placedProp : placedInternal;
  const setPlaced = (next: boolean) => {
    if (!placedControlled) setPlacedInternal(next);
    onPlacedChange?.(next);
  };

  const [resolved, setResolved] = React.useState<string | null>(null);
  const [announcement, setAnnouncement] = React.useState("");

  const fields = React.useRef(new Map<string, HTMLElement>());
  const registerField = React.useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el) fields.current.set(id, el);
      else fields.current.delete(id);
    },
    [],
  );
  const [focusNext, setFocusNext] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!focusNext) return;
    fields.current.get(focusNext)?.focus();
    setFocusNext(null);
  }, [focusNext]);

  const setValue = (id: string, value: string) => {
    const next = { ...valuesRef.current, [id]: value };
    valuesRef.current = next;
    if (!isControlled) setInternal(next);
    onValuesChange?.(next);
    if (value.trim()) setErrors((e) => (e.includes(id) ? e.filter((x) => x !== id) : e));
  };

  const sugKey = suggestionProp ? `${suggestionProp.blank}\u0000${suggestionProp.value}` : null;
  const suggestion =
    suggestionProp && sugKey !== resolved && !(values[suggestionProp.blank] ?? "").trim() ? suggestionProp : null;

  const keepSuggestion = () => {
    if (!suggestion) return;
    setValue(suggestion.blank, suggestion.value);
    setResolved(sugKey);
    setAnnouncement(`Kept: ${suggestion.value}.`);
    onSuggestionKeep?.(suggestion);
  };
  const clearSuggestion = () => {
    if (!suggestion) return;
    setResolved(sugKey);
    setFocusNext(suggestion.blank);
    onSuggestionClear?.(suggestion);
  };

  const prompt = assembleMadlibsPrompt(parts, values);
  const anyFilled = blanks.some((b) => (values[b.id] ?? "").trim());
  const status: MadlibsStatus = missingOf(values).length === 0 ? "complete" : anyFilled ? "partial" : "empty";

  const errorLabels = errors.map((id) => lower(getBlank(id).label));
  const errorMessage = errors.length
    ? `Add ${errorLabels.join(" and ")} — ${errors.length > 1 ? "they're" : "it's"} required. Everything else you entered is kept.`
    : null;

  const use = () => {
    const missing = missingOf(values);
    if (missing.length) {
      setErrors(missing);
      setFocusNext(missing[0]!);
      return;
    }
    setErrors([]);
    onUse?.(assembleMadlibsPrompt(parts, values), values);
    setPlaced(true);
    setAnnouncement("Placed in the composer. Edit it, then send.");
  };
  const undo = () => {
    onUndo?.();
    setPlaced(false);
    setAnnouncement("Undone. Your previous draft is back.");
  };
  const back = () => {
    setPlaced(false);
    setAnnouncement("");
  };

  return {
    parts,
    blanks,
    getBlank,
    values,
    setValue,
    prompt,
    status,
    errors,
    errorMessage,
    placed,
    suggestion,
    keepSuggestion,
    clearSuggestion,
    use,
    undo,
    back,
    canUndo: !!onUndo,
    announcement,
    registerField,
    ids: {
      heading: `${uid}-heading`,
      error: `${uid}-error`,
      suggestion: `${uid}-suggestion`,
      field: (blank: string) => `${uid}-blank-${blank.replace(/\W+/g, "-")}`,
    },
  };
}

export interface UseMadlibsBlankOptions {
  /** Id of the input. The listbox gets `${inputId}-list`. */
  inputId: string;
  /** Accessible name of the listbox. */
  label: string;
  value: string;
  options: string[];
  onValueChange: (value: string) => void;
  /** A pending suggestion makes the field read-only until it is kept or cleared. */
  readOnly?: boolean;
}

/**
 * Keyboard and ARIA wiring for one blank, shared by both families: an editable
 * combobox (free text always allowed) with a list of suggested values. Typing
 * filters the list; ArrowDown/ArrowUp open and move; Enter picks the active
 * option; Escape closes; clicking the field toggles the list.
 */
export function useMadlibsBlank({ inputId, label, value, options, onValueChange, readOnly }: UseMadlibsBlankOptions) {
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(-1);
  const [query, setQuery] = React.useState<string | null>(null);
  const listId = `${inputId}-list`;
  const optionId = (i: number) => `${listId}-${i}`;
  const q = (query ?? "").trim().toLowerCase();
  const filtered = q ? options.filter((o) => o.toLowerCase().includes(q)) : options;
  const hasList = options.length > 0;
  const expanded = hasList && open && filtered.length > 0 && !readOnly;

  const close = () => {
    setOpen(false);
    setQuery(null);
    setActive(-1);
  };
  const choose = (o: string) => {
    onValueChange(o);
    close();
  };

  const inputProps = {
    id: inputId,
    value,
    readOnly,
    autoComplete: "off",
    ...(hasList
      ? {
          role: "combobox" as const,
          "aria-autocomplete": "list" as const,
          "aria-expanded": expanded,
          "aria-controls": listId,
          "aria-activedescendant": expanded && active >= 0 ? optionId(active) : undefined,
        }
      : {}),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      onValueChange(e.target.value);
      setQuery(e.target.value);
      setOpen(true);
      setActive(-1);
    },
    onClick: () => {
      if (readOnly || !hasList) return;
      if (open) close();
      else setOpen(true);
    },
    onBlur: close,
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!hasList || readOnly) return;
      const n = filtered.length;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!n) return;
        const down = e.key === "ArrowDown";
        if (!open) {
          setOpen(true);
          setActive(down ? 0 : n - 1);
        } else {
          setActive((a) => (down ? (a + 1) % n : a <= 0 ? n - 1 : a - 1));
        }
      } else if (e.key === "Enter") {
        if (expanded && active >= 0 && filtered[active] !== undefined) {
          e.preventDefault();
          choose(filtered[active]!);
        }
      } else if (e.key === "Escape") {
        if (expanded) {
          e.preventDefault();
          e.stopPropagation();
          close();
        }
      }
    },
  };

  const listboxProps = { id: listId, role: "listbox" as const, "aria-label": label, hidden: !expanded };
  const getOptionProps = (i: number) => ({
    id: optionId(i),
    role: "option" as const,
    "aria-selected": i === active,
    onMouseDown: (e: React.MouseEvent) => e.preventDefault(),
    onClick: () => choose(filtered[i]!),
  });

  return { expanded, filtered, active, hasList, inputProps, listboxProps, getOptionProps };
}

/* ────────────────────────────────────────────────────────────────────────────
 * shadcn rendering
 * ──────────────────────────────────────────────────────────────────────────── */

interface BlankFieldProps {
  ctl: MadlibsController;
  id: string;
  blankStyle: MadlibsBlankStyle;
  /** Inline in the sentence (auto width) or a full-width row field. */
  inline: boolean;
  /** A visible <label> names it (form rows), so no aria-label. */
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
    <span className={cn("relative max-w-full align-middle", inline ? "mx-1 inline-flex" : "flex w-full")}>
      <input
        ref={ctl.registerField(id)}
        {...combo.inputProps}
        type="text"
        placeholder={placeholder}
        aria-label={labelled ? undefined : name}
        aria-required={blank.required || undefined}
        aria-invalid={bad || undefined}
        aria-describedby={describedBy}
        style={inline ? { width: madlibsBlankWidth(value || placeholder, 0.95, "2.5rem") } : undefined}
        className={cn(
          "h-[34px] min-w-0 max-w-full pl-2.5 pr-7 text-[13px] font-medium text-foreground outline-none transition-colors",
          "placeholder:font-normal placeholder:text-muted-foreground",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background motion-reduce:transition-none",
          !inline && "w-full",
          underline
            ? cn(
                "rounded-none border-0 border-b-2 bg-transparent px-1",
                set ? "border-warning" : "border-muted-foreground/50",
                isSug && "border-dashed border-brand italic",
                bad && "border-destructive",
              )
            : cn(
                "rounded-md border",
                set ? "border-warning bg-warning/10" : "border-dashed border-muted-foreground/50 bg-background",
                isSug && "border-brand bg-brand/10 italic",
                bad && "border-solid border-destructive bg-destructive/5 ring-1 ring-destructive",
              ),
          isSug && "cursor-default",
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute right-2 top-1/2 inline-flex -translate-y-1/2",
          isSug ? "text-brand" : set ? "text-warning" : "text-muted-foreground",
        )}
      >
        {isSug ? <Sparkles className="size-3.5" /> : combo.hasList ? <ChevronDown className="size-3.5" /> : null}
      </span>
      {combo.hasList && (
        <span
          {...combo.listboxProps}
          className={cn(
            "absolute left-0 top-full z-20 mt-1 block w-max min-w-full max-w-xs rounded-md border border-border bg-background p-1 text-left shadow-md",
            combo.listboxProps.hidden && "hidden",
          )}
        >
          {combo.filtered.map((o, i) => (
            <span
              key={o}
              {...combo.getOptionProps(i)}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm font-normal leading-5 text-foreground",
                i === combo.active && "bg-accent text-accent-foreground",
              )}
            >
              <span className="flex-1">{o}</span>
              {o === value && <Check aria-hidden="true" className="size-3.5" />}
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
      <span key={key} className={cn(p.optional && "text-muted-foreground")}>
        {p.text}
      </span>
    ) : (
      <React.Fragment key={key}>
        <BlankField ctl={ctl} id={p.id} blankStyle={blankStyle} inline />
        {p.optional && !(ctl.suggestion?.blank === p.id) && (
          <span aria-hidden="true" className="-ml-0.5 mr-1 align-middle text-xs text-muted-foreground">
            optional
          </span>
        )}
      </React.Fragment>
    );
  return (
    <div className={cn("text-[15px] text-foreground", compact ? "leading-9" : "leading-[38px]")}>
      {ctl.parts.map((p, i) => (p.kind === "clause" ? p.parts.map((q, j) => renderPart(q, `${i}-${j}`)) : renderPart(p, i)))}
    </div>
  );
}

function FormRows({ ctl, blankStyle }: { ctl: MadlibsController; blankStyle: MadlibsBlankStyle }) {
  return (
    <div className="flex flex-col gap-2">
      {ctl.blanks.map((b) => (
        <div key={b.id} className="grid grid-cols-[6rem_minmax(0,1fr)] items-center gap-2.5">
          <label htmlFor={ctl.ids.field(b.id)} className="text-right text-xs font-semibold text-muted-foreground">
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
        <span key={key} className={cn("whitespace-pre-wrap", p.optional && "text-muted-foreground")}>
          {p.text}
        </span>
      );
    }
    const b = ctl.getBlank(p.id);
    const v = (ctl.values[p.id] ?? "").trim();
    const isSug = ctl.suggestion?.blank === p.id;
    if (v) {
      return (
        <button
          key={key}
          type="button"
          onClick={() => ctl.setValue(p.id, "")}
          aria-label={`${b.label}: ${v}. Remove`}
          className="mx-0.5 inline-flex h-6 items-center gap-1 rounded-md bg-warning px-2 text-xs font-medium text-warning-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        >
          {v}
          <X aria-hidden="true" className="size-3" />
        </button>
      );
    }
    return (
      <button
        key={key}
        type="button"
        ref={ctl.registerField(p.id)}
        onClick={() => setActiveId(p.id)}
        aria-pressed={current === p.id}
        aria-invalid={ctl.errors.includes(p.id) || undefined}
        aria-describedby={ctl.errors.includes(p.id) ? ctl.ids.error : isSug ? ctl.ids.suggestion : undefined}
        className={cn(
          "mx-0.5 inline-flex h-6 items-center gap-1 rounded-md px-1.5 text-xs italic outline-none focus-visible:ring-2 focus-visible:ring-ring",
          current === p.id ? "bg-accent text-foreground" : "text-muted-foreground",
          ctl.errors.includes(p.id) && "text-destructive ring-1 ring-destructive",
        )}
      >
        {isSug ? <Sparkles aria-hidden="true" className="size-3 text-brand" /> : <Plus aria-hidden="true" className="size-3" />}
        {isSug ? ctl.suggestion!.value : `add ${lower(b.label)}${b.required ? "" : " (optional)"}`}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex min-h-9 flex-wrap items-center gap-y-1 rounded-lg border border-dashed border-input px-3 py-2 text-[13px] leading-6 text-foreground">
        {ctl.parts.map((p, i) => (p.kind === "clause" ? p.parts.map((q, j) => renderPart(q, `${i}-${j}`)) : renderPart(p, i)))}
      </div>
      {blank && current && (
        <div role="group" aria-label={`Choose ${lower(blank.label)}`} className="flex flex-wrap items-center gap-1.5">
          <span aria-hidden="true" className="mr-1 text-xs font-semibold text-muted-foreground">
            {blank.label}
          </span>
          {(blank.options ?? []).map((o) => (
            <Button key={o} type="button" variant="secondary" size="sm" className="h-7 px-2.5 text-xs font-medium" onClick={() => commit(current, o)}>
              {o}
            </Button>
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
            className="h-7 w-36 rounded-md border border-input bg-background px-2 text-xs text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      )}
    </div>
  );
}

/**
 * Madlibs — a request written as a natural sentence with a few labelled
 * blanks ("Write a [friendly] reply to [Sam] about [the proposal]."). Each
 * blank is an inline field with suggested values and a free-text fallback;
 * optional clauses leave the sentence while empty; the assembled request
 * shows as it fills. An agent-suggested value stays marked until kept. Use
 * prompt names any missing blank in words (clearing nothing) and otherwise
 * hands the sentence to `onUse` for the composer — it never sends — then
 * confirms with Undo. Variants: inline dropdowns, form rows, chip builder.
 */
export const Madlibs = React.forwardRef<HTMLDivElement, MadlibsProps>((props, ref) => {
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
    <CardContainer
      ref={ref}
      role="group"
      aria-labelledby={ctl.ids.heading}
      data-status={ctl.placed ? "placed" : ctl.status}
      className={cn("flex w-full max-w-xl flex-col rounded-2xl", compact ? "gap-2.5 p-4" : "gap-3.5 p-5", className)}
      {...rest}
    >
      <p
        id={ctl.ids.heading}
        className={cn(
          "flex items-center gap-1.5 text-[10px] font-semibold uppercase leading-4 tracking-[0.1em]",
          ctl.placed ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {ctl.placed && <Check aria-hidden="true" className="size-3.5 text-success" />}
        {ctl.placed ? placedHeading : heading}
      </p>

      {ctl.placed ? (
        <>
          <p className="text-sm text-muted-foreground">{placedMessage}</p>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" leftIcon={<ArrowLeft className="size-3.5" />} onClick={ctl.back}>
              Back to the blanks
            </Button>
            {ctl.canUndo && (
              <Button type="button" variant="secondary" size="sm" leftIcon={<Undo2 className="size-3.5" />} onClick={ctl.undo}>
                Undo
              </Button>
            )}
          </div>
        </>
      ) : (
        <>
          {description != null && <p className="-mt-2 text-sm text-muted-foreground">{description}</p>}

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
              className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-brand/50 bg-brand/5 py-1.5 pl-3 pr-1.5 text-xs leading-5 text-foreground"
            >
              <Sparkles aria-hidden="true" className="size-3.5 shrink-0 text-brand" />
              <span className="min-w-0 flex-[1_1_12rem]">
                <span className="font-semibold">{ctl.suggestion.value}</span> suggested by {agentName}
                {ctl.suggestion.reason != null && <> — {ctl.suggestion.reason}</>}
              </span>
              <span className="inline-flex gap-1">
                <Button type="button" variant="secondary" size="sm" className="h-7 px-2.5 text-xs" onClick={ctl.keepSuggestion}>
                  Keep
                </Button>
                <Button type="button" variant="ghost" size="sm" className="h-7 px-2.5 text-xs" onClick={ctl.clearSuggestion}>
                  Clear
                </Button>
              </span>
            </div>
          )}

          {ctl.errorMessage && (
            <p id={ctl.ids.error} role="alert" className="flex items-start gap-1.5 text-xs leading-5 text-destructive">
              <CircleAlert aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
              <span>{ctl.errorMessage}</span>
            </p>
          )}

          {showPreview && (
            <p className="rounded-lg border border-border bg-muted px-3 py-2.5 text-xs leading-[18px] text-muted-foreground">
              <span className="font-semibold text-foreground">{previewLabel}: </span>
              <span data-madlibs-preview="">&ldquo;{ctl.prompt}&rdquo;</span>
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            {note != null && note !== false ? <span className="text-xs text-muted-foreground">{note}</span> : <span />}
            <Button
              type="button"
              size="sm"
              className="ml-auto px-[18px] text-xs font-medium"
              rightIcon={<ArrowRight className="size-3.5" />}
              onClick={ctl.use}
            >
              {submitLabel}
            </Button>
          </div>
        </>
      )}

      <p role="status" className="sr-only">
        {ctl.announcement}
      </p>
    </CardContainer>
  );
});
Madlibs.displayName = "Madlibs";

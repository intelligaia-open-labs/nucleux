import * as React from "react";
import { cn } from "@nucleux/utils";
import { Check, X } from "lucide-react";
import { Badge, type BadgeVariant } from "@nucleux/badge";
import { Button } from "@nucleux/button";
import { Field, FieldDescription, FieldLabel } from "@nucleux/field";
import { Input } from "@nucleux/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@nucleux/select";
import { Textarea } from "@nucleux/textarea";

export interface StructuredOption {
  /** Stable value. */
  value: string;
  /** Display label. */
  label: React.ReactNode;
}

export interface StructuredInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "onSubmit"> {
  /** The clarifying question the agent is asking. */
  question: React.ReactNode;
  /** The selectable answers. */
  options: StructuredOption[];
  /** Allow selecting more than one option. */
  multiple?: boolean;
  /** Selected values (controlled). */
  value?: string[];
  /** Initial selection (uncontrolled). */
  defaultValue?: string[];
  /** Called when the selection changes. */
  onValueChange?: (values: string[]) => void;
  /** Show a free-text "something else" escape. */
  allowOther?: boolean;
  /** Label for the other escape. Defaults to `"Something else…"`. */
  otherPlaceholder?: string;
  /** Called when the answer is submitted. */
  onSubmit?: (values: string[], other?: string) => void;
  /** Called when the user skips the question. Renders the skip control when set. */
  onSkip?: () => void;
  /** Label for the submit button. */
  submitLabel?: React.ReactNode;
  /** Label for the skip button. */
  skipLabel?: React.ReactNode;
}

/**
 * An agent-generated clarifying question rendered as a structured choice —
 * single or multi-select options, a free-text escape, and a skip. The other
 * structured-input variants are composable siblings: {@link StructuredInputSlots}
 * (named slots), {@link StructuredInputTags} (tagged input) and
 * {@link StructuredInputWizard} (wizard step).
 * Source: Figma "Expressive Input / Structured Input".
 */
export const StructuredInput = React.forwardRef<HTMLDivElement, StructuredInputProps>(
  (
    {
      question,
      options,
      multiple = false,
      value,
      defaultValue = [],
      onValueChange,
      allowOther = false,
      otherPlaceholder = "Something else…",
      onSubmit,
      onSkip,
      submitLabel = "Continue",
      skipLabel = "Skip",
      className,
      ...props
    },
    ref,
  ) => {
    const [internal, setInternal] = React.useState<string[]>(defaultValue);
    const [other, setOther] = React.useState("");
    const questionId = React.useId();
    const groupRef = React.useRef<HTMLDivElement>(null);
    const selected = value !== undefined ? value : internal;

    const setSelected = (next: string[]) => {
      if (value === undefined) setInternal(next);
      onValueChange?.(next);
    };
    const toggle = (val: string) => {
      if (multiple) {
        setSelected(selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]);
      } else {
        setSelected([val]);
      }
    };

    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-4 rounded-xl border border-border bg-background p-5", className)}
        {...props}
      >
        <p id={questionId} className="text-base font-medium text-foreground">
          {question}
        </p>
        <div
          ref={groupRef}
          role={multiple ? "group" : "radiogroup"}
          aria-labelledby={questionId}
          className="flex flex-col gap-2"
          onKeyDown={(e) => {
            // Radio-group keyboard pattern: arrows move and select.
            if (multiple || !["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].includes(e.key)) return;
            const radios = Array.from(groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]') ?? []);
            const i = radios.indexOf(document.activeElement as HTMLButtonElement);
            if (i < 0) return;
            e.preventDefault();
            const step = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
            const next = (i + step + radios.length) % radios.length;
            radios[next].focus();
            setSelected([options[next].value]);
          }}
        >
          {options.map((option, index) => {
            const active = selected.includes(option.value);
            const tabbable = multiple || index === Math.max(0, options.findIndex((o) => selected.includes(o.value)));
            return (
              <button
                key={option.value}
                type="button"
                role={multiple ? "checkbox" : "radio"}
                aria-checked={active}
                tabIndex={tabbable ? 0 : -1}
                onClick={() => toggle(option.value)}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "border-brand bg-brand-muted/50 text-foreground"
                    : "border-border bg-background text-foreground hover:bg-accent",
                )}
              >
                <span
                  className={cn(
                    "inline-flex size-5 shrink-0 items-center justify-center border transition-colors [&_svg]:size-3.5",
                    multiple ? "rounded-md" : "rounded-full",
                    active ? "border-brand bg-brand text-brand-foreground" : "border-border",
                  )}
                >
                  {active && <Check aria-hidden="true" />}
                </span>
                <span className="flex-1">{option.label}</span>
              </button>
            );
          })}
        </div>
        {allowOther && (
          <input
            type="text"
            value={other}
            onChange={(e) => setOther(e.target.value)}
            placeholder={otherPlaceholder}
            aria-label={otherPlaceholder}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        )}
        <div className="flex items-center justify-end gap-2">
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {skipLabel}
            </button>
          )}
          {onSubmit && (
            <button
              type="button"
              onClick={() => onSubmit(selected, allowOther ? other : undefined)}
              disabled={selected.length === 0 && !(allowOther && other.trim())}
              className="inline-flex items-center rounded-lg bg-info px-3 py-2 text-sm font-medium text-info-foreground transition-colors hover:bg-info/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              {submitLabel}
            </button>
          )}
        </div>
      </div>
    );
  },
);
StructuredInput.displayName = "StructuredInput";

/* -------------------------------------------------------------------------- */
/* Named slots                                                                 */
/* -------------------------------------------------------------------------- */

export interface StructuredInputSlot {
  /** Key in the values object. */
  name: string;
  /** Plain-language label, e.g. `"Audience"`. */
  label: string;
  /** Placeholder / example value. */
  placeholder?: string;
  /** Choices — renders a select instead of a text field. */
  options?: StructuredOption[];
  /** Helper text under the field. */
  helper?: string;
  /**
   * Marks the initial value as the agent's suggestion, with the reason, e.g.
   * `"from the meeting invite"`. Once the person changes it, it reads “Edited by you”.
   */
  suggested?: string;
  /** Span the full row. */
  wide?: boolean;
  /**
   * The control. Defaults to `"select"` when `options` are given, else `"text"`.
   * `"segmented"` shows `options` as a row of buttons; `"date"` a date field;
   * `"tags"` a tag field whose value is a comma-separated list.
   */
  type?: StructuredInputSlotType;
  /** The slot must be filled before submitting; its label carries “*”. */
  required?: boolean;
}

/** Control used for a slot. */
export type StructuredInputSlotType = "text" | "select" | "segmented" | "date" | "tags";

/** Splits a `"tags"` slot's value into its tags. */
export function splitStructuredTags(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

/** The control a slot uses, from its `type` and `options`. */
export function structuredSlotType(slot: StructuredInputSlot): StructuredInputSlotType {
  return slot.type ?? (slot.options ? "select" : "text");
}

export type StructuredInputValues = Record<string, string>;

export interface StructuredInputSlotsProps
  extends Omit<React.HTMLAttributes<HTMLFormElement>, "onSubmit" | "defaultValue" | "title"> {
  /** The 2–4 slots the prompt template needs. */
  slots: StructuredInputSlot[];
  /** Values (controlled). */
  values?: StructuredInputValues;
  /** Initial values (uncontrolled). */
  defaultValues?: StructuredInputValues;
  /** Called on every change. */
  onValuesChange?: (values: StructuredInputValues) => void;
  /** Show a freeform override field. `true` uses the label `"Anything else?"`; a string sets the label. */
  freeform?: boolean | string;
  /** Called on submit. Never requires every slot — any value (or the freeform text) is enough. */
  onSubmit?: (values: StructuredInputValues, freeform: string) => void;
  /** Label of the submit button. Defaults to `"Generate"`. */
  submitLabel?: React.ReactNode;
  /** Accessible name of the form. Defaults to `"Structured prompt builder"`. */
  label?: string;
  /** Heading over the fields, e.g. `"Structured prompt"`; it also names the form. */
  title?: React.ReactNode;
  /** Icon beside the title. */
  icon?: React.ReactNode;
  /** Right side of the title row, e.g. a "Template" badge or what the form is for. */
  aside?: React.ReactNode;
  /** Classes for the title row, e.g. to run it edge to edge when the form is its own card. */
  headerClassName?: string;
  /** Shows “3 of 4 filled” beside the buttons. */
  showProgress?: boolean;
  /** Shows a Cancel button beside submit. */
  onCancel?: () => void;
  /** Label of the cancel button. Defaults to `"Cancel"`. */
  cancelLabel?: React.ReactNode;
}

/**
 * Named slots: a short set of plain-language fields (2–4) that fill a prompt
 * template — text fields or selects, an optional freeform override, and a
 * submit that never requires every field. Agent-suggested values are marked
 * “Suggested” with their reason and become “Edited by you” once changed; the
 * component never changes a value the person set.
 */
export const StructuredInputSlots = React.forwardRef<HTMLFormElement, StructuredInputSlotsProps>(
  (
    {
      slots,
      values: valuesProp,
      defaultValues,
      onValuesChange,
      freeform = false,
      onSubmit,
      submitLabel = "Generate",
      label = "Structured prompt builder",
      title,
      icon,
      aside,
      headerClassName,
      showProgress = false,
      onCancel,
      cancelLabel = "Cancel",
      className,
      ...props
    },
    ref,
  ) => {
    const [internal, setInternal] = React.useState<StructuredInputValues>(defaultValues ?? {});
    const values = valuesProp ?? internal;
    const [edited, setEdited] = React.useState<Record<string, boolean>>({});
    const [extra, setExtra] = React.useState("");
    const baseId = React.useId();

    const setValue = (name: string, value: string) => {
      const next = { ...values, [name]: value };
      if (valuesProp === undefined) setInternal(next);
      setEdited((e) => ({ ...e, [name]: true }));
      onValuesChange?.(next);
    };

    const filled = (name: string) => !!values[name]?.trim();
    const filledCount = slots.filter((slot) => filled(slot.name)).length;
    const requiredMet = slots.every((slot) => !slot.required || filled(slot.name));
    const hasAny = Object.values(values).some((v) => v && v.trim()) || extra.trim().length > 0;
    const canSubmit = hasAny && requiredMet;
    const freeformLabel = typeof freeform === "string" ? freeform : "Anything else?";
    const titleId = `${baseId}-title`;

    return (
      <form
        ref={ref}
        aria-label={title == null ? label : undefined}
        aria-labelledby={title == null ? undefined : titleId}
        className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2", className)}
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) onSubmit?.(values, extra);
        }}
        {...props}
      >
        {(title != null || aside != null) && (
          <div className={cn("mb-1 flex items-center gap-2 border-b border-border pb-3.5 sm:col-span-2", headerClassName)}>
            {icon != null && (
              <span
                aria-hidden="true"
                className="inline-flex size-[1.625rem] shrink-0 items-center justify-center rounded-[6px] bg-foreground text-background [&_svg]:size-3"
              >
                {icon}
              </span>
            )}
            <h3 id={titleId} className="flex-1 text-[12.5px] font-semibold leading-[1.55] text-foreground">
              {title}
            </h3>
            {aside}
          </div>
        )}
        {slots.map((slot) => {
          const id = `${baseId}-${slot.name}`;
          const helperId = `${id}-helper`;
          const mark = slot.suggested
            ? edited[slot.name]
              ? { text: "Edited by you", variant: "secondary" as const }
              : { text: "Suggested", variant: "info" as const }
            : null;
          const describedBy = slot.helper || (mark && !edited[slot.name]) ? helperId : undefined;
          const type = structuredSlotType(slot);
          return (
            <Field key={slot.name} className={cn(type === "tags" ? "gap-1.5" : "gap-1", slot.wide && "sm:col-span-2")}>
              <div className="flex items-center gap-2">
                <FieldLabel
                  id={`${id}-label`}
                  htmlFor={id}
                  className="text-[10px] font-semibold uppercase leading-[1.55] tracking-[0.06em] text-faint"
                >
                  {slot.label}
                  {slot.required && <span aria-hidden="true"> *</span>}
                </FieldLabel>
                {mark && <Badge variant={mark.variant}>{mark.text}</Badge>}
              </div>
              {type === "select" && slot.options ? (
                <Select value={values[slot.name] || undefined} onValueChange={(v) => setValue(slot.name, v)}>
                  <SelectTrigger
                    id={id}
                    aria-labelledby={`${id}-label ${id}`}
                    aria-describedby={describedBy}
                    aria-required={slot.required || undefined}
                    // nucleux.in: a compact field with a ▾ caret.
                    className="h-auto rounded-[7px] border-border px-2.5 py-[7px] text-[11.5px] leading-[1.55] shadow-none after:text-faint after:content-['▾'] [&>svg]:hidden"
                  >
                    <SelectValue placeholder={slot.placeholder ?? "Choose…"} />
                  </SelectTrigger>
                  <SelectContent>
                    {slot.options.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : type === "segmented" && slot.options ? (
                <div
                  id={id}
                  role="group"
                  aria-labelledby={`${id}-label`}
                  aria-describedby={describedBy}
                  className="inline-flex w-fit overflow-hidden rounded-lg border border-input"
                >
                  {slot.options.map((o, i) => {
                    const on = values[slot.name] === o.value;
                    return (
                      <button
                        key={o.value}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setValue(slot.name, o.value)}
                        className={cn(
                          "h-11 px-4 text-sm font-medium transition-colors focus-visible:relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                          i > 0 && "border-l border-input",
                          on ? "bg-accent text-accent-foreground" : "bg-background text-foreground hover:bg-accent/50",
                        )}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              ) : type === "tags" ? (
                <StructuredTagsField
                  id={id}
                  value={values[slot.name]}
                  placeholder={slot.placeholder}
                  describedBy={describedBy}
                  onChange={(v) => setValue(slot.name, v)}
                />
              ) : (
                <Input
                  id={id}
                  type={type === "date" ? "date" : "text"}
                  value={values[slot.name] ?? ""}
                  placeholder={slot.placeholder}
                  aria-describedby={describedBy}
                  aria-required={slot.required || undefined}
                  onChange={(e) => setValue(slot.name, e.target.value)}
                  className="h-auto rounded-lg border-[1.5px] border-primary px-3 py-[9px] text-xs leading-[1.55] shadow-none"
                />
              )}
              {describedBy && (
                <FieldDescription id={helperId} className="text-xs">
                  {mark && !edited[slot.name] ? `Suggested ${slot.suggested}. ` : ""}
                  {slot.helper}
                </FieldDescription>
              )}
            </Field>
          );
        })}
        {freeform && (
          <Field className="gap-1.5 sm:col-span-2">
            <FieldLabel htmlFor={`${baseId}-freeform`} className="text-xs font-semibold text-muted-foreground">
              {freeformLabel}
            </FieldLabel>
            <Textarea
              id={`${baseId}-freeform`}
              rows={2}
              value={extra}
              placeholder="Say it in your own words — this overrides the fields above"
              onChange={(e) => setExtra(e.target.value)}
            />
          </Field>
        )}
        {(onSubmit || onCancel || showProgress) && (
          <div className="flex items-center gap-2 sm:col-span-2">
            {showProgress && (
              <span className="text-xs text-muted-foreground" aria-live="polite">
                {filledCount} of {slots.length} filled
              </span>
            )}
            <span className="flex-1" />
            {onCancel && (
              <Button type="button" variant="ghost" onClick={onCancel}>
                {cancelLabel}
              </Button>
            )}
            {onSubmit && (
              <Button
                type="submit"
                variant="primary"
                disabled={!canSubmit}
                className="h-auto rounded-lg border-0 px-[18px] py-[7px] text-[13px] font-medium leading-[1.55] tracking-normal shadow-none"
              >
                {submitLabel}
              </Button>
            )}
          </div>
        )}
      </form>
    );
  },
);
StructuredInputSlots.displayName = "StructuredInputSlots";

// nucleux.in's tag tints (rose, blue, green); dark mode falls back to the semantic tokens.
const SLOT_TAG_TONES = [
  "bg-[hsl(0_88%_94%)] text-[hsl(343_80%_35%)] dark:bg-destructive/10 dark:text-destructive",
  "bg-[hsl(223_100%_93%)] text-[hsl(224_76%_48%)] dark:bg-info/10 dark:text-info",
  "bg-[hsl(149_80%_90%)] text-[hsl(164_86%_20%)] dark:bg-success/10 dark:text-success",
  "bg-warning/10 text-warning",
];

/** The `"tags"` slot: tinted tags (press one to remove it) and a field that adds on Enter or comma. */
function StructuredTagsField({
  id,
  value,
  placeholder,
  describedBy,
  onChange,
}: {
  id: string;
  value?: string;
  placeholder?: string;
  describedBy?: string;
  onChange: (value: string) => void;
}) {
  const tags = splitStructuredTags(value);
  const [draft, setDraft] = React.useState("");
  const add = (text = draft) => {
    const t = text.trim();
    if (t && !tags.includes(t)) onChange([...tags, t].join(", "));
    setDraft("");
  };
  return (
    <div className="flex flex-wrap items-center gap-[5px] rounded-[7px] border border-border bg-background px-2.5 py-2 text-[11px] leading-[1.55] focus-within:ring-2 focus-within:ring-ring">
      {tags.map((t, i) => (
        <button
          key={t}
          type="button"
          aria-label={`Remove ${t}`}
          onClick={() => onChange(tags.filter((x) => x !== t).join(", "))}
          className={cn(
            "rounded-[5px] px-2 py-0.5 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            SLOT_TAG_TONES[i % SLOT_TAG_TONES.length],
          )}
        >
          {t}
        </button>
      ))}
      <input
        id={id}
        value={draft}
        placeholder={placeholder ?? "+"}
        aria-describedby={describedBy}
        onChange={(e) => {
          const next = e.target.value;
          if (next.endsWith(",")) add(next.slice(0, -1));
          else setDraft(next);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          } else if (e.key === "Backspace" && !draft && tags.length) {
            onChange(tags.slice(0, -1).join(", "));
          }
        }}
        onBlur={() => add()}
        className="min-w-16 flex-1 bg-transparent text-foreground outline-none placeholder:text-faint placeholder:opacity-60"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Tagged input                                                                */
/* -------------------------------------------------------------------------- */

export interface StructuredInputTagTrigger {
  /** The prefix that starts a tag, e.g. `"@"`, `"p:"`, `"/"`. */
  trigger: string;
  /** What the tag refers to, e.g. `"Person"`. */
  label: string;
  /** Values offered while typing after the trigger. */
  suggestions?: string[];
}

export type StructuredInputPart =
  | { type: "text"; text: string }
  | { type: "tag"; trigger: string; value: string };

export interface StructuredInputTagsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit" | "defaultValue" | "onChange"> {
  /** Recognised tag prefixes. Defaults to `@` person, `p:` project, `/` file. */
  triggers?: StructuredInputTagTrigger[];
  /** Committed parts (controlled). */
  value?: StructuredInputPart[];
  /** Initial parts (uncontrolled). */
  defaultValue?: StructuredInputPart[];
  /** Called when parts are added or removed. */
  onValueChange?: (parts: StructuredInputPart[]) => void;
  /** Called on Enter or the send button with the parts and their plain-text form. */
  onSubmit?: (parts: StructuredInputPart[], text: string) => void;
  /** Accessible name and placeholder of the text field. */
  placeholder?: string;
  /** Label of the send button. Defaults to `"Send"`. */
  submitLabel?: React.ReactNode;
}

const DEFAULT_TRIGGERS: StructuredInputTagTrigger[] = [
  { trigger: "@", label: "Person" },
  { trigger: "p:", label: "Project" },
  { trigger: "/", label: "File" },
];

const TAG_TONES: { variant: BadgeVariant; className?: string }[] = [
  { variant: "secondary", className: "bg-brand-muted text-brand" },
  { variant: "info" },
  { variant: "success" },
  { variant: "outline" },
];

/** Serialise parts into the plain prompt text, e.g. `"Update @sam on p:Apollo"`. */
export function structuredPartsToText(parts: StructuredInputPart[]): string {
  return parts
    .map((p) => (p.type === "text" ? p.text : `${p.trigger}${p.value}`))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Tagged input: a prompt field where typed prefixes (`@` person, `p:` project,
 * `/` file — configurable) become removable tag chips, with optional
 * type-ahead suggestions shown as buttons. Backspace on an empty field removes
 * the last tag; Enter sends. Tags are optional — plain text always works.
 */
export const StructuredInputTags = React.forwardRef<HTMLDivElement, StructuredInputTagsProps>(
  (
    {
      triggers = DEFAULT_TRIGGERS,
      value: valueProp,
      defaultValue,
      onValueChange,
      onSubmit,
      placeholder = "Type @ for people, p: for projects, / for files",
      submitLabel = "Send",
      className,
      ...props
    },
    ref,
  ) => {
    const [internal, setInternal] = React.useState<StructuredInputPart[]>(defaultValue ?? []);
    const parts = valueProp ?? internal;
    const [draft, setDraft] = React.useState("");
    const inputRef = React.useRef<HTMLInputElement>(null);
    const hintId = React.useId();

    const commit = (next: StructuredInputPart[]) => {
      if (valueProp === undefined) setInternal(next);
      onValueChange?.(next);
    };

    // Longest trigger first so "p:" wins over "p".
    const ordered = [...triggers].sort((a, b) => b.trigger.length - a.trigger.length);
    const matchTag = (word: string) => {
      const t = ordered.find((tr) => word.startsWith(tr.trigger) && word.length > tr.trigger.length);
      return t ? { trigger: t.trigger, value: word.slice(t.trigger.length) } : null;
    };

    const lastWord = draft.split(" ").pop() ?? "";
    const activeTrigger = ordered.find((tr) => lastWord.startsWith(tr.trigger));
    const query = activeTrigger ? lastWord.slice(activeTrigger.trigger.length).toLowerCase() : "";
    const suggestions =
      activeTrigger?.suggestions?.filter((s) => s.toLowerCase().startsWith(query)).slice(0, 5) ?? [];

    /** Split the draft into text + a trailing tag (if any) and commit them. */
    const flush = (source = draft, forceTag?: { trigger: string; value: string }): StructuredInputPart[] => {
      const words = source.split(" ");
      const last = words.pop() ?? "";
      const tag = forceTag ?? matchTag(last);
      const textBefore = (tag ? words.join(" ") : source).trim();
      const next = [...parts];
      if (textBefore) next.push({ type: "text", text: textBefore });
      if (tag) next.push({ type: "tag", ...tag });
      if (next.length !== parts.length) commit(next);
      setDraft("");
      return next;
    };

    const toneFor = (trigger: string) => {
      const i = triggers.findIndex((t) => t.trigger === trigger);
      return TAG_TONES[(i < 0 ? 0 : i) % TAG_TONES.length];
    };
    const labelFor = (trigger: string) => triggers.find((t) => t.trigger === trigger)?.label ?? "Tag";

    const submit = () => {
      const next = flush();
      const text = structuredPartsToText(next);
      if (text) onSubmit?.(next, text);
    };

    return (
      <div ref={ref} className={cn("flex flex-col gap-2", className)} {...props}>
        <div
          className="flex flex-wrap items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus-within:ring-2 focus-within:ring-ring"
          onClick={() => inputRef.current?.focus()}
        >
          {parts.map((part, i) =>
            part.type === "text" ? (
              <span key={i}>{part.text}</span>
            ) : (
              <Badge
                key={i}
                variant={toneFor(part.trigger).variant}
                className={cn("gap-0.5 rounded-md pr-0.5 font-semibold", toneFor(part.trigger).className)}
              >
                {part.trigger}
                {part.value}
                <button
                  type="button"
                  aria-label={`Remove ${labelFor(part.trigger).toLowerCase()} ${part.trigger}${part.value}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    commit(parts.filter((_, j) => j !== i));
                    inputRef.current?.focus();
                  }}
                  className="inline-flex size-4 items-center justify-center rounded-sm opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-3"
                >
                  <X aria-hidden="true" />
                </button>
              </Badge>
            ),
          )}
          <Input
            ref={inputRef}
            value={draft}
            aria-label={placeholder}
            aria-describedby={hintId}
            placeholder={parts.length ? undefined : placeholder}
            onChange={(e) => {
              const v = e.target.value;
              // A space after a tag word (incl. mobile keyboards that skip keydown) makes it a chip.
              if (v.endsWith(" ") && matchTag(v.trimEnd().split(" ").pop() ?? "")) flush(v.trimEnd());
              else setDraft(v);
            }}
            onKeyDown={(e) => {
              if (e.key === " " && matchTag(lastWord)) {
                e.preventDefault();
                flush();
              } else if (e.key === "Enter") {
                e.preventDefault();
                submit();
              } else if (e.key === "Backspace" && draft === "" && parts.length) {
                e.preventDefault();
                const last = parts[parts.length - 1];
                commit(parts.slice(0, -1));
                if (last.type === "text") setDraft(last.text);
              }
            }}
            className="h-7 min-w-[8rem] flex-1 border-0 px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <p id={hintId} className="sr-only">
          {triggers.map((t) => `${t.trigger} for ${t.label.toLowerCase()}`).join(", ")}. Space turns a tag into a
          chip; Backspace removes the last one; Enter sends.
        </p>
        {activeTrigger && suggestions.length > 0 && (
          <div role="group" aria-label={`${activeTrigger.label} suggestions`} className="flex flex-wrap gap-1">
            {suggestions.map((s) => (
              <Button
                key={s}
                variant="secondary"
                size="sm"
                className="h-7 px-2"
                onClick={() => {
                  flush(draft, { trigger: activeTrigger.trigger, value: s });
                  inputRef.current?.focus();
                }}
              >
                {activeTrigger.trigger}
                {s}
              </Button>
            ))}
          </div>
        )}
        {onSubmit && (
          <div className="flex justify-end">
            <Button
              variant="cta"
              size="sm"
              onClick={submit}
              disabled={parts.length === 0 && draft.trim() === ""}
            >
              {submitLabel}
            </Button>
          </div>
        )}
      </div>
    );
  },
);
StructuredInputTags.displayName = "StructuredInputTags";

/* -------------------------------------------------------------------------- */
/* Wizard step                                                                 */
/* -------------------------------------------------------------------------- */

export interface StructuredInputWizardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit" | "title"> {
  /** Step titles, e.g. `["Intent", "Audience", "Tone"]`. */
  steps: string[];
  /** Current step, 0-based (controlled). */
  step?: number;
  /** Initial step (uncontrolled). */
  defaultStep?: number;
  /** Called when Back / Next move. */
  onStepChange?: (step: number) => void;
  /** The current step's question, e.g. `"Who is the brief for?"`. */
  description?: React.ReactNode;
  /** Called from the last step (or from “Generate now” when `allowEarlySubmit`). */
  onSubmit?: () => void;
  /** Label of the final button. Defaults to `"Generate"`. */
  submitLabel?: React.ReactNode;
  /** Offer “Generate now” before the last step — fields are never all required. Defaults to `true`. */
  allowEarlySubmit?: boolean;
  /** The current step's fields. */
  children?: React.ReactNode;
}

/**
 * Wizard step: a multi-step frame for high-stakes prompts (legal, HR, medical) —
 * a progress bar, “Step 2 of 3 · Audience”, the step's question and fields
 * (children), and Back / Next / Generate. Focus moves to the step heading when
 * the step changes; nothing forces every step to be filled before generating.
 */
export const StructuredInputWizard = React.forwardRef<HTMLDivElement, StructuredInputWizardProps>(
  (
    {
      steps,
      step: stepProp,
      defaultStep = 0,
      onStepChange,
      description,
      onSubmit,
      submitLabel = "Generate",
      allowEarlySubmit = true,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [internal, setInternal] = React.useState(defaultStep);
    const step = Math.min(Math.max(stepProp ?? internal, 0), Math.max(steps.length - 1, 0));
    const headingRef = React.useRef<HTMLParagraphElement>(null);
    const headingId = React.useId();
    const moved = React.useRef(false);

    React.useEffect(() => {
      if (moved.current) headingRef.current?.focus();
    }, [step]);

    const go = (next: number) => {
      moved.current = true;
      if (stepProp === undefined) setInternal(next);
      onStepChange?.(next);
    };

    const last = step === steps.length - 1;

    return (
      <div
        ref={ref}
        role="group"
        aria-labelledby={headingId}
        className={cn("flex flex-col gap-3 rounded-xl border border-border bg-background p-4", className)}
        {...props}
      >
        <div className="flex gap-1" aria-hidden="true">
          {steps.map((_, i) => (
            <span key={i} className={cn("h-1 flex-1 rounded-full", i <= step ? "bg-brand" : "bg-muted")} />
          ))}
        </div>
        <div className="flex flex-col gap-1">
          <p ref={headingRef} id={headingId} tabIndex={-1} className="text-sm font-semibold text-foreground outline-none">
            Step {step + 1} of {steps.length} · {steps[step]}
          </p>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {children}
        <div className="flex items-center gap-2">
          {step > 0 && (
            <Button variant="ghost" size="sm" onClick={() => go(step - 1)}>
              Back
            </Button>
          )}
          <span className="flex-1" />
          {!last && allowEarlySubmit && onSubmit && (
            <Button variant="link" size="sm" onClick={onSubmit}>
              {submitLabel} now
            </Button>
          )}
          {last ? (
            onSubmit && (
              <Button variant="cta" size="sm" onClick={onSubmit}>
                {submitLabel}
              </Button>
            )
          ) : (
            <Button variant="cta" size="sm" onClick={() => go(step + 1)}>
              Next
            </Button>
          )}
        </div>
      </div>
    );
  },
);
StructuredInputWizard.displayName = "StructuredInputWizard";

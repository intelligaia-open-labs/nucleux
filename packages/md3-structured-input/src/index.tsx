import * as React from "react";
import { cn } from "@nucleux/utils";
import { Md3Button } from "@nucleux/md3-button";
import { Md3Card } from "@nucleux/md3-card";
import { Md3Chip } from "@nucleux/md3-chip";
import { Md3SegmentedButton, Md3SegmentedButtonItem } from "@nucleux/md3-segmented-button";
import {
  splitStructuredTags,
  structuredSlotType,
  structuredPartsToText,
  type StructuredInputPart,
  type StructuredInputProps,
  type StructuredInputSlotsProps,
  type StructuredInputTagsProps,
  type StructuredInputTagTrigger,
  type StructuredInputValues,
  type StructuredInputWizardProps,
} from "@nucleux/structured-input";
import { Check, Sparkles, UserPen, X } from "lucide-react";

// Same API as the shadcn twin: the props and data shapes are the twin's own types.
export type Md3StructuredInputProps = StructuredInputProps;
export type Md3StructuredInputSlotsProps = StructuredInputSlotsProps;
export type Md3StructuredInputTagsProps = StructuredInputTagsProps;
export type Md3StructuredInputWizardProps = StructuredInputWizardProps;
export type {
  StructuredOption,
  StructuredInputSlotType,
  StructuredInputSlot,
  StructuredInputValues,
  StructuredInputTagTrigger,
  StructuredInputPart,
} from "@nucleux/structured-input";
/** Serialise parts into the plain prompt text — shared with `@nucleux/structured-input`. */
export { structuredPartsToText };

const stateLayer =
  "before:absolute before:inset-0 before:bg-current before:opacity-0 before:transition-opacity before:content-[''] hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12] active:before:opacity-[0.12]";

/** MD3 outlined field chrome, shared by text inputs, selects and textareas. */
const fieldClass = cn(
  // nucleux.in: a 44px field, 8px corners, on the surface colour.
  "h-11 w-full min-w-0 rounded-md-sm border border-md-outline bg-md-surface px-3 text-[15px] leading-5 text-md-on-surface outline-none transition-colors",
  "placeholder:text-md-on-surface-variant hover:border-md-on-surface",
  "focus:border-md-primary focus:ring-1 focus:ring-inset focus:ring-md-primary",
  "disabled:cursor-not-allowed disabled:opacity-[0.38]",
);

/**
 * Material 3 structured input: an agent-generated clarifying question as a
 * compact MD3 card — single or multi-select options drawn as MD3 radio and
 * checkbox rows with a state layer, a free-text escape, and a skip. Arrow keys
 * move and select in single mode, exactly as in the twin. The other variants
 * are composable siblings: {@link Md3StructuredInputSlots},
 * {@link Md3StructuredInputTags} and {@link Md3StructuredInputWizard}. Shares
 * its API with `StructuredInput` from `@nucleux/structured-input`.
 */
export const Md3StructuredInput = React.forwardRef<HTMLDivElement, Md3StructuredInputProps>(
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
      <Md3Card
        ref={ref}
        variant="outlined"
        className={cn("font-md", "flex flex-col gap-4 rounded-md-lg p-5 animate-nx-fade-in motion-reduce:animate-none", className)}
        {...props}
      >
        <p id={questionId} className="text-base font-medium tracking-[0.15px] text-md-on-surface">
          {question}
        </p>
        <div
          ref={groupRef}
          role={multiple ? "group" : "radiogroup"}
          aria-labelledby={questionId}
          className="flex flex-col gap-1"
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
                  "relative flex min-h-12 items-center gap-4 overflow-hidden rounded-md-md px-3 py-2 text-left text-sm transition-colors duration-200 motion-reduce:transition-none",
                  stateLayer,
                  "outline-none focus-visible:ring-2 focus-visible:ring-md-primary",
                  active
                    ? "bg-md-secondary-container text-md-on-secondary-container"
                    : "text-md-on-surface",
                )}
              >
                {multiple ? (
                  <span
                    className={cn(
                      "relative inline-flex size-[18px] shrink-0 items-center justify-center rounded-[2px] border-2 transition-colors [&_svg]:size-3.5",
                      active ? "border-md-primary bg-md-primary text-md-on-primary" : "border-md-on-surface-variant",
                    )}
                  >
                    {active && <Check strokeWidth={3} aria-hidden="true" />}
                  </span>
                ) : (
                  <span
                    className={cn(
                      "relative inline-flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      active ? "border-md-primary" : "border-md-on-surface-variant",
                    )}
                  >
                    <span
                      className={cn(
                        "size-2.5 rounded-full bg-md-primary transition-transform duration-200 motion-reduce:transition-none",
                        active ? "scale-100" : "scale-0",
                      )}
                    />
                  </span>
                )}
                <span className="relative flex-1">{option.label}</span>
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
            className={cn(fieldClass, "h-12")}
          />
        )}
        <div className="flex items-center justify-end gap-2">
          {onSkip && (
            <Md3Button variant="text" onClick={onSkip}>
              {skipLabel}
            </Md3Button>
          )}
          {onSubmit && (
            <Md3Button
              variant="filled"
              onClick={() => onSubmit(selected, allowOther ? other : undefined)}
              disabled={selected.length === 0 && !(allowOther && other.trim())}
            >
              {submitLabel}
            </Md3Button>
          )}
        </div>
      </Md3Card>
    );
  },
);
Md3StructuredInput.displayName = "Md3StructuredInput";

/* -------------------------------------------------------------------------- */
/* Named slots                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Material 3 named slots: a short set of plain-language MD3 outlined fields
 * (2–4) that fill a prompt template — text fields or native selects with
 * visible labels and helper text, an optional freeform override, and a submit
 * that never requires every field. Agent-suggested values carry a
 * primary-container “Suggested” mark with their reason and turn into a neutral
 * “Edited by you” once changed; the component never changes a value the person
 * set. Shares its API with `StructuredInputSlots`.
 */
export const Md3StructuredInputSlots = React.forwardRef<HTMLFormElement, Md3StructuredInputSlotsProps>(
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
        className={cn("font-md", "grid grid-cols-1 gap-x-4 gap-y-3.5 text-md-on-surface sm:grid-cols-2", className)}
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) onSubmit?.(values, extra);
        }}
        {...props}
      >
        {(title != null || aside != null) && (
          <div className={cn("-mb-0.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 sm:col-span-2", headerClassName)}>
            <h3 id={titleId} className="inline-flex items-center gap-2 text-base font-medium text-md-on-surface">
              {icon != null && (
                <span aria-hidden="true" className="inline-flex shrink-0 text-md-primary [&_svg]:size-5">
                  {icon}
                </span>
              )}
              {title}
            </h3>
            {aside != null && <div className="text-xs text-md-on-surface-variant">{aside}</div>}
          </div>
        )}
        {slots.map((slot) => {
          const id = `${baseId}-${slot.name}`;
          const helperId = `${id}-helper`;
          const isEdited = !!edited[slot.name];
          const mark = slot.suggested ? (isEdited ? "edited" : "suggested") : null;
          const describedBy = slot.helper || mark === "suggested" ? helperId : undefined;
          const type = structuredSlotType(slot);
          return (
            <div key={slot.name} className={cn("flex min-w-0 flex-col gap-1", slot.wide && "sm:col-span-2")}>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <label
                  id={`${id}-label`}
                  htmlFor={id}
                  className={cn(
                    "tracking-[0.1px]",
                    title != null ? "text-[13px] font-medium leading-[18px] text-md-on-surface" : "text-xs font-medium tracking-[0.5px] text-md-on-surface-variant",
                  )}
                >
                  {slot.label}
                  {slot.required && <span aria-hidden="true"> *</span>}
                </label>
                {mark && (
                  <span
                    className={cn(
                      "inline-flex h-6 items-center gap-1 rounded-md-sm px-2 text-[11px] font-medium tracking-[0.5px] [&_svg]:size-3.5",
                      mark === "suggested"
                        ? "bg-md-primary-container text-md-on-primary-container"
                        : "bg-md-surface-container-high text-md-on-surface-variant",
                    )}
                  >
                    {mark === "suggested" ? <Sparkles aria-hidden="true" /> : <UserPen aria-hidden="true" />}
                    {mark === "suggested" ? "Suggested" : "Edited by you"}
                  </span>
                )}
              </div>
              {type === "select" && slot.options ? (
                <select
                  id={id}
                  value={values[slot.name] ?? ""}
                  aria-describedby={describedBy}
                  aria-required={slot.required || undefined}
                  onChange={(e) => setValue(slot.name, e.target.value)}
                  className={cn(fieldClass, "cursor-pointer", !values[slot.name] && "text-md-on-surface-variant")}
                >
                  <option value="" disabled>
                    {slot.placeholder ?? "Choose…"}
                  </option>
                  {slot.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {typeof o.label === "string" || typeof o.label === "number" ? o.label : o.value}
                    </option>
                  ))}
                </select>
              ) : type === "segmented" && slot.options ? (
                <Md3SegmentedButton
                  id={id}
                  aria-labelledby={`${id}-label`}
                  aria-describedby={describedBy}
                  value={values[slot.name] ?? ""}
                  onValueChange={(v) => setValue(slot.name, typeof v === "string" ? v : (v[0] ?? ""))}
                  className="h-11 w-full"
                >
                  {slot.options.map((o) => (
                    <Md3SegmentedButtonItem key={o.value} value={o.value} className="h-full flex-1 px-1.5 text-[13px] leading-[18px] [&_svg]:hidden">
                      {o.label}
                    </Md3SegmentedButtonItem>
                  ))}
                </Md3SegmentedButton>
              ) : type === "tags" ? (
                <div className={cn(fieldClass, "flex h-auto min-h-11 flex-wrap items-center gap-2 px-2 py-1.5 focus-within:border-md-primary")}>
                  {splitStructuredTags(values[slot.name]).map((t, _i, all) => (
                    <Md3Chip
                      key={t}
                      variant="input"
                      onRemove={() => setValue(slot.name, all.filter((x) => x !== t).join(", "))}
                    >
                      {t}
                    </Md3Chip>
                  ))}
                  <input
                    id={id}
                    placeholder={slot.placeholder ?? "Add…"}
                    aria-describedby={describedBy}
                    onKeyDown={(e) => {
                      const el = e.currentTarget;
                      if ((e.key === "Enter" || e.key === ",") && el.value.trim()) {
                        e.preventDefault();
                        const tags = splitStructuredTags(values[slot.name]);
                        if (!tags.includes(el.value.trim())) setValue(slot.name, [...tags, el.value.trim()].join(", "));
                        el.value = "";
                      }
                    }}
                    className="min-w-16 flex-1 bg-transparent px-2 text-base outline-none placeholder:text-md-on-surface-variant"
                  />
                </div>
              ) : (
                <input
                  id={id}
                  type={type === "date" ? "date" : "text"}
                  value={values[slot.name] ?? ""}
                  placeholder={slot.placeholder}
                  aria-describedby={describedBy}
                  aria-required={slot.required || undefined}
                  onChange={(e) => setValue(slot.name, e.target.value)}
                  className={fieldClass}
                />
              )}
              {describedBy && (
                <p id={helperId} className="text-xs text-md-on-surface-variant">
                  {mark === "suggested" ? `Suggested ${slot.suggested}. ` : ""}
                  {slot.helper}
                </p>
              )}
            </div>
          );
        })}
        {freeform && (
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label
              htmlFor={`${baseId}-freeform`}
              className="text-xs font-medium tracking-[0.5px] text-md-on-surface-variant"
            >
              {freeformLabel}
            </label>
            <textarea
              id={`${baseId}-freeform`}
              rows={2}
              value={extra}
              placeholder="Say it in your own words — this overrides the fields above"
              onChange={(e) => setExtra(e.target.value)}
              className={cn(fieldClass, "h-auto resize-none py-3")}
            />
          </div>
        )}
        {(onSubmit || onCancel || showProgress) && (
          <div className="-mt-0.5 flex flex-wrap items-center gap-1 sm:col-span-2">
            {showProgress && (
              <span className="text-xs text-md-on-surface-variant" aria-live="polite">
                {filledCount} of {slots.length} filled
              </span>
            )}
            <span className="flex-1" />
            {onCancel && (
              <Md3Button type="button" variant="text" onClick={onCancel} className="px-4">
                {cancelLabel}
              </Md3Button>
            )}
            {onSubmit && (
              <Md3Button type="submit" variant="filled" disabled={!canSubmit} className="px-4">
                {submitLabel}
              </Md3Button>
            )}
          </div>
        )}
      </form>
    );
  },
);
Md3StructuredInputSlots.displayName = "Md3StructuredInputSlots";

/* -------------------------------------------------------------------------- */
/* Tagged input                                                                */
/* -------------------------------------------------------------------------- */

// Same defaults as the twin (internal there).
const DEFAULT_TRIGGERS: StructuredInputTagTrigger[] = [
  { trigger: "@", label: "Person" },
  { trigger: "p:", label: "Project" },
  { trigger: "/", label: "File" },
];

/** MD3 tonal roles for tag chips, cycled per trigger. */
const TAG_TONES = [
  "bg-md-primary-container text-md-on-primary-container",
  "bg-md-secondary-container text-md-on-secondary-container",
  "bg-md-tertiary-container text-md-on-tertiary-container",
  "bg-md-surface-container-high text-md-on-surface",
];

/**
 * Material 3 tagged input: a prompt field (MD3 outlined) where typed prefixes
 * (`@` person, `p:` project, `/` file — configurable) become removable input
 * chips in tonal containers, with type-ahead suggestions as MD3 suggestion
 * chips. Backspace on an empty field removes the last tag; Enter sends. Tags
 * are optional — plain text always works. Shares its API (and
 * `structuredPartsToText`) with `StructuredInputTags`.
 */
export const Md3StructuredInputTags = React.forwardRef<HTMLDivElement, Md3StructuredInputTagsProps>(
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
      <div ref={ref} className={cn("font-md", "flex flex-col gap-2 text-md-on-surface", className)} {...props}>
        <div
          className={cn(
            "flex min-h-14 flex-wrap items-center gap-1.5 rounded-md-xs border border-md-outline bg-transparent px-3 py-2 text-base text-md-on-surface transition-colors",
            "hover:border-md-on-surface focus-within:border-md-primary focus-within:ring-1 focus-within:ring-inset focus-within:ring-md-primary",
          )}
          onClick={() => inputRef.current?.focus()}
        >
          {parts.map((part, i) =>
            part.type === "text" ? (
              <span key={i}>{part.text}</span>
            ) : (
              <span
                key={i}
                className={cn(
                  "inline-flex h-7 items-center gap-0.5 rounded-md-sm pl-2 pr-0.5 text-sm font-medium animate-nx-fade-in motion-reduce:animate-none",
                  toneFor(part.trigger),
                )}
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
                  className={cn(
                    "relative inline-flex size-6 items-center justify-center overflow-hidden rounded-full [&_svg]:size-3.5",
                    stateLayer,
                    "outline-none focus-visible:ring-2 focus-visible:ring-md-primary",
                  )}
                >
                  <X className="relative" aria-hidden="true" />
                </button>
              </span>
            ),
          )}
          <input
            ref={inputRef}
            type="text"
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
            className="h-8 min-w-[8rem] flex-1 bg-transparent text-base text-md-on-surface outline-none placeholder:text-md-on-surface-variant"
          />
        </div>
        <p id={hintId} className="sr-only">
          {triggers.map((t) => `${t.trigger} for ${t.label.toLowerCase()}`).join(", ")}. Space turns a tag into a
          chip; Backspace removes the last one; Enter sends.
        </p>
        {activeTrigger && suggestions.length > 0 && (
          <div role="group" aria-label={`${activeTrigger.label} suggestions`} className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <Md3Chip
                key={s}
                variant="suggestion"
                onClick={() => {
                  flush(draft, { trigger: activeTrigger.trigger, value: s });
                  inputRef.current?.focus();
                }}
              >
                {activeTrigger.trigger}
                {s}
              </Md3Chip>
            ))}
          </div>
        )}
        {onSubmit && (
          <div className="flex justify-end">
            <Md3Button variant="filled" onClick={submit} disabled={parts.length === 0 && draft.trim() === ""}>
              {submitLabel}
            </Md3Button>
          </div>
        )}
      </div>
    );
  },
);
Md3StructuredInputTags.displayName = "Md3StructuredInputTags";

/* -------------------------------------------------------------------------- */
/* Wizard step                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Material 3 wizard step: a multi-step MD3 card for high-stakes prompts
 * (legal, HR, medical) — a segmented progress track in the primary colour,
 * “Step 2 of 3 · Audience”, the step's question and fields (children), and
 * Back / Next / Generate as MD3 text and filled buttons. Focus moves to the
 * step heading when the step changes; nothing forces every step to be filled
 * before generating. Shares its API with `StructuredInputWizard`.
 */
export const Md3StructuredInputWizard = React.forwardRef<HTMLDivElement, Md3StructuredInputWizardProps>(
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
      <Md3Card
        ref={ref}
        variant="outlined"
        role="group"
        aria-labelledby={headingId}
        className={cn("font-md", "flex flex-col gap-3 rounded-md-lg p-4", className)}
        {...props}
      >
        <div className="flex gap-1" aria-hidden="true">
          {steps.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors duration-300 motion-reduce:transition-none",
                i <= step ? "bg-md-primary" : "bg-md-secondary-container",
              )}
            />
          ))}
        </div>
        <div className="flex flex-col gap-1">
          <p
            ref={headingRef}
            id={headingId}
            tabIndex={-1}
            className="rounded-md-xs text-sm font-medium tracking-[0.1px] text-md-on-surface outline-none focus-visible:ring-2 focus-visible:ring-md-primary"
          >
            Step {step + 1} of {steps.length} · {steps[step]}
          </p>
          {description && <p className="text-sm text-md-on-surface-variant">{description}</p>}
        </div>
        {children}
        <div className="flex items-center gap-2">
          {step > 0 && (
            <Md3Button variant="text" onClick={() => go(step - 1)}>
              Back
            </Md3Button>
          )}
          <span className="flex-1" />
          {!last && allowEarlySubmit && onSubmit && (
            <Md3Button variant="text" onClick={onSubmit}>
              {submitLabel} now
            </Md3Button>
          )}
          {last ? (
            onSubmit && (
              <Md3Button variant="filled" onClick={onSubmit}>
                {submitLabel}
              </Md3Button>
            )
          ) : (
            <Md3Button variant="filled" onClick={() => go(step + 1)}>
              Next
            </Md3Button>
          )}
        </div>
      </Md3Card>
    );
  },
);
Md3StructuredInputWizard.displayName = "Md3StructuredInputWizard";

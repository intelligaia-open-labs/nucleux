import * as React from "react";
import { Check, ChevronDown, Info, MessagesSquare, RefreshCw, Sparkles, X } from "lucide-react";
import { cn } from "@nucleux/utils";
import { Button } from "@nucleux/button";
import { Checkbox } from "@nucleux/checkbox";
import { Input } from "@nucleux/input";
import { OpenInput } from "@nucleux/open-input";
import { Popover, PopoverContent, PopoverTrigger } from "@nucleux/popover";
import { Slider } from "@nucleux/slider";

/* ─────────────────────────────── Types & data ─────────────────────────────── */

/** The id a described (custom) tone takes as the value. */
export const VOICE_TONE_CUSTOM = "custom";

/** One named tone: what it is called, one line on how it sounds, and a sample sentence written in it. */
export interface VoiceToneOption {
  /** Stable id passed to `onValueChange`, e.g. `"professional"`. */
  id: string;
  /** Display name, e.g. `"Professional"`. */
  name: string;
  /** One short line on how it sounds, e.g. `"Formal, clear"`. */
  description?: string;
  /** One sentence written in this tone — a calibration preview, never a sample document. */
  sample?: string;
  /** Marks the agent's recommendation in words. It is never applied without a choice. */
  recommended?: boolean;
}

/** One stylistic rule in the rules list, e.g. `{ id: "no-emojis", label: "No emojis" }`. */
export interface VoiceToneRule {
  id: string;
  label: string;
}

/** What is sent with a request: a setting beside the prompt — the prompt text itself is never edited. */
export interface VoiceToneSetting {
  /** The chosen tone id, `"custom"` for a described tone, or `null` for the agent's default voice. */
  tone: string | null;
  /** The described tone, present when `tone === "custom"`. */
  customTone?: string;
  /** The ids of the rules that are on. */
  rules: string[];
}

/**
 * Where the scaffold sits. `"settings"` (default): a preferences panel — tone presets, a rules list
 * and a sample sentence. `"composer"`: a composer with a Tone chip that opens the tone picker.
 * `"chip"`: only the Tone chip and its picker, to drop into your own composer's toolbar.
 */
export type VoiceToneVariant = "settings" | "composer" | "chip";

/**
 * How tones are chosen. `"cards"` (default): tone cards with a description. `"list"`: rows with the
 * description and sample line. `"segmented"`: a compact segmented control (names only, up to four).
 * `"slider"`: a linear scale from the first tone to the last.
 */
export type VoiceToneLayout = "cards" | "list" | "segmented" | "slider";

/** The one quiet line shown after a change: switched tone, described tone, or removed tone (with Undo). */
export type VoiceToneNotice = "changed" | "custom" | "removed";

export interface VoiceToneProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "onSubmit" | "defaultValue"> {
  /** Where the scaffold sits. Defaults to `"settings"`. */
  variant?: VoiceToneVariant;
  /** How tones are chosen. Defaults to `"cards"`. */
  layout?: VoiceToneLayout;
  /** The tones on offer — three or four familiar ones. Defaults to {@link defaultVoiceTones}. Pass `[]` for a rules-only panel. */
  tones?: VoiceToneOption[];
  /** Chosen tone id (controlled). `null` is the agent's default voice; `"custom"` a described tone. */
  value?: string | null;
  /** Initial tone id (uncontrolled). Defaults to `null`. */
  defaultValue?: string | null;
  /** Called when the tone is chosen, switched, removed or restored. */
  onValueChange?: (value: string | null) => void;
  /** Offer “Or describe a tone”. Defaults to `true` in the composer and chip, `false` in settings. */
  allowCustom?: boolean;
  /** The described tone (controlled). */
  customTone?: string;
  /** Initial described tone (uncontrolled). */
  defaultCustomTone?: string;
  /** Called when a described tone is applied. */
  onCustomToneChange?: (text: string) => void;
  /** The rules list (settings panel). The composer variants send the rules that are on with each request. */
  rules?: VoiceToneRule[];
  /** Ids of the rules that are on (controlled). */
  ruleValues?: string[];
  /** Ids of the rules that are on initially (uncontrolled). */
  defaultRuleValues?: string[];
  /** Called with the ids of the rules that are on. */
  onRulesChange?: (ids: string[]) => void;
  /** Show the sample sentence for the tone in focus or chosen. Defaults to `true`. */
  showSample?: boolean;
  /** Let people remove the tone from the composer (with Undo). Defaults to `true`. */
  removable?: boolean;
  /** Picker open (controlled), for the composer and chip variants. */
  open?: boolean;
  /** Picker open initially (uncontrolled). */
  defaultOpen?: boolean;
  /** Called when the picker opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Seed the quiet line, e.g. to show a state in docs. A seeded `"removed"` line's Undo restores the
   * recommended (or first) tone.
   */
  defaultNotice?: VoiceToneNotice | null;
  /** Name of the setting — the chip, picker and group label. Defaults to `"Tone"`. */
  label?: string;
  /** Who writes, for the notices. Defaults to `"Aria"`. */
  agentName?: string;
  /** Composer text (controlled). The tone never edits it. */
  draft?: string;
  /** Initial composer text (uncontrolled). Cleared after a send. */
  defaultDraft?: string;
  /** Called when the composer text changes. */
  onDraftChange?: (text: string) => void;
  /** Called on send with the trimmed text and the tone setting, sent beside the prompt. */
  onSubmit?: (text: string, setting: VoiceToneSetting) => void;
  /** Composer placeholder, also its accessible name. Defaults to `"Describe what to write…"`. */
  placeholder?: string;
  /** Show the agent as busy — the send button becomes a stop button. */
  loading?: boolean;
  /** Called by the stop button while `loading`. */
  onStop?: () => void;
  /** More composer tools, placed after the Tone chip. */
  actions?: React.ReactNode;
}

/** The three named presets of the tone-presets variant. */
export const defaultVoiceTones: VoiceToneOption[] = [
  {
    id: "professional",
    name: "Professional",
    description: "Formal, clear",
    sample: "Please find the updated proposal attached for your review.",
  },
  {
    id: "friendly",
    name: "Friendly",
    description: "Warm, easy",
    sample: "Hey! Attached is the updated proposal — let me know what you think!",
  },
  { id: "direct", name: "Direct", description: "Brief, blunt", sample: "Proposal attached. Review by Friday." },
];

/** The rules of the rules-list variant. */
export const defaultVoiceToneRules: VoiceToneRule[] = [
  { id: "no-emojis", label: "No emojis" },
  { id: "uk-english", label: "UK English spelling" },
  { id: "no-passive", label: "Avoid passive voice" },
];

/* ──────────────────────────────── Shared logic ─────────────────────────────── */

function useControllable<T>(value: T | undefined, initial: T, onChange?: (v: T) => void) {
  const [internal, setInternal] = React.useState<T>(initial);
  const controlled = value !== undefined;
  const current = controlled ? (value as T) : internal;
  const set = React.useCallback(
    (next: T) => {
      if (!controlled) setInternal(next);
      onChange?.(next);
    },
    [controlled, onChange],
  );
  return [current, set] as const;
}

interface NoticeState {
  kind: VoiceToneNotice;
  undo?: { tone: string | null; custom: string };
}

/**
 * The family-independent state, handlers and keyboard model of Voice & Tone, shared by
 * `VoiceTone` and `Md3VoiceTone` so both behave identically. Returns everything a renderer needs:
 * the tone and rules, the picker's open state, radio props with roving focus, the quiet line, and
 * the composer draft and send.
 */
export function useVoiceTone(props: VoiceToneProps) {
  const {
    variant = "settings",
    layout = "cards",
    tones = defaultVoiceTones,
    label = "Tone",
    agentName = "Aria",
    showSample = true,
    removable = true,
  } = props;
  const allowCustom = props.allowCustom ?? variant !== "settings";
  const inPicker = variant !== "settings";

  const [tone, setTone] = useControllable<string | null>(props.value, props.defaultValue ?? null, props.onValueChange);
  const [customTone, setCustomTone] = useControllable(
    props.customTone,
    props.defaultCustomTone ?? "",
    props.onCustomToneChange,
  );
  const [customDraft, setCustomDraft] = React.useState(customTone);
  const [rules, setRules] = useControllable(props.ruleValues, props.defaultRuleValues ?? [], props.onRulesChange);
  const [open, setOpen] = useControllable(props.open, props.defaultOpen ?? false, props.onOpenChange);
  const [draft, setDraft] = useControllable(props.draft, props.defaultDraft ?? "", props.onDraftChange);
  const [notice, setNotice] = React.useState<NoticeState | null>(
    props.defaultNotice ? { kind: props.defaultNotice } : null,
  );
  const [announcement, setAnnouncement] = React.useState("");
  const [peek, setPeek] = React.useState<string | null>(null);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const radioRefs = React.useRef<(HTMLElement | null)[]>([]);
  const [refocus, setRefocus] = React.useState(0);
  React.useEffect(() => {
    if (refocus) triggerRef.current?.focus();
  }, [refocus]);

  const uid = React.useId();
  const ids = {
    picker: `${uid}-picker`,
    title: `${uid}-title`,
    presets: `${uid}-presets`,
    rules: `${uid}-rules`,
    custom: `${uid}-custom`,
    sample: `${uid}-sample`,
    rule: (id: string) => `${uid}-rule-${id}`,
  };

  const recommended = tones.find((t) => t.recommended);
  const isCustom = tone === VOICE_TONE_CUSTOM;
  const nameOf = (id: string | null, custom = customTone) =>
    id == null ? null : id === VOICE_TONE_CUSTOM ? custom || "Custom" : (tones.find((t) => t.id === id)?.name ?? id);
  const toneName = nameOf(tone);

  const closePicker = (focusTrigger: boolean) => {
    if (open) setOpen(false);
    if (focusTrigger && inPicker) setRefocus((n) => n + 1);
  };

  const choose = (id: string, close = false) => {
    if (id !== tone) {
      setNotice(tone != null ? { kind: "changed" } : null);
      setTone(id);
      setAnnouncement(`${label}: ${nameOf(id)}.`);
    }
    if (close) closePicker(true);
  };

  const applyCustom = () => {
    const text = customDraft.trim();
    if (!text) return;
    setCustomTone(text);
    setTone(VOICE_TONE_CUSTOM);
    setNotice({ kind: "custom" });
    setAnnouncement(`${label}: ${text}.`);
    closePicker(true);
  };

  const remove = () => {
    setNotice({ kind: "removed", undo: { tone, custom: customTone } });
    setTone(null);
    setAnnouncement(`${label} removed.`);
    closePicker(true);
  };

  const undo = () => {
    const back = notice?.undo ?? { tone: recommended?.id ?? tones[0]?.id ?? null, custom: customTone };
    if (back.custom !== customTone) setCustomTone(back.custom);
    setTone(back.tone);
    setNotice(null);
    setAnnouncement(back.tone ? `${label}: ${nameOf(back.tone, back.custom)}.` : "");
    setRefocus((n) => n + 1);
  };

  const toggleRule = (id: string, on: boolean) => {
    const next = new Set(rules);
    if (on) next.add(id);
    else next.delete(id);
    const order = (props.rules ?? []).map((r) => r.id);
    setRules([...next].sort((a, b) => order.indexOf(a) - order.indexOf(b)));
  };

  const setting: VoiceToneSetting = {
    tone,
    ...(isCustom ? { customTone } : {}),
    rules,
  };

  const submit = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    props.onSubmit?.(clean, setting);
    if (props.draft === undefined) setDraft("");
    else props.onDraftChange?.("");
    setNotice(null);
  };

  // Close the picker on an outside press or Escape (Escape returns focus to the chip).
  React.useEffect(() => {
    if (!open || !inPicker) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, inPicker, setOpen]);

  // Opening the picker moves focus to the chosen tone (or the first).
  const selectedIndex = tones.findIndex((t) => t.id === tone);
  const tabStop = selectedIndex >= 0 ? selectedIndex : 0;
  React.useEffect(() => {
    if (open && inPicker) radioRefs.current[tabStop]?.focus();
    if (!open) setPeek(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onPickerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      closePicker(true);
    }
  };

  /** Props for one tone radio: roving tabindex; arrows / Home / End move and choose; click chooses (and closes the picker). */
  const radioProps = (t: VoiceToneOption, index: number) => ({
    ref: (el: HTMLElement | null) => {
      radioRefs.current[index] = el;
    },
    type: "button" as const,
    role: "radio" as const,
    "aria-checked": t.id === tone,
    tabIndex: index === tabStop ? 0 : -1,
    onClick: () => choose(t.id, inPicker),
    onFocus: () => inPicker && setPeek(t.id),
    onMouseEnter: () => inPicker && setPeek(t.id),
    onKeyDown: (e: React.KeyboardEvent) => {
      const last = tones.length - 1;
      let next: number | null = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = index === last ? 0 : index + 1;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = index === 0 ? last : index - 1;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = last;
      if (next === null) return;
      e.preventDefault();
      radioRefs.current[next]?.focus();
      choose(tones[next]!.id);
    },
  });

  /** The slider layout: index of the chosen tone along the scale. */
  const sliderIndex = selectedIndex >= 0 ? selectedIndex : 0;
  const sliderRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    // The slider reads its position as the tone's name, not a number.
    const thumb = sliderRef.current?.querySelector('[role="slider"]');
    thumb?.setAttribute("aria-valuetext", tones[sliderIndex]?.name ?? "");
  });
  const onSliderChange = (i: number) => {
    const t = tones[Math.round(i)];
    if (t) choose(t.id);
  };

  const sampleTone: VoiceToneOption | undefined = inPicker
    ? (tones.find((t) => t.id === (peek ?? tone)) ?? (isCustom && !peek ? undefined : (recommended ?? tones[0])))
    : tones.find((t) => t.id === tone);

  const noticeText =
    notice?.kind === "custom"
      ? `${agentName} will match your description as closely as it can; the facts stay the same.`
      : notice?.kind === "changed"
        ? `${label} changed to ${toneName ?? "the default"}. What the reply says stays the same.`
        : notice?.kind === "removed"
          ? `${label} removed — ${agentName} will use its default voice.`
          : null;

  return {
    variant,
    layout,
    tones,
    label,
    agentName,
    showSample,
    removable,
    allowCustom,
    inPicker,
    tone,
    toneName,
    isCustom,
    customTone,
    customDraft,
    setCustomDraft,
    applyCustom,
    rules,
    ruleList: props.rules ?? [],
    toggleRule,
    open,
    setOpen,
    choose,
    remove,
    undo,
    notice: notice?.kind ?? null,
    noticeText,
    announcement,
    draft,
    setDraft,
    submit,
    setting,
    sampleTone,
    setPeek,
    radioProps,
    sliderIndex,
    sliderRef,
    onSliderChange,
    onPickerKeyDown,
    rootRef,
    triggerRef,
    ids,
    /** Accessible name of the chip's value button and its remove button. */
    chipLabel: toneName ? `${label} ${toneName} — change` : label,
    removeLabel: `Remove ${label.toLowerCase()} ${toneName ?? ""}`.trim(),
    pickerTitle: `Choose a ${label.toLowerCase()}`,
    pickerSubtitle: "How the reply should sound. What it says stays the same.",
  };
}

/** The value returned by {@link useVoiceTone}. */
export type VoiceToneState = ReturnType<typeof useVoiceTone>;

/* ─────────────────────────────── shadcn renderers ─────────────────────────── */

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const overline = "text-[11px] font-semibold uppercase leading-4 tracking-[0.1em] text-muted-foreground";

function Recommended() {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-brand">
      <Sparkles className="size-3" aria-hidden="true" />
      Recommended
    </span>
  );
}

function ToneChoices({ vt }: { vt: VoiceToneState }) {
  const { tones, layout, inPicker } = vt;
  const group = {
    role: "radiogroup" as const,
    "aria-label": inPicker ? vt.label : undefined,
    "aria-labelledby": inPicker ? undefined : vt.ids.presets,
    onMouseLeave: () => vt.setPeek(null),
  };

  if (layout === "slider") {
    const first = tones[0];
    const last = tones[tones.length - 1];
    return (
      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-[11px] font-semibold text-muted-foreground" aria-hidden="true">
          <span>{first?.name}</span>
          <span>{last?.name}</span>
        </div>
        <Slider
          ref={vt.sliderRef}
          min={0}
          max={Math.max(1, tones.length - 1)}
          step={1}
          value={vt.sliderIndex}
          onValueChange={vt.onSliderChange}
          aria-label={vt.label}
        />
        <p className="text-center text-xs text-muted-foreground" aria-hidden="true">
          {tones[vt.sliderIndex]?.name}
        </p>
      </div>
    );
  }

  if (layout === "segmented") {
    return (
      <div
        {...group}
        className="inline-flex w-fit flex-wrap divide-x divide-border overflow-hidden rounded-lg border border-border"
      >
        {tones.slice(0, 4).map((t, i) => {
          const on = t.id === vt.tone;
          return (
            <button
              key={t.id}
              {...vt.radioProps(t, i)}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 px-3.5 text-sm transition-colors focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                on ? "bg-accent font-medium text-accent-foreground" : "text-foreground/80 hover:bg-accent/60",
              )}
            >
              {on && <Check className="size-3.5" aria-hidden="true" />}
              {t.name}
            </button>
          );
        })}
      </div>
    );
  }

  if (layout === "list") {
    return (
      <div {...group} className="flex flex-col gap-0.5">
        {tones.map((t, i) => {
          const on = t.id === vt.tone;
          return (
            <button
              key={t.id}
              {...vt.radioProps(t, i)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                focusRing,
                on ? "bg-accent text-accent-foreground" : "hover:bg-accent/60",
              )}
            >
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex flex-wrap items-center gap-2 text-sm font-medium text-foreground">
                  {t.name}
                  {t.recommended && <Recommended />}
                </span>
                {t.description && <span className="text-xs text-muted-foreground">{t.description}</span>}
                {vt.showSample && t.sample && (
                  <span className="text-xs italic text-foreground/80">“{t.sample}”</span>
                )}
              </span>
              {on && <Check className="size-4 shrink-0" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div {...group} className="grid grid-cols-[repeat(auto-fit,minmax(8.5rem,1fr))] gap-1.5">
      {tones.map((t, i) => {
        const on = t.id === vt.tone;
        return (
          <button
            key={t.id}
            {...vt.radioProps(t, i)}
            className={cn(
              "flex flex-col rounded-lg border px-2 py-2.5 transition-colors",
              focusRing,
              inPicker ? "min-h-[4.5rem] items-start gap-1 px-3 text-left" : "items-center gap-0.5 text-center",
              on
                ? "border-primary bg-muted/50 ring-[0.5px] ring-inset ring-primary"
                : "border-border bg-transparent hover:bg-accent/50",
            )}
          >
            <span
              className={cn(
                "flex w-full items-center gap-1.5 text-[13px] leading-5",
                !inPicker && "justify-center",
                on ? "font-semibold text-foreground" : "text-foreground/75",
                inPicker && "font-semibold text-foreground",
              )}
            >
              {t.name}
              {inPicker && on && <Check className="ml-auto size-4 shrink-0" aria-hidden="true" />}
            </span>
            {t.description && <span className="text-[11px] leading-4 text-muted-foreground">{t.description}</span>}
            {t.recommended && <Recommended />}
          </button>
        );
      })}
    </div>
  );
}

function CustomRow({ vt }: { vt: VoiceToneState }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={vt.ids.custom} className={overline}>
        Or describe a {vt.label.toLowerCase()}
      </label>
      <div className="flex items-center gap-2">
        <Input
          id={vt.ids.custom}
          value={vt.customDraft}
          placeholder="e.g. calm, plain English"
          onChange={(e) => vt.setCustomDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              vt.applyCustom();
            }
          }}
        />
        <Button type="button" variant="secondary" size="md" onClick={vt.applyCustom} disabled={!vt.customDraft.trim()}>
          Use
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Best effort — {vt.agentName} matches it as closely as it can.</p>
    </div>
  );
}

function Sample({ vt, framed }: { vt: VoiceToneState; framed?: boolean }) {
  const t = vt.sampleTone;
  const text = t?.sample;
  if (!vt.showSample || vt.layout === "segmented" || (!text && !vt.isCustom)) return null;
  return (
    <div
      className={cn(
        "flex flex-col gap-1",
        framed ? "rounded-lg bg-muted/50 px-3 py-2.5" : "bg-muted/40 px-[18px] pb-3.5 pt-3",
      )}
    >
      <p className={overline}>{framed && t ? `Sample · ${t.name}` : "Sample output"}</p>
      <p className="text-[13px] italic leading-5 text-foreground" aria-live="polite">
        {text ? `“${text}”` : `${vt.agentName} will match “${vt.customTone}” as closely as it can.`}
      </p>
    </div>
  );
}

function Notice({ vt }: { vt: VoiceToneState }) {
  const Icon = vt.notice === "changed" ? RefreshCw : vt.notice === "removed" ? X : Info;
  return (
    <div role="status" className="min-h-0">
      {vt.noticeText ? (
        <p className="flex flex-wrap items-center gap-2 px-1 pb-1.5 text-sm text-muted-foreground">
          <Icon className="size-4 shrink-0 text-foreground" aria-hidden="true" />
          <span className="min-w-0 flex-1">{vt.noticeText}</span>
          {vt.notice === "removed" && (
            <Button type="button" variant="link" size="sm" className="h-auto px-1 font-semibold" onClick={vt.undo}>
              Undo
            </Button>
          )}
        </p>
      ) : (
        <span className="sr-only">{vt.announcement}</span>
      )}
    </div>
  );
}

function Picker({ vt }: { vt: VoiceToneState }) {
  return (
    <PopoverContent
      role="dialog"
      aria-labelledby={vt.ids.title}
      onKeyDown={vt.onPickerKeyDown}
      className="bottom-full top-auto mb-2 mt-0 flex w-[min(32rem,calc(100vw-2rem))] flex-col gap-2.5 rounded-xl p-2.5 motion-reduce:animate-none"
    >
      <div className="flex flex-col gap-0.5 px-1 pt-0.5">
        <p id={vt.ids.title} className="text-sm font-semibold text-foreground">
          {vt.label}
          <span className="sr-only"> — {vt.pickerTitle.toLowerCase()}</span>
        </p>
        <p className="text-xs text-muted-foreground">{vt.pickerSubtitle}</p>
      </div>
      <ToneChoices vt={vt} />
      <Sample vt={vt} framed />
      {vt.allowCustom && (
        <div className="px-1 pb-1">
          <CustomRow vt={vt} />
        </div>
      )}
    </PopoverContent>
  );
}

function ToneChip({ vt }: { vt: VoiceToneState }) {
  const chev = (
    <ChevronDown
      className={cn("size-4 opacity-70 transition-transform motion-reduce:transition-none", vt.open && "rotate-180")}
      aria-hidden="true"
    />
  );
  return (
    <div ref={vt.rootRef} className="inline-flex [&>div]:static">
      <Popover open={vt.open} onOpenChange={vt.setOpen}>
        {vt.toneName ? (
          <span className="inline-flex h-8 items-center rounded-lg bg-accent text-sm text-accent-foreground">
            <PopoverTrigger
              ref={vt.triggerRef}
              aria-label={vt.chipLabel}
              className={cn(
                "inline-flex h-full items-center gap-1.5 rounded-l-lg pl-2.5 pr-1.5 hover:bg-foreground/5",
                !vt.removable && "rounded-r-lg pr-2.5",
                focusRing,
              )}
            >
              <MessagesSquare className="size-4" aria-hidden="true" />
              <span>{vt.label}</span>
              <span className="max-w-[18ch] truncate font-semibold">{vt.toneName}</span>
              {chev}
            </PopoverTrigger>
            {vt.removable && (
              <button
                type="button"
                aria-label={vt.removeLabel}
                onClick={vt.remove}
                className={cn(
                  "inline-flex h-full w-7 items-center justify-center rounded-r-lg pr-0.5 hover:bg-foreground/5",
                  focusRing,
                )}
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            )}
          </span>
        ) : (
          <PopoverTrigger
            ref={vt.triggerRef}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm text-foreground transition-colors hover:bg-accent",
              vt.open && "border-ring",
              focusRing,
            )}
          >
            <MessagesSquare className="size-4" aria-hidden="true" />
            {vt.label}
            {chev}
          </PopoverTrigger>
        )}
        <Picker vt={vt} />
      </Popover>
    </div>
  );
}

function Settings({ vt }: { vt: VoiceToneState }) {
  const ruleList = vt.ruleList;
  return (
    <>
      <div className="flex flex-col gap-3.5 px-[18px] pb-4 pt-4">
        {vt.tones.length > 0 && (
          <div className="flex flex-col gap-2.5">
            <p id={vt.ids.presets} className={overline}>
              {vt.label} preset
            </p>
            <ToneChoices vt={vt} />
          </div>
        )}
        {vt.allowCustom && <CustomRow vt={vt} />}
        {ruleList.length > 0 && (
          <div role="group" aria-labelledby={vt.ids.rules} className="flex flex-col gap-2">
            <p id={vt.ids.rules} className={overline}>
              Rules
            </p>
            <div className="flex flex-col gap-1.5">
              {ruleList.map((r) => {
                const on = vt.rules.includes(r.id);
                return (
                  <label key={r.id} className="flex w-fit cursor-pointer items-center gap-2.5 text-[13px] text-foreground">
                    <Checkbox
                      checked={on}
                      onCheckedChange={(next) => vt.toggleRule(r.id, next)}
                      aria-labelledby={vt.ids.rule(r.id)}
                      className="size-[15px]"
                    />
                    <span id={vt.ids.rule(r.id)}>{r.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <Sample vt={vt} />
      <span role="status" className="sr-only">
        {vt.announcement}
      </span>
    </>
  );
}

/**
 * Voice & Tone — a prompt scaffold for how the agent should sound, never what it says. The default
 * `variant="settings"` is a preferences panel: named tone presets (a radio group with roving focus —
 * arrows, Home, End), an optional rules list (“No emojis”, “UK English spelling”) and a sample
 * sentence that recalibrates as the tone changes. `variant="composer"` puts a Tone chip in the
 * composer: it opens a picker of tone cards (or a list, segmented control or slider) with a sample
 * line for the tone in focus, the agent's recommendation marked but never applied, and “Or describe
 * a tone”; the chip then names the choice and can be changed or removed with Undo. The tone and the
 * rules travel with the request as a setting (`onSubmit(text, setting)`) — the prompt text is never
 * edited and nothing is sent on its own. `variant="chip"` is the chip and picker alone, for your own
 * composer.
 */
export const VoiceTone = React.forwardRef<HTMLDivElement, VoiceToneProps>((props, ref) => {
  const vt = useVoiceTone(props);
  const {
    variant: _v,
    layout: _l,
    tones: _t,
    value: _value,
    defaultValue: _dv,
    onValueChange: _ovc,
    allowCustom: _ac,
    customTone: _ct,
    defaultCustomTone: _dct,
    onCustomToneChange: _occ,
    rules: _r,
    ruleValues: _rv,
    defaultRuleValues: _drv,
    onRulesChange: _orc,
    showSample: _ss,
    removable: _rm,
    open: _o,
    defaultOpen: _do,
    onOpenChange: _ooc,
    defaultNotice: _dn,
    label: _lb,
    agentName: _an,
    draft: _d,
    defaultDraft: _dd,
    onDraftChange: _odc,
    onSubmit: _os,
    placeholder = "Describe what to write…",
    loading,
    onStop,
    actions,
    className,
    ...rest
  } = props;

  if (vt.variant === "settings") {
    return (
      <div
        ref={ref}
        role="group"
        aria-label="Voice and tone"
        data-variant="settings"
        className={cn(
          "w-full max-w-[30rem] overflow-hidden rounded-xl border border-border bg-background text-foreground",
          className,
        )}
        {...rest}
      >
        <Settings vt={vt} />
      </div>
    );
  }

  if (vt.variant === "chip") {
    return (
      <div ref={ref} data-variant="chip" className={cn("relative inline-flex flex-col gap-1", className)} {...rest}>
        <Notice vt={vt} />
        <ToneChip vt={vt} />
      </div>
    );
  }

  return (
    <div ref={ref} data-variant="composer" className={cn("relative flex w-full max-w-[42rem] flex-col", className)} {...rest}>
      <Notice vt={vt} />
      <OpenInput
        value={vt.draft}
        onValueChange={vt.setDraft}
        onSubmit={vt.submit}
        placeholder={placeholder}
        aria-label={placeholder}
        sendLabel="Send"
        loading={loading}
        onStop={onStop}
        className="rounded-3xl p-3 shadow-md focus-within:rounded-3xl"
        actions={
          <>
            <ToneChip vt={vt} />
            {actions}
          </>
        }
      />
    </div>
  );
});
VoiceTone.displayName = "VoiceTone";

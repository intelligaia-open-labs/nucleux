import * as React from "react";
import { AlertCircle, ArrowUp, Check, CircleHelp, Mic, Pencil, Plus, Sparkles, Undo2 } from "lucide-react";
import { cn } from "@nucleux/utils";
import { Button } from "@nucleux/button";
import { Checkbox } from "@nucleux/checkbox";
import { Switch } from "@nucleux/switch";
import { Spinner } from "@nucleux/spinner";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@nucleux/input-group";
import {
  RequestSettings,
  mergeRequestSettingsItems,
  type OpenInputProps,
  type RequestSettingsItem,
} from "@nucleux/open-input";

/* ─────────────────────────────── Types ─────────────────────────────── */

/**
 * How enhancement is offered, from the spec's variants:
 * "preview-diff" (default) shows the original and the enhanced prompt side by
 * side for review; "wand-button" applies the enhancement in place with Undo;
 * "auto-enhance-toggle" adds an on/off switch so short prompts are enhanced
 * before they are sent.
 */
export type PromptEnhancerVariant = "preview-diff" | "wand-button" | "auto-enhance-toggle";

/**
 * Where the enhancer is in its flow: "original" (their prompt, Enhance
 * available), "enhancing", "enhanced" (review open), "editing" (the
 * suggestion in a text field), "accepted" (composer updated, Undo offered),
 * "reverted" (Undo pressed) and "failed".
 */
export type PromptEnhancerState =
  | "original"
  | "enhancing"
  | "enhanced"
  | "editing"
  | "accepted"
  | "reverted"
  | "failed";

/** How the suggestion is presented: "split" (You wrote / Enhanced columns) or "inline" (one sentence with the additions marked). */
export type PromptEnhancerDiffStyle = "split" | "inline";

/**
 * Where enhancing starts from. "chip" (default): the Enhance tool in the composer. "settings": no
 * tool up front; a Request settings control (the tune icon) lists "Improve prompt", which starts
 * the enhance flow and shows the review.
 */
export type PromptEnhancerTrigger = "chip" | "settings";

/** One addition the enhancer proposes. */
export interface PromptEnhancerChange {
  /** Stable id, used to remove or restore the change. */
  id: string;
  /**
   * The text appended to the prompt, including its leading separator, e.g.
   * `" from the last quarter"` or `", grouped by recurring theme"`.
   */
  text: string;
  /** Why the change helps — shown under it when `explain` is on. */
  reason?: string;
  /** An assumption the change introduces (“Assumes you mean the last quarter.”), labelled as such. */
  assumption?: string;
}

/**
 * What `onEnhance` resolves with. With `changes`, the enhanced prompt is the
 * original plus every kept change (so each can be removed); without, `text`
 * is shown as the enhanced prompt.
 */
export interface PromptEnhancerSuggestion {
  /** The enhanced prompt, used when there are no `changes`. */
  text?: string;
  /** Additions, in order. */
  changes?: PromptEnhancerChange[];
}

/** One run of the marked suggestion: plain text, a kept addition, or a removed one. */
export interface PromptEnhancerSegment {
  type: "text" | "added" | "removed";
  text: string;
  /** The change's id for "added" / "removed" segments. */
  id?: string;
}

export interface PromptEnhancerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit" | "defaultValue" | "onChange">,
    /** The composer's own chrome, as on `OpenInput`: `onAdd` (the + button), `model` (the model chip), `onVoice` (the mic). */
    Pick<OpenInputProps, "onAdd" | "addLabel" | "add" | "model" | "onVoice" | "voiceLabel"> {
  /** The composer text (controlled). Omit and use `defaultValue` for an uncontrolled composer. */
  value?: string;
  /** Initial composer text when uncontrolled. */
  defaultValue?: string;
  /** Called whenever the composer text changes — typing, Use, Undo. */
  onValueChange?: (value: string) => void;
  /**
   * Produces the suggestion for a prompt. No model is called by the component:
   * the app supplies this. May be async; a rejection shows the failed state and
   * leaves the original untouched. `signal` aborts when the person cancels.
   */
  onEnhance?: (
    prompt: string,
    options: { signal: AbortSignal },
  ) => PromptEnhancerSuggestion | Promise<PromptEnhancerSuggestion>;
  /** Called with the trimmed text when the person sends. Without it the composer shows no send button. The enhancer never sends on its own. */
  onSubmit?: (value: string) => void;
  /** Called when the person uses the suggestion — the composer now holds `enhanced`. */
  onUse?: (enhanced: string, original: string) => void;
  /** Called when the person dismisses the suggestion and keeps their prompt. */
  onKeepOriginal?: () => void;
  /** Called when the person undoes Use — the composer holds `original` again. */
  onUndo?: (original: string) => void;
  /** Called on every state change. */
  onStateChange?: (state: PromptEnhancerState) => void;
  /** "preview-diff" (default), "wand-button" or "auto-enhance-toggle". */
  variant?: PromptEnhancerVariant;
  /** "split" (default) or "inline". */
  diffStyle?: PromptEnhancerDiffStyle;
  /** Mark each addition and list the changes with a checkbox each. Defaults to true. */
  showChanges?: boolean;
  /** Show the reason under each change. Defaults to true. */
  explain?: boolean;
  /** Offer Edit, which opens the suggestion in a text field. Defaults to true. */
  allowEdit?: boolean;
  /** Offer Keep original. Defaults to true. */
  allowKeepOriginal?: boolean;
  /** Offer Undo after Use. Defaults to true. */
  undo?: boolean;
  /** Auto-enhance switch (controlled), for the "auto-enhance-toggle" variant. */
  autoEnhance?: boolean;
  /** Initial auto-enhance switch state when uncontrolled. Defaults to false. */
  defaultAutoEnhance?: boolean;
  /** Called when the auto-enhance switch changes. */
  onAutoEnhanceChange?: (on: boolean) => void;
  /** State to start in (stories, restored sessions). Defaults to "original". States after a suggestion need `defaultSuggestion`. */
  defaultState?: PromptEnhancerState;
  /** Suggestion to start with, for `defaultState` "enhanced" / "editing". */
  defaultSuggestion?: PromptEnhancerSuggestion;
  /** Ids of changes that start removed. */
  defaultRemoved?: string[];
  /** The prompt as written before Use, for `defaultState` "accepted" (what Undo restores). */
  defaultOriginal?: string;
  /** Label of the enhance action. Defaults to "Enhance". */
  actionLabel?: string;
  /** Heading of the review. Defaults to "Suggested improvements". */
  heading?: string;
  /** Overline of the suggestion column. Defaults to "Enhanced" (nucleux.in's Material 3 preview says "Improved"). */
  enhancedLabel?: string;
  /** Label of the button that uses the suggestion. Defaults to "Use enhanced" ("Use improved" on the Material 3 preview). */
  useLabel?: string;
  /** Quiet line in the composer footer, e.g. "Aria will expand this prompt". */
  hint?: React.ReactNode;
  /** Composer placeholder, also its accessible name. Defaults to "Describe what you need…". */
  placeholder?: string;
  /** Copy for the failed state. Say the original is unchanged. */
  failureMessage?: string;
  /** Extra composer tools (model chip, attach…), placed beside the enhance action. */
  composerActions?: React.ReactNode;
  /** Composer controls placed first in the toolbar, before Request settings (attach, +…). */
  composerLeading?: React.ReactNode;
  /**
   * "chip" (default): the Enhance tool sits in the composer. "settings": no tool up front; a Request
   * settings control right after `composerLeading` lists "Improve prompt", which starts enhancing
   * (or cancels it while it runs) and shows the review.
   */
  trigger?: PromptEnhancerTrigger;
  /** With `trigger="settings"`: the app's other request settings for the same menu (Mode, Tone, Style…), merged in the site's order. */
  settingsItems?: RequestSettingsItem[];
  /** With `trigger="settings"`: called when one of `settingsItems` is chosen. */
  onSettingsSelect?: (id: string) => void;
}

/* ─────────────────────────── Shared logic ─────────────────────────── */

/** The fixed copy both families use, so accessible names match. */
export const PROMPT_ENHANCER_TEXT = {
  actionLabel: "Enhance",
  busy: "Enhancing…",
  cancel: "Cancel enhancing",
  heading: "Suggested improvements",
  regionLabel: "Suggested improvements to your prompt",
  changesLabel: "Changes — untick to leave one out",
  youWrote: "You wrote",
  enhanced: "Enhanced",
  use: "Use enhanced",
  useEdited: "Use this",
  keep: "Keep original",
  edit: "Edit",
  cancelEdit: "Cancel",
  editLabel: "Enhanced prompt",
  undo: "Undo",
  retry: "Try again",
  send: "Send",
  placeholder: "Describe what you need…",
  working: "Enhancing your prompt. Your original stays as it is.",
  accepted: "Prompt updated. Nothing was sent.",
  reverted: "Your original prompt is back.",
  ready: "Suggested improvements ready. Your original is still in the composer.",
  sentEnhanced: "Sent the enhanced prompt.",
  failure: "Couldn’t enhance this prompt. Your original is unchanged.",
  autoTitle: "Auto-enhance prompts",
  autoDescription: "Short prompts are expanded before they’re sent.",
  added: "added: ",
  removed: "removed: ",
  settingsLabel: "Improve prompt",
  settingsBusy: "Improving…",
} as const;

/**
 * The Request settings rows for a prompt enhancer: its "Improve prompt" row ("Improving…" while it
 * runs; unavailable while there is nothing to improve) merged with the app's other settings.
 */
export function promptEnhancerSettingsItems(
  pe: PromptEnhancerController,
  icon?: React.ReactNode,
  others?: RequestSettingsItem[],
): RequestSettingsItem[] {
  const busy = pe.state === "enhancing";
  return mergeRequestSettingsItems(
    {
      id: "improve",
      label: PROMPT_ENHANCER_TEXT.settingsLabel,
      icon,
      value: busy ? PROMPT_ENHANCER_TEXT.settingsBusy : undefined,
      disabled: !busy && !pe.canEnhance,
    },
    others,
  );
}

/** Handles a Request settings row for a prompt enhancer: "improve" enhances (or cancels a run); others go to `onSettingsSelect`. */
export function selectPromptEnhancerSetting(
  pe: PromptEnhancerController,
  id: string,
  onSettingsSelect?: (id: string) => void,
) {
  if (id !== "improve") return onSettingsSelect?.(id);
  if (pe.state === "enhancing") pe.cancel();
  else pe.enhance();
}

const splitEnd = (original: string) => {
  const m = /^([\s\S]*?)([.!?]*)\s*$/.exec(original);
  return { base: (m?.[1] ?? original).replace(/\s+$/, ""), end: m?.[2] ?? "" };
};

/** The enhanced prompt: the original plus every change not in `removed`, keeping the original's closing punctuation. */
export function buildEnhancedPrompt(
  original: string,
  changes: PromptEnhancerChange[],
  removed: ReadonlyArray<string> = [],
): string {
  const { base, end } = splitEnd(original);
  return base + changes.filter((c) => !removed.includes(c.id)).map((c) => c.text).join("") + end;
}

/** The text Use puts in the composer for a suggestion. */
export function resolveEnhancedPrompt(
  original: string,
  suggestion: PromptEnhancerSuggestion | null | undefined,
  removed: ReadonlyArray<string> = [],
): string {
  if (!suggestion) return original;
  if (suggestion.changes?.length) return buildEnhancedPrompt(original, suggestion.changes, removed);
  return suggestion.text ?? original;
}

/** The suggestion as runs of plain, added and removed text, for marking up the diff. */
export function getPromptEnhancerSegments(
  original: string,
  suggestion: PromptEnhancerSuggestion | null | undefined,
  removed: ReadonlyArray<string> = [],
): PromptEnhancerSegment[] {
  if (!suggestion?.changes?.length) return [{ type: "text", text: resolveEnhancedPrompt(original, suggestion, removed) }];
  const { base, end } = splitEnd(original);
  const out: PromptEnhancerSegment[] = [{ type: "text", text: base }];
  for (const c of suggestion.changes) {
    if (removed.includes(c.id)) {
      out.push({ type: "removed", text: c.text, id: c.id });
      continue;
    }
    const lead = /^[,;\s]*/.exec(c.text)?.[0] ?? "";
    if (lead) out.push({ type: "text", text: lead });
    out.push({ type: "added", text: c.text.slice(lead.length), id: c.id });
  }
  if (end) out.push({ type: "text", text: end });
  return out;
}

/** How a change is named in the list: `Add “from the last quarter”`. */
export function describePromptEnhancerChange(change: PromptEnhancerChange): string {
  return `Add “${change.text.replace(/^[,;\s]+(and\s+)?/, "").trim()}”`;
}

const isPromise = <T,>(v: unknown): v is Promise<T> => !!v && typeof (v as { then?: unknown }).then === "function";

/** Everything a family needs to render the enhancer — returned by {@link usePromptEnhancer}. */
export interface PromptEnhancerController {
  value: string;
  setValue: (next: string) => void;
  state: PromptEnhancerState;
  suggestion: PromptEnhancerSuggestion | null;
  changes: PromptEnhancerChange[];
  removed: string[];
  original: string;
  enhanced: string;
  segments: PromptEnhancerSegment[];
  editText: string;
  setEditText: (next: string) => void;
  autoEnhance: boolean;
  setAutoEnhance: (on: boolean) => void;
  announcement: string;
  canEnhance: boolean;
  canSubmit: boolean;
  showReview: boolean;
  enhance: () => void;
  cancel: () => void;
  toggleChange: (id: string) => void;
  use: () => void;
  keep: () => void;
  edit: () => void;
  cancelEdit: () => void;
  undoUse: () => void;
  submit: () => void;
  /** Escape inside the review keeps the original (or leaves Edit). */
  onReviewKeyDown: (e: React.KeyboardEvent) => void;
}

/**
 * The enhancer's non-visual logic — composer value, the state machine, the
 * async `onEnhance` call with cancel, per-change removal, Edit, Use with Undo
 * and auto-enhance on send. Both families render from it, so their behaviour
 * is identical.
 */
export function usePromptEnhancer(props: PromptEnhancerProps): PromptEnhancerController {
  const {
    value: valueProp,
    defaultValue = "",
    onValueChange,
    onEnhance,
    onSubmit,
    onUse,
    onKeepOriginal,
    onUndo,
    onStateChange,
    variant = "preview-diff",
    allowKeepOriginal = true,
    autoEnhance: autoProp,
    defaultAutoEnhance = false,
    onAutoEnhanceChange,
    defaultState = "original",
    defaultSuggestion,
    defaultRemoved = [],
    defaultOriginal,
  } = props;

  const isControlled = valueProp !== undefined;
  const [internal, setInternal] = React.useState(defaultValue);
  const value = isControlled ? valueProp : internal;
  const setValue = React.useCallback(
    (next: string) => {
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const needsSuggestion = defaultState === "enhanced" || defaultState === "editing";
  const [state, setStateRaw] = React.useState<PromptEnhancerState>(
    needsSuggestion && !defaultSuggestion ? "original" : defaultState,
  );
  const [suggestion, setSuggestion] = React.useState<PromptEnhancerSuggestion | null>(defaultSuggestion ?? null);
  const [removed, setRemoved] = React.useState<string[]>(defaultRemoved);
  const [original, setOriginal] = React.useState(defaultOriginal ?? defaultValue);
  const [editText, setEditText] = React.useState(() =>
    resolveEnhancedPrompt(defaultOriginal ?? defaultValue, defaultSuggestion, defaultRemoved),
  );
  const [announcement, setAnnouncement] = React.useState("");

  const [autoInternal, setAutoInternal] = React.useState(defaultAutoEnhance);
  const autoEnhance = autoProp ?? autoInternal;
  const setAutoEnhance = (on: boolean) => {
    if (autoProp === undefined) setAutoInternal(on);
    onAutoEnhanceChange?.(on);
  };

  const stateCb = React.useRef(onStateChange);
  stateCb.current = onStateChange;
  const setState = React.useCallback((s: PromptEnhancerState) => {
    setStateRaw(s);
    stateCb.current?.(s);
  }, []);

  const controller = React.useRef<AbortController | null>(null);
  const run = React.useRef(0);
  React.useEffect(() => () => controller.current?.abort(), []);

  const changes = suggestion?.changes ?? [];
  const enhanced = resolveEnhancedPrompt(original, suggestion, removed);
  const segments = getPromptEnhancerSegments(original, suggestion, removed);
  const busy = state === "enhancing";
  const canEnhance = !!onEnhance && value.trim().length > 0 && !busy;
  const canSubmit = !!onSubmit && value.trim().length > 0 && !busy;

  const start = (mode: "review" | "send") => {
    if (!onEnhance) return;
    const prompt = value;
    if (!prompt.trim()) return;
    controller.current?.abort();
    const ctrl = new AbortController();
    controller.current = ctrl;
    const id = ++run.current;
    setOriginal(prompt);
    setRemoved([]);
    setAnnouncement(PROMPT_ENHANCER_TEXT.working);
    setState("enhancing");

    const done = (s: PromptEnhancerSuggestion) => {
      if (id !== run.current || ctrl.signal.aborted) return;
      const text = resolveEnhancedPrompt(prompt, s, []);
      if (mode === "send") {
        setSuggestion(null);
        setState("original");
        setAnnouncement(PROMPT_ENHANCER_TEXT.sentEnhanced);
        onSubmit?.(text.trim());
        return;
      }
      setSuggestion(s);
      setEditText(text);
      if (variant === "wand-button") {
        setValue(text);
        setState("accepted");
        setAnnouncement(PROMPT_ENHANCER_TEXT.accepted);
        onUse?.(text, prompt);
        return;
      }
      setState("enhanced");
      setAnnouncement(PROMPT_ENHANCER_TEXT.ready);
    };
    const fail = () => {
      if (id !== run.current || ctrl.signal.aborted) return;
      setState("failed");
      setAnnouncement("");
    };

    try {
      const result = onEnhance(prompt, { signal: ctrl.signal });
      if (isPromise<PromptEnhancerSuggestion>(result)) result.then(done, fail);
      else done(result);
    } catch {
      fail();
    }
  };

  const enhance = () => start("review");

  const cancel = () => {
    run.current++;
    controller.current?.abort();
    setState("original");
    setAnnouncement("");
  };

  const toggleChange = (id: string) =>
    setRemoved((r) => (r.includes(id) ? r.filter((x) => x !== id) : [...r, id]));

  const use = () => {
    const text = state === "editing" ? editText : enhanced;
    setValue(text);
    setState("accepted");
    setAnnouncement(PROMPT_ENHANCER_TEXT.accepted);
    onUse?.(text, original);
  };

  const keep = () => {
    run.current++;
    controller.current?.abort();
    setSuggestion(null);
    setState("original");
    setAnnouncement("");
    onKeepOriginal?.();
  };

  const edit = () => {
    setEditText(enhanced);
    setState("editing");
  };

  const cancelEdit = () => setState("enhanced");

  const undoUse = () => {
    setValue(original);
    setState("reverted");
    setAnnouncement(PROMPT_ENHANCER_TEXT.reverted);
    onUndo?.(original);
  };

  const submit = () => {
    if (!canSubmit) return;
    if (variant === "auto-enhance-toggle" && autoEnhance && onEnhance) {
      start("send");
      return;
    }
    onSubmit?.(value.trim());
  };

  const setValueFromTyping = (next: string) => {
    setValue(next);
    if (state === "accepted" || state === "reverted") {
      setState("original");
      setAnnouncement("");
    }
  };

  const onReviewKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Escape") return;
    if (state === "editing") {
      e.preventDefault();
      cancelEdit();
    } else if (allowKeepOriginal) {
      e.preventDefault();
      keep();
    }
  };

  return {
    value,
    setValue: setValueFromTyping,
    state,
    suggestion,
    changes,
    removed,
    original,
    enhanced,
    segments,
    editText,
    setEditText,
    autoEnhance,
    setAutoEnhance,
    announcement,
    canEnhance,
    canSubmit,
    showReview: (state === "enhanced" || state === "editing") && !!suggestion,
    enhance,
    cancel,
    toggleChange,
    use,
    keep,
    edit,
    cancelEdit,
    undoUse,
    submit,
    onReviewKeyDown,
  };
}

/** Splits the props the hook reads from the ones forwarded to the root element. */
export function splitPromptEnhancerProps(props: PromptEnhancerProps) {
  const {
    value: _v,
    defaultValue: _dv,
    onValueChange: _ovc,
    onEnhance: _oe,
    onSubmit: _os,
    onUse: _ou,
    onKeepOriginal: _ok,
    onUndo: _oun,
    onStateChange: _osc,
    variant: _va,
    diffStyle: _ds,
    showChanges: _sc,
    explain: _ex,
    allowEdit: _ae,
    allowKeepOriginal: _ak,
    undo: _un,
    autoEnhance: _au,
    defaultAutoEnhance: _dau,
    onAutoEnhanceChange: _oac,
    defaultState: _dst,
    defaultSuggestion: _dsg,
    defaultRemoved: _dr,
    defaultOriginal: _do,
    actionLabel: _al,
    heading: _h,
    enhancedLabel: _el,
    useLabel: _ul,
    hint: _hi,
    placeholder: _p,
    failureMessage: _fm,
    composerActions: _ca,
    composerLeading: _cl,
    trigger: _tr,
    settingsItems: _si,
    onSettingsSelect: _oss,
    onAdd: _oa,
    addLabel: _alb,
    add: _ad,
    model: _mo,
    onVoice: _ov,
    voiceLabel: _vl,
    ...rest
  } = props;
  return rest;
}

/* ─────────────────────────────── View ─────────────────────────────── */

// useLayoutEffect warns when rendered on the server; fall back to useEffect there.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

/** The review's action buttons, sized as on nucleux.in (11.5px, 7px padding). */
const actionBtn = "h-auto rounded-[8px] py-[7px] text-[11.5px] font-medium leading-[1.55] tracking-normal";

const overline = "flex items-center gap-1.5 text-[9.5px] font-bold uppercase leading-[1.55] tracking-[0.08em]";

/**
 * A prompt enhancer for the composer: an Enhance action expands a terse
 * prompt into a clearer one and shows it beside the original — each addition
 * marked, explained and removable, assumptions labelled — so improving a
 * prompt is a decision, never a silent rewrite. Use puts the result in the
 * composer with Undo and sends nothing; Keep original, Edit and a failure
 * state that leaves the original untouched are built in. The suggestion comes
 * from the app's `onEnhance` callback; the "wand-button" variant applies it in
 * place with Undo, and "auto-enhance-toggle" adds a switch that enhances short
 * prompts on send.
 */
export const PromptEnhancer = React.forwardRef<HTMLDivElement, PromptEnhancerProps>((props, ref) => {
  const {
    variant = "preview-diff",
    diffStyle = "split",
    showChanges = true,
    explain = true,
    allowEdit = true,
    allowKeepOriginal = true,
    undo = true,
    actionLabel = PROMPT_ENHANCER_TEXT.actionLabel,
    heading = PROMPT_ENHANCER_TEXT.heading,
    enhancedLabel = PROMPT_ENHANCER_TEXT.enhanced,
    useLabel = PROMPT_ENHANCER_TEXT.use,
    hint,
    placeholder = PROMPT_ENHANCER_TEXT.placeholder,
    failureMessage = PROMPT_ENHANCER_TEXT.failure,
    composerActions,
    composerLeading,
    trigger = "chip",
    settingsItems,
    onSettingsSelect,
    onSubmit,
    onAdd,
    addLabel = "Add files and more",
    add,
    model,
    onVoice,
    voiceLabel = "Speak instead of typing",
  } = props;
  const { className, ...rest } = splitPromptEnhancerProps(props);
  const addControl =
    add ??
    (onAdd ? (
      <InputGroupButton size="icon-sm" variant="ghost" aria-label={addLabel} onClick={onAdd}>
        <Plus aria-hidden className="size-4" />
      </InputGroupButton>
    ) : null);
  const pe = usePromptEnhancer(props);
  const settingsControl = trigger === "settings";
  const uid = React.useId();
  const busy = pe.state === "enhancing";
  const listed = showChanges && pe.changes.length > 0;
  const kept = pe.changes.length - pe.removed.length;

  // Grow the composer with its text, up to about six lines.
  const fieldRef = React.useRef<HTMLTextAreaElement>(null);
  useIsomorphicLayoutEffect(() => {
    const el = fieldRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [pe.value]);

  const marked = (
    <>
      {pe.segments.map((s, i) => {
        if (s.type === "text" || !showChanges) return s.type === "removed" ? null : <React.Fragment key={i}>{s.text}</React.Fragment>;
        if (s.type === "added")
          return (
            <ins
              key={i}
              className="rounded-sm bg-warning/20 px-0.5 text-foreground underline decoration-warning decoration-dotted underline-offset-4 [box-decoration-break:clone]"
            >
              <span className="sr-only">{PROMPT_ENHANCER_TEXT.added}</span>
              {s.text}
            </ins>
          );
        return (
          <del key={i} className="text-muted-foreground line-through">
            <span className="sr-only">{PROMPT_ENHANCER_TEXT.removed}</span>
            {s.text}
          </del>
        );
      })}
    </>
  );

  const enhancedOverline = (
    <p className={cn(overline, "text-brand")}>
      {enhancedLabel}
    </p>
  );

  const review = pe.showReview ? (
    <div
      role="region"
      aria-label={PROMPT_ENHANCER_TEXT.regionLabel}
      onKeyDown={pe.onReviewKeyDown}
      className="flex flex-col gap-2.5 animate-nx-fade-in motion-reduce:animate-none"
    >
      {listed && (
        <div className="flex flex-wrap items-baseline justify-between gap-2 px-0.5">
          <p className="text-sm font-semibold text-foreground">{heading}</p>
          <span className="text-xs text-muted-foreground">
            {kept} of {pe.changes.length} changes
          </span>
        </div>
      )}

      {pe.state === "editing" ? (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${uid}-edit`} className={cn(overline, "text-muted-foreground")}>
            {PROMPT_ENHANCER_TEXT.editLabel}
          </label>
          <textarea
            id={`${uid}-edit`}
            rows={3}
            autoFocus
            value={pe.editText}
            onChange={(e) => pe.setEditText(e.target.value)}
            className="w-full resize-none rounded-[10px] border-[1.5px] border-warning bg-background px-3.5 py-3 text-sm leading-[22px] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      ) : diffStyle === "split" ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-[10px] border border-border bg-[hsl(var(--nx-ink-25))] px-[13px] py-[11px]">
            <p className={cn(overline, "mb-[5px] text-faint")}>{PROMPT_ENHANCER_TEXT.youWrote}</p>
            <p className="text-[11.5px] leading-[17px] text-foreground">{pe.original}</p>
          </div>
          <div className="rounded-[10px] border-[1.5px] border-brand bg-[rgb(99_102_241/0.05)] px-[13px] py-[11px]">
            <div className="mb-[5px]">{enhancedOverline}</div>
            <p className="text-[11.5px] leading-[17px] text-foreground">{marked}</p>
          </div>
        </div>
      ) : (
        <div className="rounded-[10px] border-[1.5px] border-brand bg-[rgb(99_102_241/0.05)] px-3.5 py-3">
          <div className="mb-1.5">{enhancedOverline}</div>
          <p className="text-[15px] leading-7 text-foreground">{marked}</p>
        </div>
      )}

      {listed && pe.state !== "editing" && (
        <div role="group" aria-label={PROMPT_ENHANCER_TEXT.changesLabel} className="flex flex-col divide-y divide-border border-y border-border">
          {pe.changes.map((c) => {
            const on = !pe.removed.includes(c.id);
            const cb = `${uid}-c-${c.id}`;
            const desc = [explain && c.reason ? `${cb}-why` : null, c.assumption ? `${cb}-as` : null].filter(Boolean).join(" ");
            return (
              <div key={c.id} className="flex items-start gap-3 py-2.5">
                <Checkbox
                  id={cb}
                  checked={on}
                  onCheckedChange={() => pe.toggleChange(c.id)}
                  aria-labelledby={`${cb}-l`}
                  aria-describedby={desc || undefined}
                  className="mt-0.5"
                />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <label
                    id={`${cb}-l`}
                    htmlFor={cb}
                    className={cn("cursor-pointer text-sm font-medium leading-5 text-foreground", !on && "text-muted-foreground line-through")}
                  >
                    {describePromptEnhancerChange(c)}
                  </label>
                  {explain && c.reason && (
                    <span id={`${cb}-why`} className="text-xs leading-[18px] text-muted-foreground">
                      {c.reason}
                    </span>
                  )}
                  {c.assumption && (
                    <span
                      id={`${cb}-as`}
                      className="mt-1 inline-flex items-center gap-1 self-start rounded-md bg-warning/15 px-2 py-0.5 text-xs font-medium text-foreground"
                    >
                      <CircleHelp aria-hidden className="size-3.5 text-muted-foreground" />
                      {c.assumption}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap gap-[7px]">
        <Button size="lg" onClick={pe.use} className={cn(actionBtn, "min-w-[10rem] flex-1 border-0 px-[7px] text-primary-foreground shadow-none")}>
          {pe.state === "editing" ? PROMPT_ENHANCER_TEXT.useEdited : useLabel}
        </Button>
        {pe.state !== "editing" && allowEdit && (
          <Button size="lg" variant="ghost" leftIcon={<Pencil aria-hidden className="size-3.5" />} onClick={pe.edit} className={actionBtn}>
            {PROMPT_ENHANCER_TEXT.edit}
          </Button>
        )}
        {pe.state === "editing" ? (
          <Button size="lg" variant="secondary" onClick={pe.cancelEdit} className={cn(actionBtn, "border-[rgb(203_213_225)] bg-transparent px-3.5 font-normal text-muted-foreground shadow-none")}>
            {PROMPT_ENHANCER_TEXT.cancelEdit}
          </Button>
        ) : (
          allowKeepOriginal && (
            <Button size="lg" variant="secondary" onClick={pe.keep} className={cn(actionBtn, "border-[rgb(203_213_225)] bg-transparent px-3.5 font-normal text-muted-foreground shadow-none")}>
              {PROMPT_ENHANCER_TEXT.keep}
            </Button>
          )
        )}
      </div>
    </div>
  ) : null;

  const note =
    pe.state === "enhancing" ? (
      <p className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
        <Spinner aria-hidden role={undefined} aria-label={undefined} className="size-3.5 motion-reduce:animate-none" />
        {PROMPT_ENHANCER_TEXT.working}
      </p>
    ) : pe.state === "accepted" ? (
      <div className="flex flex-wrap items-center gap-2 px-1 text-xs text-muted-foreground">
        <Check aria-hidden className="size-3.5 text-success" />
        <span className="flex-1">{PROMPT_ENHANCER_TEXT.accepted}</span>
        {undo && (
          <Button size="sm" variant="ghost" leftIcon={<Undo2 aria-hidden className="size-3.5" />} onClick={pe.undoUse} className="h-7 px-2">
            {PROMPT_ENHANCER_TEXT.undo}
          </Button>
        )}
      </div>
    ) : pe.state === "reverted" ? (
      <p className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
        <Undo2 aria-hidden className="size-3.5" />
        {PROMPT_ENHANCER_TEXT.reverted}
      </p>
    ) : null;

  const failed =
    pe.state === "failed" ? (
      <div role="alert" className="flex flex-wrap items-center gap-2 rounded-lg bg-destructive/10 py-1.5 pl-3 pr-1.5 text-sm text-foreground">
        <AlertCircle aria-hidden className="size-4 text-destructive" />
        <span className="min-w-0 flex-1">{failureMessage}</span>
        <Button size="sm" variant="ghost" onClick={pe.enhance} disabled={!pe.canEnhance}>
          {PROMPT_ENHANCER_TEXT.retry}
        </Button>
        {allowKeepOriginal && (
          <Button size="sm" variant="ghost" onClick={pe.keep}>
            {PROMPT_ENHANCER_TEXT.keep}
          </Button>
        )}
      </div>
    ) : null;

  const composer = (
    <InputGroup className="flex-col overflow-hidden rounded-xl border-[1.5px] border-border shadow-none">
      <InputGroupTextarea
        ref={fieldRef}
        rows={1}
        aria-label={placeholder}
        placeholder={placeholder}
        value={pe.value}
        onChange={(e) => pe.setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && onSubmit) {
            e.preventDefault();
            pe.submit();
          }
        }}
        className="min-h-0 w-full flex-none px-3.5 py-3 text-[13px] leading-5"
      />
      <InputGroupAddon align="block-end" className="cursor-default justify-between border-t border-border px-3.5 py-2 [&.border-t]:pt-2">
        {addControl != null || composerLeading != null || settingsControl ? (
          <span className="flex items-center gap-1.5">
            {addControl}
            {composerLeading}
            {settingsControl && (
              <RequestSettings
                items={promptEnhancerSettingsItems(pe, <Sparkles />, settingsItems)}
                onSelect={(id) => selectPromptEnhancerSetting(pe, id, onSettingsSelect)}
              />
            )}
            {hint != null && <InputGroupText className="py-0 text-[11px] font-normal text-faint">{hint}</InputGroupText>}
          </span>
        ) : hint != null ? (
          <InputGroupText className="py-0 text-[11px] font-normal text-faint">{hint}</InputGroupText>
        ) : (
          <span />
        )}
        <span className="ml-auto flex items-center gap-1.5">
          {composerActions}
          {model}
          {!settingsControl && (
            <InputGroupButton
              size="sm"
              variant={busy ? "secondary" : "primary"}
              onClick={busy ? pe.cancel : pe.enhance}
              disabled={!busy && !pe.canEnhance}
              aria-label={busy ? PROMPT_ENHANCER_TEXT.cancel : `${actionLabel} this prompt with AI`}
              className={busy ? "h-auto gap-[5px] rounded-[8px] px-3 py-[5px] text-[11.5px] font-medium leading-[1.55] tracking-normal" : "h-auto gap-[5px] rounded-[8px] border-0 px-3 tracking-normal py-[5px] text-[11.5px] font-medium leading-[1.55]"}
            >
              {busy ? (
                <>
                  <Spinner aria-hidden role={undefined} aria-label={undefined} className="size-3.5 motion-reduce:animate-none" />
                  {PROMPT_ENHANCER_TEXT.busy}
                </>
              ) : (
                `✨ ${actionLabel}`
              )}
            </InputGroupButton>
          )}
          {onVoice && (
            <InputGroupButton size="icon-sm" variant="ghost" aria-label={voiceLabel} onClick={onVoice}>
              <Mic aria-hidden className="size-4" />
            </InputGroupButton>
          )}
          {onSubmit && (
            <InputGroupButton
              size="icon-sm"
              variant="primary"
              onClick={pe.submit}
              disabled={!pe.canSubmit}
              aria-label={PROMPT_ENHANCER_TEXT.send}
              aria-keyshortcuts="Enter"
              className="rounded-full disabled:opacity-40"
            >
              <ArrowUp aria-hidden className="size-4" />
            </InputGroupButton>
          )}
        </span>
      </InputGroupAddon>
    </InputGroup>
  );

  const autoToggle =
    variant === "auto-enhance-toggle" ? (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3.5 py-2.5">
        <div className="min-w-0">
          <p id={`${uid}-auto`} className="text-sm font-semibold text-foreground">
            {PROMPT_ENHANCER_TEXT.autoTitle}
          </p>
          <p id={`${uid}-auto-d`} className="mt-0.5 text-xs text-muted-foreground">
            {PROMPT_ENHANCER_TEXT.autoDescription}
          </p>
        </div>
        <Switch
          checked={pe.autoEnhance}
          onCheckedChange={pe.setAutoEnhance}
          aria-labelledby={`${uid}-auto`}
          aria-describedby={`${uid}-auto-d`}
        />
      </div>
    ) : null;

  return (
    <div ref={ref} data-state={pe.state} className={cn("flex w-full flex-col gap-2.5", className)} {...rest}>
      {autoToggle}
      {composer}
      {failed}
      <div role="status" aria-live="polite" className={note ? undefined : "sr-only"}>
        {note ?? pe.announcement}
      </div>
      {review}
    </div>
  );
});
PromptEnhancer.displayName = "PromptEnhancer";

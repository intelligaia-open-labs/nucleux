import * as React from "react";
import { Check, CornerDownRight, Info, RotateCw, X } from "lucide-react";
import { cn } from "@nucleux/utils";
import { Button } from "@nucleux/button";
import { Spinner } from "@nucleux/spinner";
import { AiGeneratedIcon } from "@nucleux/ai-icons";
import { OpenInput, type OpenInputProps } from "@nucleux/open-input";

/* ────────────────────────────────────────────────────────────────────────────
 * Types
 * ──────────────────────────────────────────────────────────────────────────── */

/** One suggestion chip. */
export interface SuggestionItem {
  /** Stable id (falls back to the label). Used by `pendingId`. */
  id?: string;
  /** The chip's visible label — a verb phrase: "Make it shorter", "Include unresolved blockers". */
  label: string;
  /** The words added to the request when chosen. Defaults to `label`. */
  text?: string;
  /** Optional leading icon (replaces the variant's marker). */
  icon?: React.ReactNode;
}

/**
 * Where the chips sit, from the spec's variants:
 * "compose" — above the composer, to drop into or refine the request;
 * "follow-up" — under an answer, what to ask next (marked ↳);
 * "selection" — a floating toolbar of actions on highlighted content.
 */
export type SuggestionsVariant = "compose" | "follow-up" | "selection";

/**
 * What the row shows. "idle" renders nothing; "loading" a quiet busy line;
 * "available" the chips; "error" a failed load with Retry; "accepted",
 * "dismissed" and "irrelevant" a one-line status that replaces the chips.
 */
export type SuggestionsStatus = "idle" | "loading" | "available" | "error" | "accepted" | "dismissed" | "irrelevant";

/** Every string the row shows or announces — override any of them through `messages`. */
export interface SuggestionsMessages {
  /** Accessible name of the group when there is no visible `label`. */
  group: string;
  /** Loading line. */
  loading: string;
  /** Error line. */
  error: React.ReactNode;
  /** Confirmation after a suggestion was added. */
  accepted: (item?: SuggestionItem) => React.ReactNode;
  /** Line after Dismiss. */
  dismissed: React.ReactNode;
  /** Line when the request changed so the suggestions no longer fit. */
  irrelevant: React.ReactNode;
  /** Accessible name of the Why toggle. */
  why: string;
  /** Accessible name of the dismiss button. */
  dismiss: string;
  /** Undo button label. */
  undo: string;
  /** Retry button label. */
  retry: string;
}

/** The default copy, shared by both families so accessible names match. */
export const suggestionsMessages: SuggestionsMessages = {
  group: "Suggestions",
  loading: "Finding suggestions…",
  error: "Couldn’t load suggestions. Your request is unchanged.",
  accepted: (item) =>
    item ? `Added “${item.text ?? item.label}” to your request. You can edit it.` : "Added to your request. You can edit it.",
  dismissed: "Suggestions dismissed. They won’t come back for this request.",
  irrelevant: "The suggestions no longer fit what you wrote, so they were removed.",
  why: "Why these suggestions",
  dismiss: "Dismiss suggestions",
  undo: "Undo",
  retry: "Retry",
};

export interface SuggestionsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** The chips. Only the first `max` are shown. */
  suggestions: SuggestionItem[];
  /** "compose" (default), "follow-up" or "selection". */
  variant?: SuggestionsVariant;
  /** What the row shows. Defaults to "available". */
  status?: SuggestionsStatus;
  /** Visible heading marking the row as the agent's ("Aria suggests"). Also names the group. */
  label?: React.ReactNode;
  /** Why these help — behind an info toggle (`aria-expanded`). */
  reason?: React.ReactNode;
  /**
   * Prefix for each chip's accessible name, saying what pressing it does:
   * "Add to prompt" makes a chip read "Add to prompt: Include unresolved blockers".
   */
  actionLabel?: string;
  /** Maximum chips shown. Defaults to 3 — more is a menu, not a shortcut. */
  max?: number;
  /** A chip whose action is running: it shows a spinner and `aria-busy`. */
  pendingId?: string;
  /** The suggestion that was added — named by the "accepted" line. */
  accepted?: SuggestionItem;
  /** Called with the chosen suggestion and its index. The row never sends anything itself. */
  onSelect?: (item: SuggestionItem, index: number) => void;
  /** Shows a dismiss button (Escape works too) and is called when it is pressed. */
  onDismiss?: () => void;
  /** Shows Undo on the "accepted" line. */
  onUndo?: () => void;
  /** Shows Retry on the "error" line. */
  onRetry?: () => void;
  /** Copy overrides. */
  messages?: Partial<SuggestionsMessages>;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Shared non-visual logic (also used by @nucleux/md3-suggestions)
 * ──────────────────────────────────────────────────────────────────────────── */

/** The key a chip is tracked by. */
export const suggestionKey = (item: SuggestionItem) => item.id ?? item.label;

/**
 * Adds a suggestion after the person's own words — never replacing them:
 * "Summarize the September release." + "Include unresolved blockers" →
 * "Summarize the September release and include unresolved blockers."
 */
export function appendSuggestion(draft: string, text: string): string {
  const base = String(draft ?? "").replace(/[.\s]+$/, "");
  const add = String(text ?? "").trim().replace(/[.\s]+$/, "");
  if (!add) return draft;
  if (!base) return add.charAt(0).toUpperCase() + add.slice(1) + ".";
  return `${base} and ${add.charAt(0).toLowerCase()}${add.slice(1)}.`;
}

/**
 * The row's keyboard model: Arrow keys move between chips (wrapping), Home and
 * End jump to the ends, Escape dismisses when `onDismiss` is given. Every chip
 * is also a Tab stop, so none of this is required.
 */
export function handleSuggestionsKeyDown(e: React.KeyboardEvent<HTMLElement>, onDismiss?: () => void) {
  if (e.key === "Escape" && onDismiss) {
    e.preventDefault();
    onDismiss();
    return;
  }
  const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"];
  const k = keys.indexOf(e.key);
  if (k < 0) return;
  const target = (e.target as HTMLElement).closest?.("[data-suggestion]");
  if (!target) return;
  const all = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("[data-suggestion]")).filter(
    (b) => !b.disabled,
  );
  const i = all.indexOf(target as HTMLButtonElement);
  if (i < 0 || all.length === 0) return;
  let n = k < 2 ? i + 1 : k < 4 ? i - 1 : k === 4 ? 0 : all.length - 1;
  n = (n + all.length) % all.length;
  e.preventDefault();
  all[n]?.focus();
}

/**
 * The row's state and accessible wiring, shared by both families so the roles,
 * names and keyboard model are identical: merged copy, the visible chips, the
 * Why toggle and the props for the root element.
 */
export function useSuggestions(props: SuggestionsProps) {
  const {
    suggestions,
    variant = "compose",
    status = "available",
    label,
    reason,
    max = 3,
    onDismiss,
    messages,
    onKeyDown,
    "aria-label": ariaLabel,
  } = props;
  const msgs: SuggestionsMessages = { ...suggestionsMessages, ...messages };
  const id = React.useId();
  const labelId = `${id}-label`;
  const whyId = `${id}-why`;
  const [whyOpen, setWhyOpen] = React.useState(false);
  const items = suggestions.slice(0, Math.max(0, max));
  const showHeader = variant !== "selection" && (label != null || reason != null || onDismiss != null);
  const rootProps = {
    role: variant === "selection" ? "toolbar" : "group",
    "aria-label": label != null && variant !== "selection" ? undefined : (ariaLabel ?? msgs.group),
    "aria-labelledby": label != null && variant !== "selection" ? labelId : undefined,
    onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (!e.defaultPrevented) handleSuggestionsKeyDown(e, onDismiss);
    },
  } as const;
  const chipName = (item: SuggestionItem) => (props.actionLabel ? `${props.actionLabel}: ${item.label}` : undefined);
  return {
    msgs,
    items,
    status,
    variant,
    labelId,
    whyId,
    whyOpen: whyOpen && reason != null,
    toggleWhy: () => setWhyOpen((o) => !o),
    showHeader,
    rootProps,
    chipName,
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * Suggestions (shadcn)
 * ──────────────────────────────────────────────────────────────────────────── */

const chipBase =
  "h-auto min-h-8 rounded-sm px-3 py-1.5 text-sm font-normal shadow-none transition-colors motion-reduce:transition-none";
const chipVariant: Record<SuggestionsVariant, string> = {
  compose: "border border-border bg-background text-foreground hover:border-foreground hover:bg-background",
  "follow-up":
    "border border-border bg-muted text-muted-foreground hover:border-foreground hover:bg-background hover:text-foreground",
  selection:
    "min-h-7 rounded-md border-0 bg-transparent px-2.5 py-1 text-xs font-medium text-background hover:bg-background/15 focus-visible:ring-background focus-visible:ring-offset-foreground",
};

/**
 * Context-aware quick-action chips that save the person forming, typing and
 * submitting the obvious next step: above the composer as starters or quick
 * edits ("compose"), under an answer as follow-ups ("follow-up", marked ↳),
 * or as a floating toolbar on highlighted content ("selection"). At most three
 * verb-labelled chips; the row can be marked as the agent's (`label`), explain
 * itself behind an info toggle (`reason`) and be dismissed (button or Escape).
 * Choosing a chip only calls `onSelect` — it never sends — and the row can
 * then show a one-line confirmation with Undo, a dismissed or no-longer-relevant
 * line, a loading line or an error with Retry, through `status`. Arrow keys,
 * Home and End move between chips.
 */
export const Suggestions = React.forwardRef<HTMLDivElement, SuggestionsProps>((props, ref) => {
  const {
    suggestions: _suggestions,
    variant: _variant,
    status: _status,
    label,
    reason,
    actionLabel: _actionLabel,
    max: _max,
    pendingId,
    accepted,
    onSelect,
    onDismiss,
    onUndo,
    onRetry,
    messages: _messages,
    onKeyDown: _onKeyDown,
    "aria-label": _ariaLabel,
    className,
    ...rest
  } = props;
  const s = useSuggestions(props);
  const { msgs, status, variant } = s;

  if (status === "idle") return null;

  if (status === "loading") {
    return (
      <div ref={ref} role="status" className={cn("flex items-center gap-2 px-1 text-sm text-muted-foreground", className)} {...rest}>
        <Spinner aria-hidden="true" role={undefined} aria-label={undefined} className="motion-reduce:animate-none" />
        <span>{msgs.loading}</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        ref={ref}
        role="alert"
        className={cn("flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-1.5 text-sm text-foreground", className)}
        {...rest}
      >
        <span className="min-w-0 flex-1">{msgs.error}</span>
        {onRetry && (
          <Button variant="ghost" size="sm" leftIcon={<RotateCw className="size-3.5" />} onClick={onRetry}>
            {msgs.retry}
          </Button>
        )}
      </div>
    );
  }

  if (status === "accepted" || status === "dismissed" || status === "irrelevant") {
    const Icon = status === "accepted" ? Check : status === "dismissed" ? X : Info;
    const text = status === "accepted" ? msgs.accepted(accepted) : status === "dismissed" ? msgs.dismissed : msgs.irrelevant;
    return (
      <div
        ref={ref}
        role="status"
        className={cn(
          "flex flex-wrap items-center gap-x-2 gap-y-1 px-1 text-sm text-muted-foreground motion-safe:animate-nx-fade-in",
          className,
        )}
        {...rest}
      >
        <Icon aria-hidden="true" className={cn("size-4 shrink-0", status === "accepted" ? "text-success" : "text-muted-foreground")} />
        <span className="min-w-[12rem] flex-1">{text}</span>
        {status === "accepted" && onUndo && (
          <Button variant="link" size="sm" onClick={onUndo} className="text-sm">
            {msgs.undo}
          </Button>
        )}
      </div>
    );
  }

  const chips = s.items.map((item, i) => {
    const key = suggestionKey(item);
    const pending = pendingId != null && pendingId === key;
    const marker = pending ? (
      <Spinner aria-hidden="true" role={undefined} aria-label={undefined} className="size-3.5 motion-reduce:animate-none" />
    ) : (
      item.icon ?? (variant === "follow-up" ? <CornerDownRight aria-hidden="true" className="size-3.5" /> : null)
    );
    return (
      <Button
        key={key}
        variant="secondary"
        size="sm"
        data-suggestion=""
        aria-label={s.chipName(item)}
        aria-busy={pending || undefined}
        leftIcon={marker ?? undefined}
        onClick={() => onSelect?.(item, i)}
        className={cn(chipBase, chipVariant[variant])}
      >
        {item.label}
      </Button>
    );
  });

  if (variant === "selection") {
    return (
      <div
        ref={ref}
        {...s.rootProps}
        className={cn(
          "inline-flex items-center gap-0.5 rounded-lg bg-foreground p-1 text-background shadow-lg motion-safe:animate-nx-fade-in",
          className,
        )}
        {...rest}
      >
        {chips}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      {...s.rootProps}
      className={cn("flex flex-col gap-2 motion-safe:animate-nx-fade-in", className)}
      {...rest}
    >
      {s.showHeader && (
        <div className="flex min-h-8 items-center gap-2">
          {label != null && (
            <span id={s.labelId} className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <AiGeneratedIcon className="size-4 text-brand" />
              {label}
            </span>
          )}
          <span className="ml-auto inline-flex items-center gap-0.5">
            {reason != null && (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={msgs.why}
                aria-expanded={s.whyOpen}
                aria-controls={s.whyOpen ? s.whyId : undefined}
                onClick={s.toggleWhy}
                className={cn("text-muted-foreground", s.whyOpen && "text-foreground")}
              >
                <Info className="size-4" aria-hidden="true" />
              </Button>
            )}
            {onDismiss && (
              <Button variant="ghost" size="icon-sm" aria-label={msgs.dismiss} onClick={onDismiss} className="text-muted-foreground">
                <X className="size-4" aria-hidden="true" />
              </Button>
            )}
          </span>
        </div>
      )}
      {s.whyOpen && (
        <p id={s.whyId} className="px-0.5 text-xs leading-5 text-muted-foreground">
          {reason}
        </p>
      )}
      <div className="flex flex-wrap gap-1.5">{chips}</div>
    </div>
  );
});
Suggestions.displayName = "Suggestions";

/* ────────────────────────────────────────────────────────────────────────────
 * SuggestionsComposer — the row wired to a composer
 * ──────────────────────────────────────────────────────────────────────────── */

export interface SuggestionsComposerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit" | "onSelect" | "defaultValue" | "onChange">,
    /** The composer's own chrome, passed straight to it: `onAdd` (the + button), `model` (the model chip), `onVoice` (the mic). */
    Pick<OpenInputProps, "onAdd" | "addLabel" | "add" | "model" | "onVoice" | "voiceLabel"> {
  /** Controlled draft. Omit (and use `defaultValue`) for an uncontrolled composer. */
  value?: string;
  /** Initial draft when uncontrolled. */
  defaultValue?: string;
  /** Called whenever the draft changes — typing, adding a suggestion, Undo. */
  onValueChange?: (value: string) => void;
  /** Called with the trimmed draft when the person sends. Suggestions never send on their own. */
  onSubmit: (value: string) => void | Promise<unknown>;
  /** Suggestions the app already has for this request (data, no model call). */
  suggestions?: SuggestionItem[];
  /**
   * Fetch suggestions for the draft after a pause in typing. Abort on `signal`.
   * While pending the row shows a loading line; a rejection shows Retry.
   */
  loadSuggestions?: (draft: string, options: { signal: AbortSignal }) => Promise<SuggestionItem[]>;
  /** How long typing must pause before suggestions are offered, in ms. Defaults to 900. */
  pauseMs?: number;
  /** Shortest draft (trimmed) that gets suggestions. Defaults to 12 characters. */
  minLength?: number;
  /** Whether the suggestions still fit the draft. When it turns false they withdraw quietly. */
  isRelevant?: (draft: string, suggestions: SuggestionItem[]) => boolean;
  /** How a suggestion is added to the draft. Defaults to `appendSuggestion` — after their words, never replacing them. */
  join?: (draft: string, text: string) => string;
  /** Visible heading marking the row as the agent's ("Aria suggests"). */
  label?: React.ReactNode;
  /** Why these help — behind an info toggle. */
  reason?: React.ReactNode;
  /** Chip accessible-name prefix. Defaults to "Add to prompt". */
  actionLabel?: string;
  /** Allow Dismiss. Defaults to true. */
  dismissible?: boolean;
  /** Offer Undo after adding. Defaults to true. */
  undoable?: boolean;
  /** Maximum chips. Defaults to 3. */
  max?: number;
  /** Called after a suggestion was added, with the new draft. */
  onAccept?: (item: SuggestionItem, draft: string) => void;
  /** Called when the suggestions are dismissed. */
  onDismiss?: () => void;
  /** Called after Undo restored the draft. */
  onUndo?: () => void;
  /** Composer placeholder — also the field's accessible name. */
  placeholder?: string;
  /** Extra composer controls (attach, voice, model…). */
  composerActions?: React.ReactNode;
  /** Show the agent as busy (send becomes stop). */
  loading?: boolean;
  /** Called by the stop button while `loading`. */
  onStop?: () => void;
  /** Copy overrides for the row. */
  messages?: Partial<SuggestionsMessages>;
}

/**
 * The composer-side state of a suggestions row, shared by both families: the
 * draft (controlled or not), the row's status, a pause before offering
 * (nothing moves while keys are moving), optional async loading with abort,
 * add-by-appending with Undo, dismiss for this request, and withdrawal when
 * `isRelevant` turns false. Clearing the draft or sending resets it.
 */
export function useSuggestionsComposer(props: SuggestionsComposerProps) {
  const {
    value: valueProp,
    defaultValue = "",
    onValueChange,
    suggestions,
    loadSuggestions,
    pauseMs = 900,
    minLength = 12,
    isRelevant,
    join = appendSuggestion,
    onAccept,
    onDismiss,
    onUndo,
    onSubmit,
    max = 3,
  } = props;

  const controlled = valueProp !== undefined;
  const [inner, setInner] = React.useState(defaultValue);
  const draft = controlled ? (valueProp as string) : inner;
  const draftRef = React.useRef(draft);
  draftRef.current = draft;
  const latest = React.useRef(props);
  latest.current = props;

  const ready = (d: string) => d.trim().length >= minLength;
  const fits = (d: string, list: SuggestionItem[]) => (isRelevant ? isRelevant(d, list) : true);

  const [items, setItems] = React.useState<SuggestionItem[]>(suggestions ?? []);
  const [status, setStatus] = React.useState<SuggestionsStatus>(() =>
    !loadSuggestions && suggestions?.length && ready(draft) && fits(draft, suggestions) ? "available" : "idle",
  );
  const [accepted, setAccepted] = React.useState<SuggestionItem | undefined>();
  const base = React.useRef("");
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const abort = React.useRef<AbortController | null>(null);
  const fieldRef = React.useRef<HTMLTextAreaElement>(null);
  const wantFocus = React.useRef(false);

  React.useEffect(() => {
    if (!loadSuggestions && suggestions) setItems(suggestions);
  }, [suggestions, loadSuggestions]);

  React.useEffect(() => {
    if (!wantFocus.current) return;
    wantFocus.current = false;
    const el = fieldRef.current;
    if (el) {
      el.focus();
      const end = el.value.length;
      try {
        el.setSelectionRange(end, end);
      } catch {
        /* not a text field */
      }
    }
  });

  const commit = (v: string) => {
    draftRef.current = v;
    if (!controlled) setInner(v);
    onValueChange?.(v);
  };

  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = undefined;
    abort.current?.abort();
    abort.current = null;
  };

  const offer = (d: string) => {
    const p = latest.current;
    if (!(d.trim().length >= (p.minLength ?? 12))) {
      setStatus("idle");
      return;
    }
    if (p.loadSuggestions) {
      abort.current?.abort();
      const ac = new AbortController();
      abort.current = ac;
      setStatus("loading");
      p.loadSuggestions(d, { signal: ac.signal }).then(
        (list) => {
          if (ac.signal.aborted) return;
          setItems(list);
          setStatus(list.length && (p.isRelevant ? p.isRelevant(d, list) : true) ? "available" : "idle");
        },
        () => {
          if (!ac.signal.aborted) setStatus("error");
        },
      );
      return;
    }
    const list = p.suggestions ?? [];
    setItems(list);
    setStatus(list.length && (p.isRelevant ? p.isRelevant(d, list) : true) ? "available" : "idle");
  };

  React.useEffect(() => {
    if (loadSuggestions && ready(draftRef.current)) offer(draftRef.current);
    return cancel;
    // Mount only: later offers follow typing pauses.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const type = (v: string) => {
    commit(v);
    if (timer.current) clearTimeout(timer.current);
    if (!v.trim()) {
      cancel();
      setAccepted(undefined);
      setStatus("idle");
      return;
    }
    if (status === "available") {
      if (!fits(v, items)) setStatus("irrelevant");
      return;
    }
    if (status === "accepted" || status === "dismissed") return;
    if (status === "loading") {
      abort.current?.abort();
      setStatus("idle");
    }
    timer.current = setTimeout(() => offer(draftRef.current), pauseMs);
  };

  const select = (item: SuggestionItem) => {
    cancel();
    base.current = draftRef.current;
    const next = join(draftRef.current, item.text ?? item.label);
    commit(next);
    setAccepted(item);
    setStatus("accepted");
    wantFocus.current = true;
    onAccept?.(item, next);
  };

  const undo = () => {
    commit(base.current);
    setAccepted(undefined);
    setStatus(items.length ? "available" : "idle");
    wantFocus.current = true;
    onUndo?.();
  };

  const dismiss = () => {
    cancel();
    setStatus("dismissed");
    wantFocus.current = true;
    onDismiss?.();
  };

  const retry = () => offer(draftRef.current);

  const reset = () => {
    cancel();
    setAccepted(undefined);
    setStatus("idle");
  };

  const submit = (v: string) => {
    const r = onSubmit(v);
    if (r && typeof (r as Promise<unknown>).then === "function") {
      return (r as Promise<unknown>).then((x) => {
        commit("");
        reset();
        return x;
      });
    }
    commit("");
    reset();
    return r;
  };

  return {
    draft,
    status,
    items: items.slice(0, max),
    accepted,
    fieldRef,
    type,
    select,
    undo,
    dismiss,
    retry,
    submit,
  };
}

/**
 * Suggestions wired to the Open Input composer: after a pause on a request in
 * progress, a short row of chips — marked as the agent's, with Why and
 * Dismiss — sits just above the composer. Pressing a chip appends its words
 * after the person's own (never replacing them), keeps them editable, returns
 * focus to the field and replaces the row with a one-line confirmation and
 * Undo. Nothing is ever sent for them. Suggestions come from `suggestions` or
 * an async `loadSuggestions`, and withdraw quietly when `isRelevant` says the
 * request has changed.
 */
export const SuggestionsComposer = React.forwardRef<HTMLDivElement, SuggestionsComposerProps>((props, ref) => {
  const {
    value: _v,
    defaultValue: _dv,
    onValueChange: _ovc,
    onSubmit: _os,
    suggestions: _s,
    loadSuggestions: _ls,
    pauseMs: _pm,
    minLength: _ml,
    isRelevant: _ir,
    join: _j,
    label,
    reason,
    actionLabel = "Add to prompt",
    dismissible = true,
    undoable = true,
    max,
    onAccept: _oa,
    onDismiss: _od,
    onUndo: _ou,
    placeholder = "Describe what you need…",
    composerActions,
    loading,
    onStop,
    messages,
    onAdd,
    addLabel,
    add,
    model,
    onVoice,
    voiceLabel,
    className,
    ...rest
  } = props;
  const c = useSuggestionsComposer(props);
  return (
    <div ref={ref} className={cn("flex w-full flex-col gap-2.5", className)} {...rest}>
      <Suggestions
        suggestions={c.items}
        status={c.status}
        label={label}
        reason={reason}
        actionLabel={actionLabel}
        max={max}
        accepted={c.accepted}
        onSelect={c.select}
        onDismiss={dismissible ? c.dismiss : undefined}
        onUndo={undoable ? c.undo : undefined}
        onRetry={c.retry}
        messages={messages}
      />
      <OpenInput
        ref={c.fieldRef}
        value={c.draft}
        onValueChange={c.type}
        onSubmit={c.submit}
        placeholder={placeholder}
        aria-label={placeholder}
        sendLabel="Send"
        actions={composerActions}
        loading={loading}
        onStop={onStop}
        onAdd={onAdd}
        addLabel={addLabel}
        add={add}
        model={model}
        onVoice={onVoice}
        voiceLabel={voiceLabel}
      />
    </div>
  );
});
SuggestionsComposer.displayName = "SuggestionsComposer";

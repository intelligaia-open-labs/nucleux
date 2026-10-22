import * as React from "react";
import { cn } from "@nucleux/utils";
import { Kbd } from "@nucleux/kbd";
import { Textarea, type TextareaProps } from "@nucleux/textarea";

// useLayoutEffect warns when rendered on the server; fall back to useEffect there.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

/** Spec variants: inline ghost suffix, a whole sentence with key hints, or a multi-line block. */
export type AutocompleteVariant = "ghost-suffix" | "sentence-completion" | "block-completion";

/** Which key accepts the whole suggestion. Never Enter: Enter stays with the host (send / new line). */
export type AutocompleteAcceptKey = "tab" | "right" | "both";

/** Where the completion currently is, reported through `onStateChange`. */
export type AutocompleteState = "idle" | "loading" | "available" | "accepted" | "dismissed" | "error";

/** What `getSuggestion` receives besides the text. */
export interface AutocompleteRequest {
  /** Aborted when the text changes again before the suggestion arrives. */
  signal: AbortSignal;
}

export interface AutocompleteProps
  extends Omit<TextareaProps, "value" | "defaultValue" | "onChange" | "className"> {
  /** Field value (controlled). */
  value?: string;
  /** Initial value (uncontrolled). */
  defaultValue?: string;
  /** Called with the new text on every edit and on accept. */
  onValueChange?: (value: string) => void;
  /** Native change handler, still called on typing. */
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  /**
   * Supplies the completion for the text so far — the app calls its model here.
   * Return the continuation to show after the caret (a result that repeats the
   * typed text is trimmed to the part after it), or `null` for none. May be async.
   */
  getSuggestion?: (
    text: string,
    request: AutocompleteRequest,
  ) => string | null | undefined | Promise<string | null | undefined>;
  /** A fixed suggestion to show (controlled), instead of calling `getSuggestion`. */
  suggestion?: string | null;
  /** Layout of the suggestion. Defaults to `"ghost-suffix"`. */
  variant?: AutocompleteVariant;
  /** Characters needed before asking for a suggestion. Defaults to `8`. */
  minChars?: number;
  /** Wait after the last keystroke before asking, in ms. Defaults to `150`. */
  debounceMs?: number;
  /** Key that accepts the whole suggestion. Defaults to `"tab"`. ⌘/Ctrl + → always accepts one word. */
  acceptKey?: AutocompleteAcceptKey;
  /** Called with the text that was inserted when a suggestion (or a word of it) is accepted. */
  onAccept?: (inserted: string) => void;
  /** Called when Escape dismisses the suggestion. It stays away until the field is cleared. */
  onDismiss?: () => void;
  /** Called when `getSuggestion` throws or rejects. The field keeps working without a suggestion. */
  onError?: (error: unknown) => void;
  /** Called whenever the completion state changes. */
  onStateChange?: (state: AutocompleteState) => void;
  /** Visible label for the field. Without it, pass `aria-label`. */
  label?: React.ReactNode;
  /** Classes for the outer wrapper. */
  className?: string;
  /** Classes for the text field itself. */
  fieldClassName?: string;
  /** Hide the "Tab to accept / Esc to dismiss" row of the sentence and block variants. */
  hideHints?: boolean;
  /**
   * A title for the field ("Compose message"). With it (or `badge`) the field
   * becomes a framed shell, as on nucleux.in: a header bar with this title
   * (which labels the field) and the `badge`, the text, then a footer with the
   * key hints and `footerEnd`.
   */
  heading?: React.ReactNode;
  /** A small tag at the right of the shell's header, e.g. "AI autocomplete". */
  badge?: React.ReactNode;
  /** Content at the right of the shell's footer, e.g. a "42 / 4000" counter. */
  footerEnd?: React.ReactNode;
}

interface Pending {
  base: string;
  suffix: string;
}

const isPromise = <T,>(v: unknown): v is Promise<T> =>
  !!v && typeof (v as Promise<T>).then === "function";

/** Strip a repeat of the typed text from a provider's answer. */
function continuationOf(text: string, raw: string | null | undefined): string {
  if (!raw) return "";
  return raw.startsWith(text) && text.length > 0 ? raw.slice(text.length) : raw;
}

/** The first word (with its leading space) of a suggestion, for ⌘/Ctrl + →. */
function firstWord(suffix: string): string {
  const m = /^\s*\S+/.exec(suffix);
  return m ? m[0] : suffix;
}

const keyLabel = (k: AutocompleteAcceptKey) => (k === "right" ? "→" : "Tab");

/**
 * A text field that shows the likely rest of what the person is typing as faded
 * ghost text after the caret. Tab (or the host's chosen key, never Enter)
 * accepts it as ordinary, editable text; ⌘/Ctrl + → takes one word; Escape
 * dismisses it until the field is cleared; typing the same words keeps it, and
 * diverging drops it. The suggestion lives in an `aria-hidden` overlay, outside
 * the field's value, and is announced once through a polite live region.
 * Suggestions come from the async `getSuggestion` prop (or a fixed
 * `suggestion`); accepting never submits.
 */
export const Autocomplete = React.forwardRef<HTMLTextAreaElement, AutocompleteProps>(
  (
    {
      value: valueProp,
      defaultValue = "",
      onValueChange,
      onChange,
      getSuggestion,
      suggestion: suggestionProp,
      variant = "ghost-suffix",
      minChars = 8,
      debounceMs = 150,
      acceptKey = "tab",
      onAccept,
      onDismiss,
      onError,
      onStateChange,
      label,
      className,
      fieldClassName,
      hideHints = false,
      heading,
      badge,
      footerEnd,
      id: idProp,
      rows,
      onKeyDown,
      onSelect,
      onScroll,
      disabled,
      readOnly,
      spellCheck,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const autoId = React.useId();
    const id = idProp ?? `${autoId}-field`;
    const hintId = `${autoId}-hint`;
    const fieldRef = React.useRef<HTMLTextAreaElement>(null);
    const mirrorRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => fieldRef.current as HTMLTextAreaElement);

    const [internal, setInternal] = React.useState(defaultValue);
    const isControlled = valueProp !== undefined;
    const value = isControlled ? valueProp : internal;

    const [pending, setPending] = React.useState<Pending | null>(null);
    const [dismissed, setDismissed] = React.useState(false);
    const [caretAtEnd, setCaretAtEnd] = React.useState(true);
    const [announcement, setAnnouncement] = React.useState("");
    const [state, setState] = React.useState<AutocompleteState>("idle");
    const moveCaretToEnd = React.useRef(false);

    const onStateChangeRef = React.useRef(onStateChange);
    onStateChangeRef.current = onStateChange;
    const stateRef = React.useRef<AutocompleteState>("idle");
    const report = React.useCallback((next: AutocompleteState) => {
      if (stateRef.current === next) return;
      stateRef.current = next;
      setState(next);
      onStateChangeRef.current?.(next);
    }, []);

    // The suggestion still continuing what is typed: it follows along while the
    // person types the same words and is gone the moment they diverge.
    const fromProvider =
      pending && value.startsWith(pending.base) && (pending.base + pending.suffix).startsWith(value)
        ? (pending.base + pending.suffix).slice(value.length)
        : "";
    const raw = suggestionProp !== undefined ? continuationOf(value, suggestionProp) : fromProvider;
    const shown = !dismissed && caretAtEnd && !disabled && !readOnly && raw.length > 0 ? raw : "";

    // Ask the provider (debounced, abortable) when nothing usable is showing.
    const getSuggestionRef = React.useRef(getSuggestion);
    getSuggestionRef.current = getSuggestion;
    const onErrorRef = React.useRef(onError);
    onErrorRef.current = onError;
    const following = fromProvider.length > 0;
    React.useEffect(() => {
      if (suggestionProp !== undefined || !getSuggestionRef.current) return;
      if (dismissed || following || value.length < minChars) return;
      const controller = new AbortController();
      const timer = window.setTimeout(() => {
        report("loading");
        let result: ReturnType<NonNullable<AutocompleteProps["getSuggestion"]>>;
        try {
          result = getSuggestionRef.current!(value, { signal: controller.signal });
        } catch (error) {
          report("error");
          onErrorRef.current?.(error);
          return;
        }
        const settle = (r: string | null | undefined) => {
          if (controller.signal.aborted) return;
          const suffix = continuationOf(value, r);
          setPending(suffix ? { base: value, suffix } : null);
          report(suffix ? "available" : "idle");
        };
        if (isPromise<string | null | undefined>(result)) {
          result.then(settle, (error: unknown) => {
            if (controller.signal.aborted) return;
            report("error");
            onErrorRef.current?.(error);
          });
        } else settle(result);
      }, debounceMs);
      return () => {
        window.clearTimeout(timer);
        controller.abort();
      };
    }, [value, dismissed, following, minChars, debounceMs, suggestionProp, report]);

    // Announce a suggestion once, when it appears — not on every keystroke that follows it.
    const identity = shown ? (suggestionProp !== undefined ? `p:${suggestionProp}` : `${pending?.base}|${pending?.suffix}`) : "";
    const lastIdentity = React.useRef("");
    React.useEffect(() => {
      if (identity && identity !== lastIdentity.current) {
        setAnnouncement(`Suggestion: ${value}${shown}. ${keyLabel(acceptKey)} to accept.`);
        report("available");
      }
      if (!identity && lastIdentity.current) {
        setAnnouncement("");
        if (stateRef.current === "available") report("idle");
      }
      lastIdentity.current = identity;
      // Only a new suggestion should re-announce, so this keys on its identity alone.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [identity]);

    const commit = (next: string) => {
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    };

    const accept = (inserted: string) => {
      if (!inserted) return;
      moveCaretToEnd.current = true;
      commit(value + inserted);
      onAccept?.(inserted);
      report("accepted");
    };

    const dismiss = () => {
      setDismissed(true);
      setPending(null);
      onDismiss?.();
      report("dismissed");
    };

    // After accepting, put the caret after the inserted text.
    useIsomorphicLayoutEffect(() => {
      const el = fieldRef.current;
      if (!moveCaretToEnd.current || !el) return;
      moveCaretToEnd.current = false;
      el.setSelectionRange(value.length, value.length);
      el.focus();
      setCaretAtEnd(true);
    }, [value]);

    const syncCaret = (el: HTMLTextAreaElement) =>
      setCaretAtEnd(el.selectionStart === el.selectionEnd && el.selectionEnd === el.value.length);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e);
      const next = e.target.value;
      if (next.length === 0) {
        setDismissed(false); // a cleared field is a new request
        setPending(null);
        report("idle");
      }
      commit(next);
      syncCaret(e.target);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented || !shown || e.nativeEvent.isComposing) return;
      const wantsTab = acceptKey === "tab" || acceptKey === "both";
      const wantsRight = acceptKey === "right" || acceptKey === "both";
      if (e.key === "Tab" && wantsTab && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        accept(shown);
      } else if (e.key === "ArrowRight" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        accept(firstWord(shown));
      } else if (e.key === "ArrowRight" && wantsRight && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        accept(shown);
      } else if (e.key === "Escape") {
        e.preventDefault();
        dismiss();
      }
    };

    const isBlock = variant === "block-completion";
    const shell = heading != null || badge != null;
    const showHints = shown && !hideHints && variant !== "ghost-suffix";
    const headingId = `${autoId}-heading`;
    const hintChip =
      "inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 font-medium transition-colors hover:bg-accent hover:text-foreground";
    const keyCap = shell ? "h-auto min-w-0 border-0 bg-transparent p-0 font-sans font-bold text-foreground" : "bg-background";
    // Shared box metrics so the overlay lines up with the field's text exactly.
    const metrics = cn(
      "whitespace-pre-wrap break-words border border-transparent text-sm",
      shell ? "p-3.5" : "px-3 py-2",
      isBlock && "font-mono leading-6",
      !isBlock && "leading-5",
    );

    return (
      <div
        className={cn(
          "flex w-full flex-col",
          shell
            ? "overflow-hidden rounded-xl border border-border bg-background transition-shadow focus-within:ring-1 focus-within:ring-ring"
            : "gap-1.5",
          className,
        )}
        data-variant={variant}
        data-state={state}
      >
        {shell && (
          <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-3.5 py-2">
            <span id={headingId} className="text-xs font-semibold text-muted-foreground">
              {heading}
            </span>
            {badge != null && (
              <span className="rounded-md bg-muted px-2 py-0.5 text-[0.6875rem] font-semibold text-muted-foreground">
                {badge}
              </span>
            )}
          </div>
        )}
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          <Textarea
            {...props}
            ref={fieldRef}
            id={id}
            rows={rows ?? (isBlock ? 6 : 3)}
            value={value}
            disabled={disabled}
            readOnly={readOnly}
            spellCheck={isBlock ? false : spellCheck}
            aria-autocomplete="inline"
            aria-labelledby={shell && !label && heading != null ? headingId : props["aria-labelledby"]}
            aria-describedby={[ariaDescribedBy, showHints ? hintId : ""].filter(Boolean).join(" ") || undefined}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onSelect={(e) => {
              onSelect?.(e);
              syncCaret(e.currentTarget);
            }}
            onScroll={(e) => {
              onScroll?.(e);
              if (mirrorRef.current) mirrorRef.current.scrollTop = e.currentTarget.scrollTop;
            }}
            className={cn(
              metrics,
              shell
                ? "resize-none rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                : "border-input resize-y",
              fieldClassName,
            )}
          />
          <div
            ref={mirrorRef}
            aria-hidden="true"
            className={cn(metrics, "pointer-events-none absolute inset-0 overflow-hidden text-transparent")}
          >
            {value}
            {shown && (
              <span
                data-slot="autocomplete-ghost"
                onMouseDown={(e) => {
                  e.preventDefault();
                  accept(shown);
                }}
                className="pointer-events-auto cursor-pointer italic text-muted-foreground/80 animate-nx-fade-in motion-reduce:animate-none"
              >
                {shown}
                {variant === "ghost-suffix" && (
                  <Kbd className="ml-1.5 border border-border bg-background not-italic align-middle">
                    {keyLabel(acceptKey)}
                  </Kbd>
                )}
              </span>
            )}
          </div>
        </div>
        {(showHints || (shell && footerEnd != null)) && (
          <div
            className={cn(
              "flex items-center justify-between gap-2",
              shell && "min-h-10 border-t border-border px-3.5 py-2",
            )}
          >
            {showHints ? (
              <div id={hintId} className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <button
                  type="button"
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => accept(shown)}
                  className={hintChip}
                >
                  <Kbd className={keyCap}>{keyLabel(acceptKey)}</Kbd> to accept
                </button>
                <button
                  type="button"
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={dismiss}
                  className={hintChip}
                >
                  <Kbd className={keyCap}>Esc</Kbd> dismiss
                </button>
              </div>
            ) : (
              <span />
            )}
            {shell && footerEnd != null && (
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{footerEnd}</span>
            )}
          </div>
        )}
        <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {announcement}
        </span>
      </div>
    );
  },
);
Autocomplete.displayName = "Autocomplete";

export interface AutocompleteOverlayProps {
  /**
   * The composer's own text field (e.g. the ref forwarded by `OpenInput` /
   * `Md3OpenInput`). The overlay lines its ghost text up with this field, and
   * handles the field's Tab, → and Escape while a suggestion shows.
   */
  fieldRef: React.RefObject<HTMLTextAreaElement | HTMLInputElement>;
  /** The field's current text. */
  value: string;
  /** Called with the new text when a suggestion (or a word of it) is accepted. */
  onValueChange: (value: string) => void;
  /**
   * The completion for `value`: the continuation after the caret, or the whole
   * request (a repeat of the typed text is trimmed). `null` for none.
   */
  suggestion?: string | null;
  /** Key that accepts the whole suggestion. Defaults to `"tab"`. ⌘/Ctrl + → always accepts one word. */
  acceptKey?: AutocompleteAcceptKey;
  /** Called with the text that was inserted when a suggestion (or a word of it) is accepted. */
  onAccept?: (inserted: string) => void;
  /** Called when Escape dismisses the suggestion. It stays away until the field is cleared. */
  onDismiss?: () => void;
  /** Show the accept key at the end of the ghost text. Defaults to true. */
  showKey?: boolean;
  /** Classes for the ghost text (replaces its default colour). */
  ghostClassName?: string;
  /** Classes for the key cap at its end (replaces its default border and fill). */
  keyClassName?: string;
}

const MIRRORED = [
  "fontFamily", "fontSize", "fontWeight", "fontStyle", "letterSpacing", "lineHeight", "textTransform",
  "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
  "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth", "boxSizing", "textAlign",
] as const;

/**
 * Inline autocomplete for a composer you already have: render it next to the
 * composer, inside a `relative` wrapper, and pass the composer's field ref. It
 * mirrors the field's box and type so the likely rest of the request shows as
 * faded ghost text right after the caret, with its key at the end — without
 * forking or re-drawing the composer. Tab (or the chosen key, never Enter)
 * accepts it as ordinary, editable text, ⌘/Ctrl + → takes one word, Escape
 * dismisses it until the field is cleared, and a tap on it accepts it. The
 * ghost text is `aria-hidden`; a polite live region announces it once.
 */
export function AutocompleteOverlay({
  fieldRef,
  value,
  onValueChange,
  suggestion,
  acceptKey = "tab",
  onAccept,
  onDismiss,
  showKey = true,
  ghostClassName,
  keyClassName,
}: AutocompleteOverlayProps) {
  const mirrorRef = React.useRef<HTMLDivElement>(null);
  const [dismissed, setDismissed] = React.useState(false);
  const [caretAtEnd, setCaretAtEnd] = React.useState(true);
  const [announcement, setAnnouncement] = React.useState("");

  if (value === "" && dismissed) setDismissed(false); // a cleared field is a new request
  const raw = continuationOf(value, suggestion);
  const shown = !dismissed && caretAtEnd && raw.length > 0 ? raw : "";

  // Line the mirror up with the field on every render (its row and height move as the composer grows).
  useIsomorphicLayoutEffect(() => {
    const field = fieldRef.current;
    const mirror = mirrorRef.current;
    const parent = mirror?.offsetParent;
    if (!field || !mirror || !parent) return;
    const f = field.getBoundingClientRect();
    const p = parent.getBoundingClientRect();
    const cs = window.getComputedStyle(field);
    Object.assign(mirror.style, {
      top: `${f.top - p.top}px`,
      left: `${f.left - p.left}px`,
      width: `${f.width}px`,
      height: `${f.height}px`,
    });
    for (const k of MIRRORED) mirror.style[k] = cs[k];
    // A one-line field (a composer row) does not grow for the ghost: keep it on the line, clipped with an ellipsis.
    const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const oneLine = field.clientHeight - pad <= (parseFloat(cs.lineHeight) || 20) * 1.5;
    mirror.style.whiteSpace = oneLine ? "pre" : "pre-wrap";
    mirror.style.textOverflow = oneLine ? "ellipsis" : "clip";
    mirror.scrollTop = field.scrollTop;
  });

  // Keys and caret tracking on the field itself.
  const latest = React.useRef({ shown, value, onValueChange, onAccept, onDismiss, acceptKey });
  latest.current = { shown, value, onValueChange, onAccept, onDismiss, acceptKey };
  const accept = React.useCallback((inserted: string) => {
    const { value: v, onValueChange: set, onAccept: done } = latest.current;
    if (!inserted) return;
    set(v + inserted);
    done?.(inserted);
    const field = fieldRef.current;
    requestAnimationFrame(() => {
      if (!field) return;
      field.focus();
      field.setSelectionRange(field.value.length, field.value.length);
      setCaretAtEnd(true);
    });
  }, [fieldRef]);
  React.useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    const sync = () =>
      setCaretAtEnd(field.selectionStart === field.selectionEnd && field.selectionEnd === field.value.length);
    const onKey = (e: Event) => {
      const k = e as KeyboardEvent;
      const { shown: s, acceptKey: key, onDismiss: dismiss } = latest.current;
      if (!s || k.isComposing) return;
      const wantsTab = key === "tab" || key === "both";
      const wantsRight = key === "right" || key === "both";
      if (k.key === "Tab" && wantsTab && !k.shiftKey && !k.altKey && !k.ctrlKey && !k.metaKey) {
        k.preventDefault();
        accept(s);
      } else if (k.key === "ArrowRight" && (k.metaKey || k.ctrlKey)) {
        k.preventDefault();
        accept(firstWord(s));
      } else if (k.key === "ArrowRight" && wantsRight && !k.shiftKey && !k.altKey) {
        k.preventDefault();
        accept(s);
      } else if (k.key === "Escape") {
        k.preventDefault();
        setDismissed(true);
        dismiss?.();
      }
    };
    const onScroll = () => {
      if (mirrorRef.current) mirrorRef.current.scrollTop = field.scrollTop;
    };
    field.addEventListener("keydown", onKey);
    field.addEventListener("select", sync);
    field.addEventListener("keyup", sync);
    field.addEventListener("click", sync);
    field.addEventListener("input", sync);
    field.addEventListener("scroll", onScroll);
    return () => {
      field.removeEventListener("keydown", onKey);
      field.removeEventListener("select", sync);
      field.removeEventListener("keyup", sync);
      field.removeEventListener("click", sync);
      field.removeEventListener("input", sync);
      field.removeEventListener("scroll", onScroll);
    };
  }, [fieldRef, accept]);

  // Announce a suggestion once, when it appears.
  const full = shown ? value + shown : "";
  React.useEffect(() => {
    setAnnouncement(full ? `Suggestion: ${full}. ${keyLabel(acceptKey)} to accept.` : "");
    // Only a new completion re-announces (typing along it keeps the same full text).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [full]);

  return (
    <>
      <div
        ref={mirrorRef}
        aria-hidden="true"
        data-slot="autocomplete-overlay"
        className="pointer-events-none absolute overflow-hidden whitespace-pre-wrap break-words border-solid border-transparent text-transparent"
      >
        {value}
        {shown && (
          <span
            data-slot="autocomplete-ghost"
            onMouseDown={(e) => {
              e.preventDefault();
              accept(shown);
            }}
            className={cn(
              "pointer-events-auto cursor-pointer animate-nx-fade-in motion-reduce:animate-none",
              ghostClassName ?? "text-muted-foreground/80",
            )}
          >
            {shown}
            {showKey && (
              <Kbd className={cn("ml-1.5 align-middle", keyClassName ?? "border border-border bg-background")}>
                {keyLabel(acceptKey)}
              </Kbd>
            )}
          </span>
        )}
      </div>
      <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </span>
    </>
  );
}
AutocompleteOverlay.displayName = "AutocompleteOverlay";

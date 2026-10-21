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
    const showHints = shown && !hideHints && variant !== "ghost-suffix";
    // Shared box metrics so the overlay lines up with the field's text exactly.
    const metrics = cn(
      "whitespace-pre-wrap break-words border border-transparent px-3 py-2 text-sm",
      isBlock && "font-mono leading-6",
      !isBlock && "leading-5",
    );

    return (
      <div
        className={cn("flex w-full flex-col gap-1.5", className)}
        data-variant={variant}
        data-state={state}
      >
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
            className={cn(metrics, "border-input resize-y", fieldClassName)}
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
        {showHints && (
          <div id={hintId} className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => accept(shown)}
              className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 transition-colors hover:bg-accent hover:text-foreground"
            >
              <Kbd className="bg-background">{keyLabel(acceptKey)}</Kbd> to accept
            </button>
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              onClick={dismiss}
              className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 transition-colors hover:bg-accent hover:text-foreground"
            >
              <Kbd className="bg-background">Esc</Kbd> to dismiss
            </button>
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

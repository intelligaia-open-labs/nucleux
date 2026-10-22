import * as React from "react";
import { cn } from "@nucleux/utils";
import { AutocompleteOverlay } from "@nucleux/autocomplete";
import type {
  AutocompleteAcceptKey,
  AutocompleteOverlayProps,
  AutocompleteProps,
  AutocompleteRequest,
  AutocompleteState,
  AutocompleteVariant,
} from "@nucleux/autocomplete";

/** Same props as `Autocomplete` from `@nucleux/autocomplete` — swap the import to switch families. */
export type Md3AutocompleteProps = AutocompleteProps;
/** Spec variants: inline ghost suffix, a whole sentence with key hints, or a multi-line block. */
export type Md3AutocompleteVariant = AutocompleteVariant;
/** Which key accepts the whole suggestion. Never Enter. */
export type Md3AutocompleteAcceptKey = AutocompleteAcceptKey;
/** Where the completion currently is, reported through `onStateChange`. */
export type Md3AutocompleteState = AutocompleteState;
/** What `getSuggestion` receives besides the text. */
export type Md3AutocompleteRequest = AutocompleteRequest;

// useLayoutEffect warns when rendered on the server; fall back to useEffect there.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

interface Pending {
  base: string;
  suffix: string;
}

// The helpers below are copied from @nucleux/autocomplete (internal there) so
// the two families complete, follow along and accept identically.
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

/** A small outlined key cap (Material 3 has no kbd component; label-small on outline). */
function KeyCap({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-md-xs border border-md-outline px-1 font-sans text-[11px] font-medium not-italic leading-none tracking-[0.03em] text-md-on-surface-variant",
        className,
      )}
    >
      {children}
    </kbd>
  );
}

// Assist-chip-sized hint button with a Material state layer.
const hintChip = cn(
  "relative inline-flex h-6 items-center gap-1.5 overflow-hidden rounded-md-sm border border-md-outline-variant px-2 text-xs font-medium tracking-[0.03em] text-md-on-surface-variant",
  "before:absolute before:inset-0 before:bg-md-on-surface-variant before:opacity-0 before:transition-opacity before:content-['']",
  "hover:before:opacity-[0.08] active:before:opacity-[0.12] motion-reduce:before:transition-none",
);

/**
 * The Material 3 twin of `Autocomplete`: a filled Material text area that
 * shows the likely rest of what the person is typing after the caret, in
 * on-surface-variant, fading in over 150 ms (no fade under reduced motion),
 * with a small outlined key at its end. Tab (or the host's chosen key, never
 * Enter) accepts it as ordinary, editable text; ⌘/Ctrl + → takes one word;
 * Escape dismisses it until the field is cleared; typing the same words keeps
 * it, and diverging drops it. The suggestion lives in an `aria-hidden` overlay,
 * outside the field's value, and is announced once through a polite live
 * region. Same props, callbacks and keyboard model as the shadcn twin.
 */
export const Md3Autocomplete = React.forwardRef<HTMLTextAreaElement, Md3AutocompleteProps>(
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
      invalid = false,
      "aria-invalid": ariaInvalid,
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
    const identity = shown
      ? suggestionProp !== undefined
        ? `p:${suggestionProp}`
        : `${pending?.base}|${pending?.suffix}`
      : "";
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
    const isInvalid = ariaInvalid ?? (invalid || undefined);
    const showHints = shown && !hideHints && variant !== "ghost-suffix";
    const shell = heading != null || badge != null;
    const headingId = `${autoId}-heading`;
    // Shared box metrics so the overlay lines up with the field's text exactly
    // (body-large for prose, a 14px monospace for code).
    const metrics = cn(
      "whitespace-pre-wrap break-words border-2 border-transparent px-4 py-3",
      isBlock ? "font-mono text-sm leading-6" : "text-base leading-6 tracking-[0.03em]",
    );

    return (
      <div
        className={cn(
          "flex w-full flex-col",
          shell
            ? "overflow-hidden rounded-md-md border border-md-outline-variant bg-md-surface transition-colors duration-150 focus-within:border-md-primary motion-reduce:transition-none"
            : "gap-1",
          className,
        )}
        data-variant={variant}
        data-state={state}
      >
        {shell && (
          <div className="flex items-center justify-between gap-2 border-b border-md-outline-variant bg-md-surface-container-low px-4 py-2">
            <span id={headingId} className="text-sm font-medium tracking-[0.1px] text-md-on-surface-variant">
              {heading}
            </span>
            {badge != null && (
              <span className="rounded-md-sm bg-md-secondary-container px-2 py-0.5 text-[11px] font-medium tracking-[0.5px] text-md-on-secondary-container">
                {badge}
              </span>
            )}
          </div>
        )}
        {label && (
          <label
            htmlFor={id}
            className={cn(
              "px-4 text-xs font-medium tracking-[0.03em]",
              isInvalid ? "text-md-error" : "text-md-on-surface-variant",
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            {...props}
            ref={fieldRef}
            id={id}
            rows={rows ?? (isBlock ? 6 : 3)}
            value={value}
            disabled={disabled}
            readOnly={readOnly}
            spellCheck={isBlock ? false : spellCheck}
            aria-invalid={isInvalid}
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
              "block min-h-14 w-full text-md-on-surface caret-md-primary outline-none transition-colors duration-150 motion-reduce:transition-none",
              shell ? "resize-none rounded-none bg-transparent" : "resize-y rounded-md-lg bg-md-surface-container-high",
              "placeholder:text-md-on-surface-variant",
              !shell && "focus-visible:border-md-primary",
              isInvalid && "border-md-error focus-visible:border-md-error caret-md-error",
              "disabled:cursor-not-allowed disabled:opacity-[0.38]",
              fieldClassName,
            )}
          />
          <div
            ref={mirrorRef}
            aria-hidden="true"
            className={cn(metrics, "pointer-events-none absolute inset-0 overflow-hidden text-transparent", !shell && "rounded-md-lg")}
          >
            {value}
            {shown && (
              <span
                data-slot="autocomplete-ghost"
                onMouseDown={(e) => {
                  e.preventDefault();
                  accept(shown);
                }}
                className="pointer-events-auto cursor-pointer text-md-on-surface-variant animate-[nx-fade-in_150ms_cubic-bezier(0.2,0,0,1)] motion-reduce:animate-none"
              >
                {shown}
                {variant === "ghost-suffix" && (
                  <KeyCap className="ml-1.5 align-middle">{keyLabel(acceptKey)}</KeyCap>
                )}
              </span>
            )}
          </div>
        </div>
        {(showHints || (shell && footerEnd != null)) && (
          <div
            className={cn(
              "flex items-center justify-between gap-2",
              shell ? "min-h-11 border-t border-md-outline-variant px-4 py-2" : "px-4 pt-1",
            )}
          >
            {showHints ? (
              <div id={hintId} className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => accept(shown)}
                  className={hintChip}
                >
                  <KeyCap className="relative">{keyLabel(acceptKey)}</KeyCap>
                  <span className="relative">to accept</span>
                </button>
                <button
                  type="button"
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={dismiss}
                  className={hintChip}
                >
                  <KeyCap className="relative">Esc</KeyCap>
                  <span className="relative">dismiss</span>
                </button>
              </div>
            ) : (
              <span />
            )}
            {shell && footerEnd != null && (
              <span className="shrink-0 text-xs tabular-nums tracking-[0.4px] text-md-on-surface-variant">{footerEnd}</span>
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
Md3Autocomplete.displayName = "Md3Autocomplete";

/** Same props as `AutocompleteOverlay` from `@nucleux/autocomplete`. */
export type Md3AutocompleteOverlayProps = AutocompleteOverlayProps;

/**
 * The Material 3 twin of `AutocompleteOverlay`: inline autocomplete for a
 * composer you already have (`Md3OpenInput`, `Md3AgentComposer`). Render it
 * beside the composer in a `relative` wrapper with the composer's field ref;
 * the likely rest of the request shows after the caret in on-surface-variant
 * with an outlined key cap, and Tab / ⌘·Ctrl + → / Escape behave as in
 * `Md3Autocomplete`, without re-drawing the composer.
 */
export function Md3AutocompleteOverlay({ ghostClassName, keyClassName, ...props }: Md3AutocompleteOverlayProps) {
  return (
    <AutocompleteOverlay
      {...props}
      ghostClassName={cn("text-md-on-surface-variant/80", ghostClassName)}
      keyClassName={cn(
        "h-5 min-w-5 rounded-md-xs border border-md-outline bg-transparent px-1 font-sans text-[11px] font-medium leading-none text-md-on-surface-variant",
        keyClassName,
      )}
    />
  );
}
Md3AutocompleteOverlay.displayName = "Md3AutocompleteOverlay";

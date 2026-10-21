import * as React from "react";
import { ArrowUp, RotateCw, Square } from "lucide-react";
import { cn } from "@nucleux/utils";
import { Button } from "@nucleux/button";
import { Spinner } from "@nucleux/spinner";

// useLayoutEffect warns when rendered on the server; fall back to useEffect there.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

/** Layout of the composer, from the spec's variants. */
export type OpenInputVariant = "expanding-area" | "single-line" | "input-with-send";

/** Which key sends: plain Enter (Shift+Enter is a newline), or ⌘/Ctrl+Enter (Enter is a newline). */
export type OpenInputSendKey = "enter" | "mod-enter";

export interface OpenInputProps
  extends Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    "onSubmit" | "value" | "defaultValue" | "onChange"
  > {
  /** Controlled value of the input. Omit (and use `defaultValue`) for an uncontrolled composer. */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  /** Called when the value changes. */
  onValueChange?: (value: string) => void;
  /**
   * Called with the trimmed value on submit (send key or button). May return a
   * promise: while it is pending the send button shows a spinner; if it
   * rejects, the text is kept and an error row with Retry appears. An
   * uncontrolled composer clears itself only after a successful send.
   */
  onSubmit: (value: string) => void | Promise<unknown>;
  /** Show the agent as busy — swaps the send button for a stop button. */
  loading?: boolean;
  /** Called when the stop button is pressed while `loading`. */
  onStop?: () => void;
  /** Max auto-grow height in px before scrolling (about six lines by default). */
  maxHeight?: number;
  /**
   * "expanding-area" (default): grows with the prompt, controls in a footer row.
   * "single-line": a compact one-row pill for dense layouts.
   * "input-with-send": the field and a separate, explicit send button.
   */
  variant?: OpenInputVariant;
  /** Visible label above the composer. Without it, pass `aria-label`. */
  label?: React.ReactNode;
  /** Send key. Defaults to "enter". The send button carries it as `aria-keyshortcuts`. */
  sendKey?: OpenInputSendKey;
  /** Accessible name of the send button. Defaults to "Send message". */
  sendLabel?: string;
  /** Accessible name of the stop button. Defaults to "Stop generating". */
  stopLabel?: string;
  /** Secondary controls (add context, voice, model…) placed beside the send button. They never touch the text. */
  actions?: React.ReactNode;
  /**
   * With `maxLength`, the character counter appears once the text reaches this
   * fraction of the limit. Defaults to 0.8. Set 0 to always show it.
   */
  counterThreshold?: number;
  /** A send error to show (controlled). Overrides the built-in message shown when `onSubmit` rejects. */
  error?: React.ReactNode;
  /** Called by the error row's Retry button. Defaults to submitting the current text again. */
  onRetry?: () => void;
  /** Classes for the outer wrapper (label, composer and error). `className` styles the composer box itself. */
  containerClassName?: string;
}

const DEFAULT_ERROR = "Couldn't send your message. It's still here — edit it or try again.";

const isPromise = (v: unknown): v is Promise<unknown> =>
  !!v && typeof (v as { then?: unknown }).then === "function";

/**
 * The persistent free-form composer for any natural-language ask. It grows
 * with the prompt up to a ceiling and then scrolls, always pairs the field
 * with a visible send button (Enter, or ⌘/Ctrl+Enter with
 * `sendKey="mod-enter"`), keeps Send disabled only while there is nothing to
 * send, shows a character counter only near `maxLength`, and never loses the
 * text: an uncontrolled composer clears only after `onSubmit` succeeds, and a
 * failed send keeps the text and offers Retry. While `loading`, the send
 * button becomes a stop button wired to `onStop`.
 */
export const OpenInput = React.forwardRef<HTMLTextAreaElement, OpenInputProps>(
  (
    {
      value: valueProp,
      defaultValue = "",
      onValueChange,
      onSubmit,
      loading = false,
      onStop,
      maxHeight = 200,
      variant = "expanding-area",
      label,
      sendKey = "enter",
      sendLabel = "Send message",
      stopLabel = "Stop generating",
      actions,
      counterThreshold = 0.8,
      error,
      onRetry,
      containerClassName,
      placeholder = "Message the agent…",
      className,
      disabled,
      maxLength,
      id: idProp,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    forwardedRef,
  ) => {
    const innerRef = React.useRef<HTMLTextAreaElement>(null);
    React.useImperativeHandle(forwardedRef, () => innerRef.current as HTMLTextAreaElement);

    const autoId = React.useId();
    const fieldId = idProp ?? `${autoId}-field`;
    const errorId = `${autoId}-error`;

    const isControlled = valueProp !== undefined;
    const [internal, setInternal] = React.useState(defaultValue);
    const value = isControlled ? valueProp : internal;

    const [sending, setSending] = React.useState(false);
    const [failed, setFailed] = React.useState(false);
    const mounted = React.useRef(true);
    React.useEffect(
      () => () => {
        mounted.current = false;
      },
      [],
    );

    const setValue = (next: string) => {
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    };

    // Auto-grow the textarea to fit its content, capped at maxHeight.
    useIsomorphicLayoutEffect(() => {
      const el = innerRef.current;
      if (!el || variant === "single-line") return;
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    }, [value, maxHeight, variant]);

    const canSend = value.trim().length > 0 && !disabled && !sending;

    const submit = () => {
      if (!canSend) return;
      const text = value.trim();
      let result: unknown;
      try {
        result = onSubmit(text);
      } catch {
        setFailed(true);
        return;
      }
      if (isPromise(result)) {
        setSending(true);
        result.then(
          () => {
            if (!mounted.current) return;
            setSending(false);
            setFailed(false);
            if (!isControlled) setInternal("");
          },
          () => {
            if (!mounted.current) return;
            setSending(false);
            setFailed(true);
          },
        );
      } else {
        setFailed(false);
        if (!isControlled) setInternal("");
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      props.onKeyDown?.(e);
      if (e.defaultPrevented || e.key !== "Enter" || e.nativeEvent.isComposing) return;
      const mod = e.metaKey || e.ctrlKey;
      const sends =
        variant === "single-line" || (sendKey === "enter" ? !e.shiftKey : mod);
      if (sends) {
        e.preventDefault();
        submit();
      }
    };

    const errorContent = error ?? (failed ? DEFAULT_ERROR : null);
    const showError = errorContent != null && errorContent !== false;

    const showCounter =
      maxLength != null && maxLength > 0 && value.length >= maxLength * counterThreshold;
    const atLimit = maxLength != null && value.length >= maxLength;
    const counter = showCounter ? (
      <span
        aria-live="polite"
        className={cn("shrink-0 text-xs tabular-nums text-muted-foreground", atLimit && "text-destructive")}
      >
        {value.length} / {maxLength}
      </span>
    ) : null;

    const sendShortcut = variant === "single-line" || sendKey === "enter" ? "Enter" : "Meta+Enter Control+Enter";
    const iconSize = variant === "input-with-send" ? "icon-lg" : "icon-sm";
    const roundClass = variant === "input-with-send" ? "rounded-xl" : "rounded-full";
    const sendButton = loading ? (
      <Button
        type="button"
        size={iconSize}
        onClick={onStop}
        aria-label={stopLabel}
        className={cn("shrink-0", roundClass)}
      >
        <Square className="size-3.5 fill-current" />
      </Button>
    ) : (
      <Button
        type="button"
        size={iconSize}
        onClick={submit}
        disabled={!canSend}
        aria-label={sendLabel}
        aria-keyshortcuts={sendShortcut}
        aria-busy={sending || undefined}
        className={cn("shrink-0 disabled:opacity-40", roundClass)}
      >
        {sending ? (
          <Spinner aria-hidden="true" role={undefined} aria-label={undefined} className="motion-reduce:animate-none" />
        ) : (
          <ArrowUp className="size-4" />
        )}
      </Button>
    );

    const errorRow = showError ? (
      <div
        id={errorId}
        role="alert"
        className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-foreground"
      >
        <span className="min-w-0 flex-1">{errorContent}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          leftIcon={<RotateCw className="size-3.5" />}
          onClick={onRetry ?? submit}
          disabled={sending}
        >
          Retry
        </Button>
      </div>
    ) : null;

    const field = (
      <textarea
        ref={innerRef}
        id={fieldId}
        rows={1}
        value={value}
        disabled={disabled}
        maxLength={maxLength}
        placeholder={placeholder}
        wrap={variant === "single-line" ? "off" : undefined}
        aria-invalid={showError || undefined}
        aria-describedby={[ariaDescribedBy, showError ? errorId : null].filter(Boolean).join(" ") || undefined}
        {...props}
        onChange={(e) => {
          if (failed && error == null) setFailed(false);
          setValue(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          "min-w-0 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50",
          variant === "single-line" ? "h-8 overflow-hidden leading-5" : "max-h-[inherit]",
          variant === "expanding-area" && "w-full",
        )}
      />
    );

    const boxBase = cn(
      "border border-input bg-background shadow-sm transition-[border-radius,box-shadow] focus-within:ring-2 focus-within:ring-ring",
      showError && "border-destructive",
    );

    let composer: React.ReactNode;
    if (variant === "single-line") {
      composer = (
        <div className={cn(boxBase, "flex min-h-10 items-center gap-1.5 rounded-full py-1 pl-2 pr-1", className)}>
          {field}
          {actions}
          {counter}
          {sendButton}
        </div>
      );
    } else if (variant === "input-with-send") {
      composer = (
        <div className="flex items-end gap-2">
          <div className={cn(boxBase, "flex min-w-0 flex-1 items-end gap-1.5 rounded-xl p-1.5", className)}>
            {field}
            {actions}
            {counter && <span className="self-center">{counter}</span>}
          </div>
          {sendButton}
        </div>
      );
    } else {
      composer = (
        <div
          className={cn(
            boxBase,
            "flex flex-col gap-2 rounded-2xl p-2 focus-within:rounded-xl motion-reduce:transition-none",
            className,
          )}
        >
          {errorRow}
          {field}
          <div className="flex items-center gap-1.5">
            {actions}
            <span className="flex-1" />
            {counter}
            {sendButton}
          </div>
        </div>
      );
    }

    return (
      <div className={cn("flex flex-col gap-1.5", containerClassName)}>
        {label != null && (
          <label htmlFor={fieldId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        {composer}
        {variant !== "expanding-area" && errorRow}
      </div>
    );
  },
);
OpenInput.displayName = "OpenInput";

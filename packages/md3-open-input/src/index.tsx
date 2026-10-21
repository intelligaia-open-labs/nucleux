import * as React from "react";
import { ArrowUp, Maximize2, Minimize2, RotateCw, Square } from "lucide-react";
import { cn } from "@nucleux/utils";
import { useComposerHeight } from "@nucleux/open-input";
import type { OpenInputProps, OpenInputSendKey, OpenInputVariant } from "@nucleux/open-input";
import { Md3Button } from "@nucleux/md3-button";
import { Md3IconButton } from "@nucleux/md3-icon-button";
import { Md3LoadingIndicator } from "@nucleux/md3-loading-indicator";

/** Props of {@link Md3OpenInput} — identical to `OpenInputProps` from `@nucleux/open-input`. */
export type Md3OpenInputProps = OpenInputProps;
/** Layout of the composer: "expanding-area", "single-line" or "input-with-send". */
export type Md3OpenInputVariant = OpenInputVariant;
/** Which key sends: "enter" or "mod-enter". */
export type Md3OpenInputSendKey = OpenInputSendKey;

// Copied from @nucleux/open-input (internal there): the default failure message and a promise check.
const DEFAULT_ERROR = "Couldn't send your message. It's still here — edit it or try again.";
const isPromise = (v: unknown): v is Promise<unknown> =>
  !!v && typeof (v as { then?: unknown }).then === "function";

// M3 emphasized easing for the shape change on focus and the line-by-line growth.
const EMPHASIZED = "ease-[cubic-bezier(0.2,0,0,1)]";

/**
 * The Material 3 persistent composer for any natural-language ask — the same
 * API and behaviour as `OpenInput`, drawn as an M3 composer: a tonal surface
 * with a hairline outline whose focus is a shape change (the outline takes the
 * primary colour and the corner squares up a step), a field that eases taller
 * line by line to eight lines (`maxLines`) and then scrolls — past that an
 * Expand icon button in the field's corner gives the request most of the
 * available height, and sending collapses it again — and a filled send icon button
 * that is disabled only while there is nothing to send and carries the send key
 * as `aria-keyshortcuts`. A failed send keeps the text, takes the error colour
 * on the edge and shows one error-container row with Retry; while `loading` the
 * send button becomes a tonal Stop. Motion is dropped under reduced motion.
 */
export const Md3OpenInput = React.forwardRef<HTMLTextAreaElement, Md3OpenInputProps>(
  (
    {
      value: valueProp,
      defaultValue = "",
      onValueChange,
      onSubmit,
      loading = false,
      onStop,
      maxLines = 8,
      maxHeight,
      expandable = true,
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

    // Grow with the text up to maxLines (or maxHeight), then scroll; Expand past that.
    const { expanded, showToggle, toggle } = useComposerHeight(innerRef, {
      value,
      maxLines,
      maxHeight,
      enabled: variant !== "single-line",
      expandable,
      fallbackLineHeight: 24,
    });

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
      const sends = variant === "single-line" || (sendKey === "enter" ? !e.shiftKey : mod);
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
        className={cn(
          "shrink-0 text-xs tabular-nums tracking-[0.4px] text-md-on-surface-variant",
          atLimit && "text-md-error",
        )}
      >
        {value.length} / {maxLength}
      </span>
    ) : null;

    const sendShortcut =
      variant === "single-line" || sendKey === "enter" ? "Enter" : "Meta+Enter Control+Enter";
    const big = variant === "input-with-send";
    const sendShape = big ? "size-12 rounded-md-lg" : "size-10 rounded-full";
    const sendButton = loading ? (
      <Md3IconButton
        variant="tonal"
        onClick={onStop}
        aria-label={stopLabel}
        className={cn("shrink-0 [&_svg]:size-4", sendShape)}
      >
        <Square aria-hidden="true" className="fill-current" />
      </Md3IconButton>
    ) : (
      <Md3IconButton
        variant="filled"
        onClick={submit}
        disabled={!canSend}
        aria-label={sendLabel}
        aria-keyshortcuts={sendShortcut}
        aria-busy={sending || undefined}
        className={cn(
          "shrink-0 transition-[transform,background-color] duration-200 active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100 [&_svg]:size-5",
          // Nothing to send: an empty, quiet container rather than a disabled primary blob.
          !canSend && !sending && "bg-md-on-surface/10 text-md-on-surface disabled:opacity-[0.38]",
          sendShape,
        )}
      >
        {sending ? (
          <Md3LoadingIndicator aria-hidden="true" size={24} className="text-md-on-primary" />
        ) : (
          <ArrowUp aria-hidden="true" />
        )}
      </Md3IconButton>
    );

    const errorRow = showError ? (
      <div
        id={errorId}
        role="alert"
        className="flex animate-nx-fade-in items-center gap-2 rounded-md-md bg-md-error-container py-1 pl-3 pr-1 text-sm text-md-on-error-container motion-reduce:animate-none"
      >
        <span className="min-w-0 flex-1">{errorContent}</span>
        <Md3Button
          variant="text"
          icon={<RotateCw aria-hidden="true" />}
          onClick={onRetry ?? submit}
          disabled={sending}
          className="h-8 px-3 text-md-on-error-container [&_svg]:size-4"
        >
          Retry
        </Md3Button>
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
        aria-describedby={
          [ariaDescribedBy, showError ? errorId : null].filter(Boolean).join(" ") || undefined
        }
        {...props}
        onChange={(e) => {
          if (failed && error == null) setFailed(false);
          setValue(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          "min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-base leading-6 tracking-[0.5px] text-md-on-surface caret-md-primary outline-none placeholder:text-md-on-surface-variant disabled:opacity-[0.38]",
          variant === "single-line"
            ? "h-10 overflow-hidden"
            : cn("transition-[height] duration-150 motion-reduce:transition-none", EMPHASIZED),
          variant === "expanding-area" && "w-full",
          showToggle && "pr-10",
        )}
      />
    );

    // Expand / Collapse: a 32px standard icon button in the field's top-right corner.
    const expandButton = showToggle ? (
      <Md3IconButton
        aria-label={expanded ? "Collapse" : "Expand"}
        aria-expanded={expanded}
        aria-controls={fieldId}
        onClick={toggle}
        className="absolute right-0 top-0 size-8 shrink-0 [&_svg]:size-5"
      >
        {expanded ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}
      </Md3IconButton>
    ) : null;

    // The field and its Expand control; expanded, it takes its own full-width row first.
    const fieldArea =
      variant === "single-line" ? (
        field
      ) : (
        <div
          className={cn(
            "relative flex min-w-0 flex-1",
            (variant === "expanding-area" || expanded) && "w-full basis-full",
            expanded && "order-first",
          )}
        >
          {field}
          {expandButton}
        </div>
      );

    const boxBase = cn(
      "border bg-md-surface-container-high text-md-on-surface transition-[border-radius,border-color] duration-200 motion-reduce:transition-none",
      EMPHASIZED,
      showError ? "border-md-error" : "border-md-outline-variant focus-within:border-md-primary",
    );

    let composer: React.ReactNode;
    if (variant === "single-line") {
      composer = (
        <div
          className={cn(
            boxBase,
            "flex min-h-12 items-center gap-1 rounded-full py-1 pl-3 pr-1",
            className,
          )}
        >
          {field}
          {actions}
          {counter}
          {sendButton}
        </div>
      );
    } else if (variant === "input-with-send") {
      composer = (
        <div className="flex items-end gap-2">
          <div
            className={cn(
              boxBase,
              "flex min-h-12 min-w-0 flex-1 items-end gap-1 rounded-md-lg p-1 focus-within:rounded-md-md",
              expanded && "flex-wrap",
              className,
            )}
            data-expanded={expanded || undefined}
          >
            {fieldArea}
            {actions}
            {counter && <span className="self-center pr-2">{counter}</span>}
          </div>
          {sendButton}
        </div>
      );
    } else {
      composer = (
        <div
          data-expanded={expanded || undefined}
          className={cn(
            boxBase,
            "flex flex-col gap-2 rounded-md-xl p-3 focus-within:rounded-md-lg",
            className,
          )}
        >
          {errorRow}
          {fieldArea}
          <div className="flex items-center gap-1">
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
          <label
            htmlFor={fieldId}
            className="px-1 text-sm font-medium tracking-[0.1px] text-md-on-surface-variant"
          >
            {label}
          </label>
        )}
        {composer}
        {variant !== "expanding-area" && errorRow}
      </div>
    );
  },
);
Md3OpenInput.displayName = "Md3OpenInput";
export * from "./request-settings";

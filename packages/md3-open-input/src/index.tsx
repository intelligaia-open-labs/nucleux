import * as React from "react";
import { ArrowUp, ChevronDown, Maximize2, Mic, Minimize2, Plus, RotateCw, Send, Square } from "lucide-react";
import { cn } from "@nucleux/utils";
import { useComposerHeight } from "@nucleux/open-input";
import type {
  OpenInputLayout,
  OpenInputModelChipProps,
  OpenInputProps,
  OpenInputSendKey,
  OpenInputSendVariant,
  OpenInputVariant,
} from "@nucleux/open-input";
import { Md3Button } from "@nucleux/md3-button";
import { Md3IconButton } from "@nucleux/md3-icon-button";
import { Md3LoadingIndicator } from "@nucleux/md3-loading-indicator";

/** Props of {@link Md3OpenInput} — identical to `OpenInputProps` from `@nucleux/open-input`. */
export type Md3OpenInputProps = OpenInputProps;
/** Layout of the composer: "expanding-area", "single-line" or "input-with-send". */
export type Md3OpenInputVariant = OpenInputVariant;
/** Which key sends: "enter" or "mod-enter". */
export type Md3OpenInputSendKey = OpenInputSendKey;
/** Send button style: "filled" (default here) or "ghost". */
export type Md3OpenInputSendVariant = OpenInputSendVariant;
/** "auto", "inline" or "stacked" arrangement of the expanding-area composer. */
export type Md3OpenInputLayout = OpenInputLayout;
/** Props of {@link Md3OpenInputModelChip} — identical to `OpenInputModelChipProps`. */
export type Md3OpenInputModelChipProps = OpenInputModelChipProps;

/**
 * The Material 3 composer's model chip — the model and its effort as a text
 * button in the primary colour ("Balanced High"), the model in semibold and
 * the effort in regular weight, as in the nucleux.in composer. Pass it to
 * `Md3OpenInput`'s `model` slot and wire `onClick` / `aria-haspopup` /
 * `aria-expanded` to the menu that changes them. `chevron` defaults to false.
 */
export const Md3OpenInputModelChip = React.forwardRef<HTMLButtonElement, Md3OpenInputModelChipProps>(
  ({ name, detail, chevron = false, type = "button", className, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "relative inline-flex h-10 shrink-0 items-center gap-1.5 overflow-hidden rounded-full px-3 text-sm tracking-[0.1px] text-md-primary outline-none focus-visible:ring-2 focus-visible:ring-md-primary before:absolute before:inset-0 before:bg-current before:opacity-0 before:transition-opacity before:content-[''] hover:before:opacity-[0.08] active:before:opacity-[0.12] disabled:opacity-[0.38] disabled:before:opacity-0 motion-reduce:before:transition-none",
        className,
      )}
      {...props}
    >
      <span className="relative font-semibold">{name}</span>
      {detail != null && <span className="relative font-normal">{detail}</span>}
      {chevron && <ChevronDown aria-hidden="true" className="relative size-4" />}
    </button>
  ),
);
Md3OpenInputModelChip.displayName = "Md3OpenInputModelChip";

// Copied from @nucleux/open-input (internal there): the default failure message and a promise check.
const DEFAULT_ERROR = "Couldn't send your message. It's still here — edit it or try again.";
const isPromise = (v: unknown): v is Promise<unknown> =>
  !!v && typeof (v as { then?: unknown }).then === "function";

// M3 emphasized easing for the shape change on focus and the line-by-line growth.
const EMPHASIZED = "ease-[cubic-bezier(0.2,0,0,1)]";

/**
 * The Material 3 persistent composer for any natural-language ask — the same
 * API and behaviour as `OpenInput`, drawn as the nucleux.in M3 composer: one
 * rounded bar on the surface with a hairline outline — an optional "+"
 * (`onAdd`), the field, the `model` chip ("Balanced High"), a mic (`onVoice`)
 * and a round send — whose field takes its own row once the request wraps.
 * Its focus is a shape change (the outline takes the
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
      onAdd,
      addLabel = "Add files and more",
      add,
      model,
      onVoice,
      voiceLabel = "Speak instead of typing",
      sendVariant = "filled",
      layout = "auto",
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
    const { expanded, showToggle, toggle, wrapped } = useComposerHeight(innerRef, {
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
    const ghost = sendVariant === "ghost";
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
        variant={ghost ? "standard" : "filled"}
        onClick={submit}
        disabled={!canSend}
        aria-label={sendLabel}
        aria-keyshortcuts={sendShortcut}
        aria-busy={sending || undefined}
        className={cn(
          "shrink-0 transition-[transform,background-color] duration-200 active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100 [&_svg]:size-5",
          // Nothing to send: an empty, quiet container rather than a disabled primary blob.
          !ghost && !canSend && !sending && "bg-md-on-surface/10 text-md-on-surface disabled:opacity-[0.38]",
          ghost && "disabled:opacity-[0.38]",
          sendShape,
        )}
      >
        {sending ? (
          <Md3LoadingIndicator
            aria-hidden="true"
            size={24}
            className={ghost ? "text-md-primary" : "text-md-on-primary"}
          />
        ) : ghost ? (
          <Send aria-hidden="true" />
        ) : (
          <ArrowUp aria-hidden="true" />
        )}
      </Md3IconButton>
    );

    const addControl =
      add ??
      (onAdd ? (
        <Md3IconButton aria-label={addLabel} onClick={onAdd} disabled={disabled} className="shrink-0">
          <Plus aria-hidden="true" />
        </Md3IconButton>
      ) : null);

    const voiceButton = onVoice ? (
      <Md3IconButton aria-label={voiceLabel} onClick={onVoice} disabled={disabled} className="shrink-0">
        <Mic aria-hidden="true" />
      </Md3IconButton>
    ) : null;

    // Model chip, mic, send: the right end of every arrangement.
    const trailing = (
      <>
        {model}
        {voiceButton}
        {sendButton}
      </>
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

    const stacked =
      variant === "expanding-area" &&
      (layout === "stacked" || (layout === "auto" && (wrapped || expanded || showError)));

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
          "min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-[0.9375rem] leading-6 tracking-[0.25px] text-md-on-surface caret-md-primary outline-none placeholder:truncate placeholder:text-md-on-surface-variant disabled:opacity-[0.38]",
          variant === "single-line"
            ? "h-10 overflow-hidden"
            : cn("transition-[height] duration-150 motion-reduce:transition-none", EMPHASIZED),
          variant === "expanding-area" && "w-full",
          // Stacked field: 6px 8px 2px, a 22px line (the site's 1.45 × 15px).
          stacked && "pb-0.5 pt-1.5 leading-[1.375rem]",
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
            (stacked || expanded) && "w-full basis-full",
            stacked && variant === "expanding-area" && "-order-1",
            expanded && "order-first",
          )}
        >
          {field}
          {expandButton}
        </div>
      );

    const boxBase = cn(
      "border bg-md-surface-container-lowest text-md-on-surface shadow-sm transition-[border-radius,border-color] duration-200 motion-reduce:transition-none",
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
            addControl && "pl-1",
            className,
          )}
        >
          {addControl}
          {field}
          {actions}
          {counter}
          {trailing}
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
            {addControl}
            {fieldArea}
            {actions}
            {counter && <span className="self-center pr-2">{counter}</span>}
            {model}
            {voiceButton}
          </div>
          {sendButton}
        </div>
      );
    } else {
      // One element tree for both arrangements (so the field never remounts and
      // keeps focus); `order` moves the field above the toolbar once stacked.
      // Inline: one bar — +, the field, the controls, send. Stacked: the request
      // on its own row; + and actions left, model, mic and send right.
      composer = (
        <div
          data-expanded={expanded || undefined}
          data-layout={stacked ? "stacked" : "inline"}
          className={cn(
            boxBase,
            "flex flex-wrap items-center gap-x-1 rounded-md-xl focus-within:rounded-md-lg",
            // Stacked, as on nucleux.in: 8px 8px 7px around, 2px between the text and the toolbar.
            stacked ? "gap-y-0.5 px-2 pb-[7px] pt-2" : "min-h-14 p-2",
            className,
          )}
        >
          {errorRow && <div className="order-first basis-full">{errorRow}</div>}
          {addControl}
          {fieldArea}
          {actions}
          {stacked && <span className="flex-1" />}
          {counter}
          {trailing}
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

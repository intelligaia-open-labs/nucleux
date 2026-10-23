import * as React from "react";
import { ArrowUp, Maximize2, Minimize2, RotateCw, Square } from "lucide-react";
import { cn } from "@nucleux/utils";
import { Button } from "@nucleux/button";
import { Spinner } from "@nucleux/spinner";
import { useComposerHeight } from "./use-composer-height";

export { useComposerHeight } from "./use-composer-height";
export type { ComposerHeightOptions, ComposerHeightState } from "./use-composer-height";

/** Layout of the composer, from the spec's variants. */
export type OpenInputVariant = "expanding-area" | "single-line" | "input-with-send";

/** Where the composer's extra `actions` go: before the model chip (default) or right after it. */
export type OpenInputActionsPlacement = "before-model" | "after-model";

/** Which key sends: plain Enter (Shift+Enter is a newline), or ⌘/Ctrl+Enter (Enter is a newline). */
export type OpenInputSendKey = "enter" | "mod-enter";

/**
 * How the send button is drawn. "ghost": a quiet paper-plane icon button (the
 * shadcn composer on nucleux.in). "filled": a round primary button with an up
 * arrow (the Material 3 composer on nucleux.in).
 */
export type OpenInputSendVariant = "ghost" | "filled";

/**
 * Arrangement of the "expanding-area" composer. "auto": one row (+, field,
 * controls, send) while the request fits on one line; once it wraps, the field
 * takes its own row above the controls, until it is emptied again. "inline":
 * always one row. "stacked": the field always above the toolbar.
 */
export type OpenInputLayout = "auto" | "inline" | "stacked";

export interface OpenInputProps extends Omit<
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
  /**
   * Lines the field grows to before it scrolls. Defaults to 8. Ignored by the
   * "single-line" variant.
   */
  maxLines?: number;
  /**
   * An explicit ceiling in px before the field scrolls. When set it replaces
   * the `maxLines` ceiling.
   */
  maxHeight?: number;
  /**
   * Once the text overflows the ceiling, show an Expand icon button in the
   * field's top-right corner; expanded, the field takes its own full-width row
   * and most of the available height, and Collapse (or sending, which empties
   * the field) brings it back. Defaults to true. Never shown for "single-line".
   */
  expandable?: boolean;
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
   * Where `actions` sit in the toolbar: "before-model" (default) — after the
   * field (stacked: after the +), before the model chip; or "after-model" —
   * between the model chip and the mic, as the site's Handwriting composer
   * places its pen toggle.
   */
  actionsPlacement?: OpenInputActionsPlacement;
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
  /**
   * Shows the "+" add-context button at the start of the composer and is
   * called when it is pressed (open your attach / add-source menu from here).
   */
  onAdd?: () => void;
  /** Accessible name of the + button. Defaults to "Add files and more". */
  addLabel?: string;
  /**
   * Your own control in the + slot (e.g. a menu whose trigger is a + icon
   * button). Replaces the button `onAdd` would render.
   */
  add?: React.ReactNode;
  /**
   * The model chip, right of the field and before the mic: an
   * `OpenInputModelChip` / `Md3OpenInputModelChip` ("5.5 Instant ▾",
   * "Balanced High"), or your own model picker's trigger.
   */
  model?: React.ReactNode;
  /** Shows the mic button (before send) and is called when it is pressed. */
  onVoice?: () => void;
  /** Accessible name of the mic button. Defaults to "Speak instead of typing". */
  voiceLabel?: string;
  /**
   * How the send button is drawn: "ghost" (paper plane) or "filled" (round,
   * primary, up arrow). Defaults to "ghost" in `OpenInput` and "filled" in
   * `Md3OpenInput`, as on nucleux.in.
   */
  sendVariant?: OpenInputSendVariant;
  /**
   * "expanding-area" only: "auto" (default) is one row while the request fits
   * on a line and puts the field above the controls once it wraps; "inline"
   * and "stacked" fix one arrangement.
   */
  layout?: OpenInputLayout;
}

// The nucleux.in composer's own glyphs (its inline SVGs, stroke widths and all).
const PlusGlyph = () => (
  <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
    <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
const MicGlyph = () => (
  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <rect x="9" y="2" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="1.8" />
    <path d="M5 11a7 7 0 0014 0M12 19v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const SendGlyph = () => (
  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path
      d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const ChevronGlyph = () => (
  <svg aria-hidden="true" width="10" height="10" viewBox="0 0 10 10" fill="none" className="shrink-0">
    <path d="M2.5 3.5l2.5 3 2.5-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Props of {@link OpenInputModelChip} (and `Md3OpenInputModelChip`). */
export interface OpenInputModelChipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "name"> {
  /** The model, e.g. "5.5" (shadcn) or "Balanced" (Material 3). Shown with emphasis. */
  name: React.ReactNode;
  /** The second value, e.g. the speed "Instant" or the effort "High". Shown quieter. */
  detail?: React.ReactNode;
  /** Show a chevron after the values. Defaults to true in `OpenInputModelChip`, false in `Md3OpenInputModelChip`. */
  chevron?: boolean;
}

/**
 * The composer's model chip — a small bordered pill with the model in
 * semibold, a muted second value and a chevron ("5.5 Instant ▾"), as in the
 * nucleux.in composer. Pass it to `OpenInput`'s `model` slot. It is a plain
 * button: wire `onClick`, `aria-haspopup` and `aria-expanded` to the menu or
 * popover that changes the model.
 */
export const OpenInputModelChip = React.forwardRef<HTMLButtonElement, OpenInputModelChipProps>(
  ({ name, detail, chevron = true, type = "button", className, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        // The site's chip: 3px 8px, 6px corner, hairline, #fafafa fill, 11px type.
        "inline-flex shrink-0 items-center gap-1 rounded-md border border-border bg-[hsl(var(--nx-ink-25))] px-2 py-[3px] text-[11px] leading-[1.55] text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="font-semibold text-foreground">{name}</span>
      {detail != null && <span className="text-faint">{detail}</span>}
      {chevron && <ChevronGlyph />}
    </button>
  ),
);
OpenInputModelChip.displayName = "OpenInputModelChip";

const DEFAULT_ERROR = "Couldn't send your message. It's still here — edit it or try again.";

const isPromise = (v: unknown): v is Promise<unknown> =>
  !!v && typeof (v as { then?: unknown }).then === "function";

/**
 * The persistent free-form composer for any natural-language ask, drawn as
 * the nucleux.in composer: a white card with the request on top and a toolbar
 * (an optional "+" via `onAdd`, then on the right a `model` chip, a mic via
 * `onVoice` and a ghost paper-plane send). While the request fits on one line
 * it is a single row; once it wraps, the field takes its own row. It grows
 * with the prompt up to eight lines (`maxLines`) and then scrolls; past that an
 * Expand control gives the request most of the available height, always pairs the field
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
      maxLines = 8,
      maxHeight,
      expandable = true,
      variant = "expanding-area",
      label,
      sendKey = "enter",
      sendLabel = "Send message",
      stopLabel = "Stop generating",
      actions,
      actionsPlacement = "before-model",
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
      sendVariant = "ghost",
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
      fallbackLineHeight: 20,
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
          "shrink-0 text-xs tabular-nums text-muted-foreground",
          atLimit && "text-destructive",
        )}
      >
        {value.length} / {maxLength}
      </span>
    ) : null;

    const sendShortcut =
      variant === "single-line" || sendKey === "enter" ? "Enter" : "Meta+Enter Control+Enter";
    const iconSize = variant === "input-with-send" ? "icon-lg" : "icon-sm";
    const roundClass = variant === "input-with-send" ? "rounded-xl" : "rounded-full";
    const ghost = sendVariant === "ghost";
    // The site's quiet toolbar buttons: a 26px + in --fg-mid, 28px mic and send in --fg-muted.
    const addIcon = "size-[26px] shrink-0 rounded-md text-muted-foreground hover:text-foreground";
    const quietIcon = "size-7 shrink-0 rounded-md text-faint hover:text-foreground";
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
        variant={ghost ? "ghost" : "primary"}
        size={iconSize}
        onClick={submit}
        disabled={!canSend}
        aria-label={sendLabel}
        aria-keyshortcuts={sendShortcut}
        aria-busy={sending || undefined}
        className={cn(
          "shrink-0",
          // The site's ghost send keeps its quiet colour while there is nothing to send.
          ghost ? cn(quietIcon, "disabled:opacity-100") : cn("disabled:opacity-40", roundClass),
        )}
      >
        {sending ? (
          <Spinner
            aria-hidden="true"
            role={undefined}
            aria-label={undefined}
            className="motion-reduce:animate-none"
          />
        ) : ghost ? (
          <SendGlyph />
        ) : (
          <ArrowUp className="size-4" />
        )}
      </Button>
    );

    const addControl =
      add ??
      (onAdd ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={addLabel}
          onClick={onAdd}
          disabled={disabled}
          className={addIcon}
        >
          <PlusGlyph />
        </Button>
      ) : null);

    const voiceButton = onVoice ? (
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={voiceLabel}
        onClick={onVoice}
        disabled={disabled}
        className={quietIcon}
      >
        <MicGlyph />
      </Button>
    ) : null;

    // Model chip, mic, send: the right end of every arrangement.
    // `actions` sit before the model chip by default; "after-model" puts them between it and the mic.
    const afterModel = actionsPlacement === "after-model";
    const leadActions = afterModel ? null : actions;
    const modelActions = afterModel ? actions : null;

    const trailing = (
      <>
        {model}
        {modelActions}
        {voiceButton}
        {sendButton}
      </>
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
          "min-w-0 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm leading-5 text-foreground outline-none placeholder:truncate placeholder:text-muted-foreground disabled:opacity-50",
          variant === "single-line" && "h-8 overflow-hidden",
          // The site composer: 13px / 20px type with no inset of its own; its placeholder is gray-400.
          variant === "expanding-area" && "p-0 text-[13px] leading-5 placeholder:text-[#9ca3af]",
          stacked && "min-h-10",
          variant === "expanding-area" && "w-full",
          showToggle && "pr-10",
        )}
      />
    );

    const expandButton = showToggle ? (
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={expanded ? "Collapse" : "Expand"}
        aria-expanded={expanded}
        aria-controls={fieldId}
        onClick={toggle}
        className="absolute right-0 top-0 rounded-full text-muted-foreground hover:text-foreground"
      >
        {expanded ? (
          <Minimize2 aria-hidden="true" className="size-4" />
        ) : (
          <Maximize2 aria-hidden="true" className="size-4" />
        )}
      </Button>
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
      "border border-border bg-background shadow-sm transition-[border-color,box-shadow] focus-within:border-ring focus-within:ring-1 focus-within:ring-ring motion-reduce:transition-none",
      showError && "border-destructive focus-within:border-destructive focus-within:ring-destructive",
    );

    let composer: React.ReactNode;
    if (variant === "single-line") {
      composer = (
        <div
          className={cn(
            boxBase,
            "flex min-h-10 items-center gap-1.5 rounded-full py-1 pl-2 pr-1",
            className,
          )}
        >
          {addControl}
          {field}
          {leadActions}
          {counter}
          {trailing}
        </div>
      );
    } else if (variant === "input-with-send") {
      composer = (
        <div className="flex items-end gap-2">
          <div
            data-expanded={expanded || undefined}
            className={cn(
              boxBase,
              "flex min-w-0 flex-1 items-end gap-1.5 rounded-xl p-1.5",
              expanded && "flex-wrap",
              className,
            )}
          >
            {addControl}
            {fieldArea}
            {leadActions}
            {counter && <span className="self-center">{counter}</span>}
            {model}
            {modelActions}
            {voiceButton}
          </div>
          {sendButton}
        </div>
      );
    } else {
      // One element tree for both arrangements (so the field never remounts and
      // keeps focus); `order` moves the field above the toolbar once stacked.
      // Inline: +, the field, then the controls and send. Stacked: the request
      // on top, a hairline, then + and actions left; model, mic and send right.
      composer = (
        <div
          data-expanded={expanded || undefined}
          data-layout={stacked ? "stacked" : "inline"}
          className={cn(
            boxBase,
            // As on nucleux.in: a 10px corner and a soft 0 1px 4px shadow. Inline, one 40px row
            // (8px / 10px insets, 8px gaps); stacked, 12px / 14px insets and a hairline 10px
            // below the request and 10px above the toolbar.
            "flex flex-wrap items-center rounded-[10px] shadow-[0_1px_4px_rgba(0,0,0,0.06)]",
            stacked ? "gap-x-1.5 px-3.5 py-3" : "min-h-10 gap-2 pl-2 pr-2.5",
            className,
          )}
        >
          {errorRow && <div className="order-first basis-full">{errorRow}</div>}
          {addControl}
          {fieldArea}
          {stacked && (
            <span aria-hidden="true" className="-order-1 my-2.5 basis-full border-t border-border" />
          )}
          {leadActions}
          {stacked && <span className="flex-1" />}
          {counter}
          {trailing}
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
export * from "./request-settings";

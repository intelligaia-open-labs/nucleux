import * as React from "react";
import { ImagePlus, Paperclip } from "lucide-react";
import { cn } from "@nucleux/utils";
import { Button } from "@nucleux/button";
import { OpenInput, type OpenInputProps } from "@nucleux/open-input";
import { SuggestedPrompts, type SuggestedPromptItem } from "@nucleux/suggested-prompts";

/** Form of the empty-state invitation, from the spec's variants. */
export type InitialCtaVariant = "centered-hero" | "gradient-cta" | "multi-modal-row";

/** Heading level of the headline. */
export type InitialCtaHeadingLevel = 1 | 2 | 3;

export interface InitialCtaProps extends Omit<OpenInputProps, "variant" | "label"> {
  /** "centered-hero" (default), "gradient-cta" or "multi-modal-row". */
  variant?: InitialCtaVariant;
  /**
   * The open headline. Defaults to "What can I help with?". Pass `null` for
   * no heading (as the Material 3 site preview does): the section is then
   * named by `description`.
   */
  headline?: React.ReactNode;
  /** At most one short supporting line. */
  description?: React.ReactNode;
  /** The agent's avatar or mark above the headline (centered hero). */
  avatar?: React.ReactNode;
  /** Heading level of the headline. Defaults to 2. */
  headingLevel?: InitialCtaHeadingLevel;
  /**
   * Suggested prompts shown under the composer while it is empty (3–5).
   * Choosing one places its prompt in the field, editable and unsent, and
   * focuses it; they step aside once the person writes, and return if the
   * field is cleared.
   */
  suggestions?: Array<string | SuggestedPromptItem>;
  /** Lead for the suggestions ("Try asking:"). */
  suggestionsLabel?: React.ReactNode;
  /** Called after a suggestion is placed in the field. */
  onSuggestionSelect?: (prompt: string, item: SuggestedPromptItem) => void;
  /** Multi-modal row: shows an attach-file button. (The mic comes from `onVoice`, in every variant.) */
  onAttachFile?: () => void;
  /** Multi-modal row: shows an add-image button. */
  onAddImage?: () => void;
  /** Classes for the composer box (the OpenInput). `className` styles the outer section. */
  composerClassName?: string;
  /** Rendered under the composer — e.g. a Randomize control or a Disclaimer cutoff note. */
  children?: React.ReactNode;
}

const isPromise = (v: unknown): v is Promise<unknown> =>
  !!v && typeof (v as { then?: unknown }).then === "function";

/**
 * The large, inviting composer that anchors an empty state: an open headline
 * ("What can I help with?"), at most one supporting line, and the same
 * OpenInput used once the conversation starts, so the person learns one
 * control — with its "+" (`onAdd`), `model` chip and mic (`onVoice`).
 * Optional `suggestions` (a SuggestedPrompts set) sit below and
 * place their prompt in the field — never send it — then step aside once the
 * person writes. Variants: a centered hero, a gradient CTA for brand
 * moments, and a multi-modal row with voice, file and image buttons. The ref
 * points at the textarea; `value`/`onValueChange` control it, or it manages
 * its own text and clears only after a successful send.
 */
export const InitialCta = React.forwardRef<HTMLTextAreaElement, InitialCtaProps>(
  (
    {
      variant = "centered-hero",
      headline = "What can I help with?",
      description,
      avatar,
      headingLevel = 2,
      suggestions,
      suggestionsLabel,
      onSuggestionSelect,
      onAttachFile,
      onAddImage,
      composerClassName,
      children,
      className,
      value: valueProp,
      defaultValue = "",
      onValueChange,
      onSubmit,
      actions,
      placeholder,
      "aria-label": ariaLabel,
      ...props
    },
    forwardedRef,
  ) => {
    const baseId = React.useId();
    const headingId = `${baseId}-headline`;
    const descriptionId = `${baseId}-description`;
    const hasHeadline = headline != null && headline !== false;
    const fieldRef = React.useRef<HTMLTextAreaElement>(null);
    React.useImperativeHandle(forwardedRef, () => fieldRef.current as HTMLTextAreaElement);

    const isControlled = valueProp !== undefined;
    const [internal, setInternal] = React.useState(defaultValue);
    const value = isControlled ? valueProp : internal;
    const setValue = (next: string) => {
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    };

    const [placed, setPlaced] = React.useState<{ id: string; prompt: string } | null>(null);
    const [announce, setAnnounce] = React.useState("");
    const [focusTick, setFocusTick] = React.useState(0);

    // After a suggestion is placed, focus the field with the caret at the end.
    React.useEffect(() => {
      if (focusTick === 0) return;
      const el = fieldRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }, [focusTick]);

    const handleSubmit = (text: string) => {
      const result = onSubmit(text);
      const done = () => {
        if (!isControlled) setInternal("");
        setPlaced(null);
      };
      if (isPromise(result)) return result.then(done);
      done();
      return result;
    };

    const untouched = value === "" || (placed != null && value === placed.prompt);
    const showSuggestions = !!suggestions?.length && untouched;

    const modalities =
      variant === "multi-modal-row" && (onAttachFile || onAddImage) ? (
        <>
          {onAttachFile && (
            <Button variant="ghost" size="icon-sm" aria-label="Attach a file" onClick={onAttachFile}>
              <Paperclip aria-hidden="true" className="size-4" />
            </Button>
          )}
          {onAddImage && (
            <Button variant="ghost" size="icon-sm" aria-label="Add an image" onClick={onAddImage}>
              <ImagePlus aria-hidden="true" className="size-4" />
            </Button>
          )}
        </>
      ) : null;

    const Heading = `h${headingLevel}` as "h2";
    const hero = variant === "centered-hero";
    const gradient = variant === "gradient-cta";

    return (
      <section
        aria-labelledby={hasHeadline ? headingId : description ? descriptionId : undefined}
        className={cn(
          "flex w-full flex-col gap-3",
          // As on nucleux.in: 16px under the headline, 14px between the composer and the chips.
          hero && "mx-auto max-w-2xl items-center gap-4 text-center [&>[data-initial-cta-suggestions]]:-mt-0.5",
          gradient &&
            "rounded-2xl border border-brand/40 bg-gradient-to-br from-brand-muted to-transparent p-4",
          className,
        )}
      >
        {hero && avatar}
        {(hasHeadline || description) && (
          <div className={cn("flex flex-col gap-1", hero && "items-center")}>
            {hasHeadline && (
              <Heading
                id={headingId}
                className={cn(
                  "text-foreground",
                  hero && "text-xl font-bold leading-[1.55] tracking-[-0.02em]",
                  gradient && "text-xs font-semibold uppercase tracking-wider text-brand",
                  variant === "multi-modal-row" && "text-lg font-semibold",
                )}
              >
                {headline}
              </Heading>
            )}
            {description && (
              <p id={descriptionId} className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}
        <OpenInput
          ref={fieldRef}
          variant={gradient ? "single-line" : "expanding-area"}
          value={value}
          onValueChange={setValue}
          onSubmit={handleSubmit}
          placeholder={placeholder ?? (variant === "multi-modal-row" ? "Ask, attach or speak…" : "Ask anything…")}
          aria-label={ariaLabel ?? (props["aria-labelledby"] ? undefined : "Message")}
          actions={
            modalities || actions ? (
              <>
                {modalities}
                {actions}
              </>
            ) : undefined
          }
          containerClassName={cn("w-full", hero && "text-left")}
          className={cn(gradient && "bg-background", composerClassName)}
          {...props}
        />
        {showSuggestions && (
          <SuggestedPrompts
            data-initial-cta-suggestions=""
            items={suggestions}
            label={suggestionsLabel}
            afterSelect="mark"
            selectedId={placed && value === placed.prompt ? placed.id : null}
            className={cn(
              // The site's quiet suggestion chips: hairline, faint fill, regular weight; the chosen one inverts.
              // (5px 12px, an 8px corner, 11.5px type on --ink-25; an emoji icon sits a space before the label.)
              "gap-1.5 [&_button]:min-h-0 [&_button]:gap-1 [&_button]:rounded-lg [&_button]:border [&_button]:border-border [&_button]:bg-[hsl(var(--nx-ink-25))] [&_button]:px-3 [&_button]:py-[5px] [&_button]:text-[11.5px] [&_button]:font-normal [&_button]:leading-[1.55] [&_button]:text-muted-foreground [&_button:hover]:bg-accent [&_button:hover]:text-foreground [&_button[aria-pressed=true]]:border-primary [&_button[aria-pressed=true]]:bg-primary [&_button[aria-pressed=true]]:text-primary-foreground [&_ul]:gap-1.5",
              hero && "justify-center [&_ul]:justify-center",
            )}
            onSelect={(prompt, item) => {
              setFocusTick((t) => t + 1);
              setPlaced({ id: item.id ?? item.prompt ?? item.title, prompt });
              setValue(prompt);
              setAnnounce("Placed in the message field. Edit it, then send.");
              onSuggestionSelect?.(prompt, item);
            }}
          />
        )}
        {children}
        <p aria-live="polite" className="sr-only">
          {announce}
        </p>
      </section>
    );
  },
);
InitialCta.displayName = "InitialCta";

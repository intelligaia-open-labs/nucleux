import * as React from "react";
import { ImagePlus, Paperclip } from "lucide-react";
import { cn } from "@nucleux/utils";
import type { InitialCtaHeadingLevel, InitialCtaProps, InitialCtaVariant } from "@nucleux/initial-cta";
import { Md3IconButton } from "@nucleux/md3-icon-button";
import { Md3OpenInput } from "@nucleux/md3-open-input";
import { Md3SuggestedPrompts } from "@nucleux/md3-suggested-prompts";

/** Props of {@link Md3InitialCta} — identical to `InitialCtaProps` from `@nucleux/initial-cta`. */
export type Md3InitialCtaProps = InitialCtaProps;
/** "centered-hero", "gradient-cta" or "multi-modal-row". */
export type Md3InitialCtaVariant = InitialCtaVariant;
/** Heading level of the headline: 1, 2 or 3. */
export type Md3InitialCtaHeadingLevel = InitialCtaHeadingLevel;

// Copied from @nucleux/initial-cta (internal there).
const isPromise = (v: unknown): v is Promise<unknown> =>
  !!v && typeof (v as { then?: unknown }).then === "function";

/**
 * The Material 3 empty-state composer — the same API and behaviour as
 * `InitialCta`, composed from {@link Md3OpenInput} and
 * {@link Md3SuggestedPrompts}, so the invitation is visibly the same object as
 * the working composer it becomes (the nucleux.in M3 composer bar, with its
 * "+", `model` chip and mic). An open headline (M3 headline type) — or none,
 * with the supporting line as a centred lead — then the composer; optional `suggestions` sit
 * below as suggestion chips and place their prompt in the field — focused,
 * editable, never sent — and step aside once the person writes. Variants: a
 * centred hero, a tonal primary-container surface for brand moments, and a
 * multi-modal row with standard icon buttons for voice, file and image.
 */
export const Md3InitialCta = React.forwardRef<HTMLTextAreaElement, Md3InitialCtaProps>(
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
            <Md3IconButton aria-label="Attach a file" onClick={onAttachFile}>
              <Paperclip aria-hidden="true" />
            </Md3IconButton>
          )}
          {onAddImage && (
            <Md3IconButton aria-label="Add an image" onClick={onAddImage}>
              <ImagePlus aria-hidden="true" />
            </Md3IconButton>
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
          "font-md",
          "flex w-full flex-col gap-3 text-md-on-surface",
          // As on nucleux.in's empty workspace: 14px between the lead and the composer.
          hero && "mx-auto max-w-2xl items-center gap-3.5 text-center",
          gradient &&
            "gap-4 rounded-md-xl bg-gradient-to-br from-md-primary-container to-md-surface-container-low p-5",
          className,
        )}
      >
        {hero && avatar}
        {(hasHeadline || description) && (
          <div className={cn("flex flex-col gap-2", hero && "items-center")}>
            {hasHeadline && (
              <Heading
                id={headingId}
                className={cn(
                  "text-md-on-surface",
                  hero && "text-[2rem] font-normal leading-10",
                  gradient && "text-sm font-medium tracking-[0.1px] text-md-on-primary-container",
                  variant === "multi-modal-row" && "text-[1.375rem] font-normal leading-7",
                )}
              >
                {headline}
              </Heading>
            )}
            {description && (
              <p
                id={descriptionId}
                className={cn(
                  // Without a headline the supporting line is the lead (the site's two-line intro:
                  // 15px at 1.5, at most 46ch, balanced, in the page's face — Inter on nucleux.in).
                  hasHeadline ? "max-w-[42ch] text-sm tracking-[0.25px]" : "max-w-[46ch] text-balance font-sans text-[15px] leading-normal",
                  gradient ? "text-md-on-primary-container" : "text-md-on-surface-variant",
                )}
              >
                {description}
              </p>
            )}
          </div>
        )}
        <Md3OpenInput
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
          className={cn(gradient && "bg-md-surface", composerClassName)}
          {...props}
        />
        {showSuggestions && (
          <Md3SuggestedPrompts
            items={suggestions}
            label={suggestionsLabel}
            afterSelect="mark"
            selectedId={placed && value === placed.prompt ? placed.id : null}
            className={cn(hero && "justify-center [&_ul]:justify-center")}
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
Md3InitialCta.displayName = "Md3InitialCta";

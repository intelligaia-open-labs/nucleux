import * as React from "react";
import { AlertCircle, Check, CircleHelp, Loader2, MessageSquareText, Pencil, Sparkles, Undo2 } from "lucide-react";
import { cn } from "@nucleux/utils";
import {
  PROMPT_ENHANCER_TEXT,
  describePromptEnhancerChange,
  splitPromptEnhancerProps,
  usePromptEnhancer,
  type PromptEnhancerChange,
  type PromptEnhancerController,
  type PromptEnhancerDiffStyle,
  type PromptEnhancerProps,
  type PromptEnhancerSegment,
  type PromptEnhancerState,
  type PromptEnhancerSuggestion,
  type PromptEnhancerVariant,
} from "@nucleux/prompt-enhancer";
import { Md3AgentComposer } from "@nucleux/md3-agent-composer";
import { Md3Button } from "@nucleux/md3-button";
import { Md3Card } from "@nucleux/md3-card";
import { Md3Checkbox } from "@nucleux/md3-checkbox";
import { Md3Switch } from "@nucleux/md3-switch";

/** Props of {@link Md3PromptEnhancer} — identical to `PromptEnhancerProps` from `@nucleux/prompt-enhancer`. */
export type Md3PromptEnhancerProps = PromptEnhancerProps;
/** "preview-diff", "wand-button" or "auto-enhance-toggle". */
export type Md3PromptEnhancerVariant = PromptEnhancerVariant;
/** "original", "enhancing", "enhanced", "editing", "accepted", "reverted" or "failed". */
export type Md3PromptEnhancerState = PromptEnhancerState;
/** "split" or "inline". */
export type Md3PromptEnhancerDiffStyle = PromptEnhancerDiffStyle;
/** One proposed addition — identical to `PromptEnhancerChange`. */
export type Md3PromptEnhancerChange = PromptEnhancerChange;
/** What `onEnhance` resolves with — identical to `PromptEnhancerSuggestion`. */
export type Md3PromptEnhancerSuggestion = PromptEnhancerSuggestion;
/** A run of the marked suggestion — identical to `PromptEnhancerSegment`. */
export type Md3PromptEnhancerSegment = PromptEnhancerSegment;
/** The shared controller — identical to `PromptEnhancerController`. */
export type Md3PromptEnhancerController = PromptEnhancerController;

const stateLayer =
  "before:absolute before:inset-0 before:bg-current before:opacity-0 before:transition-opacity before:content-[''] hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12] active:before:opacity-[0.12] motion-reduce:before:transition-none";

const overline = "flex items-center gap-1.5 text-[11.5px] font-semibold uppercase leading-4 tracking-[0.06em]";

const textLink = cn(
  "relative inline-flex min-h-8 items-center gap-1 overflow-hidden rounded-full px-2.5 text-[13px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-md-primary disabled:pointer-events-none disabled:opacity-[0.38] [&_svg]:size-4",
  stateLayer,
);

/**
 * The Material 3 Prompt Enhancer: an Improve-style tool in the
 * `Md3AgentComposer` toolbar proposes a clearer version of the request, shown
 * in an outlined card above the composer — what they wrote beside the
 * suggestion, every addition highlighted in primary-container and explained,
 * assumptions labelled, each change removable with a checkbox. Use updates the
 * composer with Undo and sends nothing; Edit, Keep original and a failure line
 * that leaves the original untouched are built in. Same API, states and
 * accessible names as `PromptEnhancer` from `@nucleux/prompt-enhancer`.
 */
export const Md3PromptEnhancer = React.forwardRef<HTMLDivElement, Md3PromptEnhancerProps>((props, ref) => {
  const {
    variant = "preview-diff",
    diffStyle = "split",
    showChanges = true,
    explain = true,
    allowEdit = true,
    allowKeepOriginal = true,
    undo = true,
    actionLabel = PROMPT_ENHANCER_TEXT.actionLabel,
    heading = PROMPT_ENHANCER_TEXT.heading,
    hint,
    placeholder = PROMPT_ENHANCER_TEXT.placeholder,
    failureMessage = PROMPT_ENHANCER_TEXT.failure,
    composerActions,
    onSubmit,
  } = props;
  const { className, ...rest } = splitPromptEnhancerProps(props);
  const pe = usePromptEnhancer(props);
  const uid = React.useId();
  const busy = pe.state === "enhancing";
  const listed = showChanges && pe.changes.length > 0;
  const kept = pe.changes.length - pe.removed.length;

  const marked = pe.segments.map((s, i) => {
    if (s.type === "text" || !showChanges) return s.type === "removed" ? null : <React.Fragment key={i}>{s.text}</React.Fragment>;
    if (s.type === "added")
      return (
        <ins
          key={i}
          className="rounded-md-xs bg-md-primary-container/75 px-0.5 text-md-on-primary-container underline decoration-md-primary/50 decoration-dotted underline-offset-4 [box-decoration-break:clone]"
        >
          <span className="sr-only">{PROMPT_ENHANCER_TEXT.added}</span>
          {s.text}
        </ins>
      );
    return (
      <del key={i} className="text-md-on-surface-variant line-through">
        <span className="sr-only">{PROMPT_ENHANCER_TEXT.removed}</span>
        {s.text}
      </del>
    );
  });

  const improvedOverline = (
    <p className={cn(overline, "text-md-primary")}>
      <MessageSquareText aria-hidden className="size-4" />
      {PROMPT_ENHANCER_TEXT.enhanced}
    </p>
  );

  const review = pe.showReview ? (
    <Md3Card
      variant="outlined"
      role="region"
      aria-label={PROMPT_ENHANCER_TEXT.regionLabel}
      onKeyDown={pe.onReviewKeyDown}
      className="flex flex-col gap-3.5 rounded-md-lg bg-md-surface px-5 py-[18px] animate-nx-fade-in motion-reduce:animate-none"
    >
      {listed && (
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="text-base font-medium leading-6 text-md-on-surface">{heading}</p>
          <span className="text-xs text-md-on-surface-variant">
            {kept} of {pe.changes.length} changes
          </span>
        </div>
      )}

      {pe.state === "editing" ? (
        <div className="flex flex-col gap-1">
          <label htmlFor={`${uid}-edit`} className="px-1 text-xs font-medium text-md-primary">
            {PROMPT_ENHANCER_TEXT.editLabel}
          </label>
          <textarea
            id={`${uid}-edit`}
            rows={3}
            autoFocus
            value={pe.editText}
            onChange={(e) => pe.setEditText(e.target.value)}
            className="w-full resize-none rounded-md-xs border-2 border-md-primary bg-transparent px-[15px] py-3 text-base leading-6 text-md-on-surface outline-none"
          />
        </div>
      ) : diffStyle === "split" ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-2.5">
          <div className="flex flex-col gap-2 rounded-md-md border border-transparent bg-md-on-surface/[0.04] px-3.5 py-3">
            <p className={cn(overline, "text-md-on-surface-variant")}>{PROMPT_ENHANCER_TEXT.youWrote}</p>
            <p className="text-[14.5px] leading-[22px] text-md-on-surface">{pe.original}</p>
          </div>
          <div className="flex flex-col gap-2 rounded-md-md border border-md-primary/45 bg-md-primary/5 px-3.5 py-3">
            {improvedOverline}
            <p className="text-[14.5px] leading-[22px] text-md-on-surface">{marked}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {improvedOverline}
          <p className="text-base leading-[26px] text-md-on-surface">{marked}</p>
        </div>
      )}

      {listed && pe.state !== "editing" && (
        <div role="group" aria-label={PROMPT_ENHANCER_TEXT.changesLabel} className="flex flex-col border-t border-md-outline-variant">
          {pe.changes.map((c) => {
            const on = !pe.removed.includes(c.id);
            const cb = `${uid}-c-${c.id}`;
            const desc = [explain && c.reason ? `${cb}-why` : null, c.assumption ? `${cb}-as` : null].filter(Boolean).join(" ");
            return (
              <div key={c.id} className="flex items-start gap-2 border-b border-md-outline-variant py-2 last:border-b-0 last:pb-0">
                <Md3Checkbox
                  id={cb}
                  checked={on}
                  onCheckedChange={() => pe.toggleChange(c.id)}
                  aria-labelledby={`${cb}-l`}
                  aria-describedby={desc || undefined}
                  className="-ml-2.5 shrink-0"
                />
                <div className="flex min-w-0 flex-col gap-0.5 pt-2.5">
                  <label
                    id={`${cb}-l`}
                    htmlFor={cb}
                    className={cn(
                      "cursor-pointer text-sm font-medium leading-5 text-md-on-surface",
                      !on && "text-md-on-surface-variant line-through",
                    )}
                  >
                    {describePromptEnhancerChange(c)}
                  </label>
                  {explain && c.reason && (
                    <span id={`${cb}-why`} className="text-[12.5px] leading-[18px] text-md-on-surface-variant">
                      {c.reason}
                    </span>
                  )}
                  {c.assumption && (
                    <span
                      id={`${cb}-as`}
                      className="mt-1 inline-flex items-center gap-1 self-start rounded-md-sm bg-md-surface-container-high px-2 py-0.5 text-[11.5px] font-medium text-md-on-surface-variant"
                    >
                      <CircleHelp aria-hidden className="size-3.5" />
                      {c.assumption}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        {pe.state !== "editing" && allowEdit ? (
          <Md3Button variant="text" icon={<Pencil aria-hidden />} onClick={pe.edit} className="-ml-1">
            {PROMPT_ENHANCER_TEXT.edit}
          </Md3Button>
        ) : (
          <span />
        )}
        <span className="ml-auto inline-flex flex-wrap gap-2">
          {pe.state === "editing" ? (
            <Md3Button variant="outlined" onClick={pe.cancelEdit}>
              {PROMPT_ENHANCER_TEXT.cancelEdit}
            </Md3Button>
          ) : (
            allowKeepOriginal && (
              <Md3Button variant="outlined" onClick={pe.keep}>
                {PROMPT_ENHANCER_TEXT.keep}
              </Md3Button>
            )
          )}
          <Md3Button variant="filled" onClick={pe.use}>
            {pe.state === "editing" ? PROMPT_ENHANCER_TEXT.useEdited : PROMPT_ENHANCER_TEXT.use}
          </Md3Button>
        </span>
      </div>
    </Md3Card>
  ) : null;

  const noteRow = "flex flex-wrap items-center gap-2 px-1 text-[13px] leading-5 text-md-on-surface-variant [&>svg]:size-[18px] [&>svg]:shrink-0";
  const note =
    pe.state === "enhancing" ? (
      <p className={noteRow}>
        <Loader2 aria-hidden className="animate-spin text-md-primary motion-reduce:animate-none" />
        {PROMPT_ENHANCER_TEXT.working}
      </p>
    ) : pe.state === "accepted" ? (
      <div className={noteRow}>
        <Check aria-hidden className="text-md-primary" />
        <span className="flex-1">{PROMPT_ENHANCER_TEXT.accepted}</span>
        {undo && (
          <button type="button" onClick={pe.undoUse} className={cn(textLink, "text-md-primary")}>
            <Undo2 aria-hidden />
            {PROMPT_ENHANCER_TEXT.undo}
          </button>
        )}
      </div>
    ) : pe.state === "reverted" ? (
      <p className={noteRow}>
        <Undo2 aria-hidden className="text-md-primary" />
        {PROMPT_ENHANCER_TEXT.reverted}
      </p>
    ) : null;

  const failed =
    pe.state === "failed" ? (
      <div
        role="alert"
        className="flex flex-wrap items-center gap-2 rounded-md-md bg-md-error-container py-2 pl-3 pr-2 text-[13px] leading-5 text-md-on-error-container"
      >
        <AlertCircle aria-hidden className="size-[18px] shrink-0" />
        <span className="min-w-0 flex-1">{failureMessage}</span>
        <button type="button" onClick={pe.enhance} disabled={!pe.canEnhance} className={textLink}>
          {PROMPT_ENHANCER_TEXT.retry}
        </button>
        {allowKeepOriginal && (
          <button type="button" onClick={pe.keep} className={textLink}>
            {PROMPT_ENHANCER_TEXT.keep}
          </button>
        )}
      </div>
    ) : null;

  const tool = (
    <button
      type="button"
      onClick={busy ? pe.cancel : pe.enhance}
      disabled={!busy && !pe.canEnhance}
      aria-label={busy ? PROMPT_ENHANCER_TEXT.cancel : `${actionLabel} this prompt with AI`}
      className={cn(
        "relative inline-flex min-h-8 shrink-0 items-center gap-1.5 overflow-hidden rounded-md-sm border py-1 pl-2 pr-2.5 text-[13px] font-medium leading-5 outline-none transition-colors",
        "focus-visible:ring-2 focus-visible:ring-md-primary focus-visible:ring-offset-2 focus-visible:ring-offset-md-surface",
        "disabled:pointer-events-none disabled:opacity-[0.38] motion-reduce:transition-none [&_svg]:size-[18px]",
        stateLayer,
        busy
          ? "border-transparent bg-md-secondary-container text-md-on-secondary-container"
          : "border-md-outline-variant bg-transparent text-md-on-surface-variant",
      )}
    >
      {busy ? (
        <Loader2 aria-hidden className="relative animate-spin motion-reduce:animate-none" />
      ) : (
        <Sparkles aria-hidden className="relative" />
      )}
      <span className="relative">{busy ? PROMPT_ENHANCER_TEXT.busy : actionLabel}</span>
    </button>
  );

  const autoToggle =
    variant === "auto-enhance-toggle" ? (
      <Md3Card variant="outlined" className="flex items-center justify-between gap-4 rounded-md-lg bg-md-surface px-4 py-3">
        <div className="min-w-0">
          <p id={`${uid}-auto`} className="text-sm font-medium leading-5 text-md-on-surface">
            {PROMPT_ENHANCER_TEXT.autoTitle}
          </p>
          <p id={`${uid}-auto-d`} className="mt-0.5 text-xs leading-4 text-md-on-surface-variant">
            {PROMPT_ENHANCER_TEXT.autoDescription}
          </p>
        </div>
        <Md3Switch
          checked={pe.autoEnhance}
          onCheckedChange={pe.setAutoEnhance}
          aria-labelledby={`${uid}-auto`}
          aria-describedby={`${uid}-auto-d`}
        />
      </Md3Card>
    ) : null;

  return (
    <div ref={ref} data-state={pe.state} className={cn("flex w-full flex-col gap-3", className)} {...rest}>
      {autoToggle}
      {review}
      {failed}
      <div role="status" aria-live="polite" className={note ? undefined : "sr-only"}>
        {note ?? pe.announcement}
      </div>
      <Md3AgentComposer
        value={pe.value}
        onValueChange={pe.setValue}
        onSubmit={pe.submit}
        placeholder={placeholder}
        leftActions={hint != null ? <span className="px-1 text-xs text-md-on-surface-variant">{hint}</span> : undefined}
        rightActions={
          <>
            {tool}
            {composerActions}
          </>
        }
        className={cn(
          "rounded-md-xl border border-md-outline-variant bg-md-surface px-4 pb-2 pt-3.5 shadow-md-1 [&>textarea]:text-base",
          !onSubmit && "[&_button[aria-label=Send]]:hidden",
        )}
      />
    </div>
  );
});
Md3PromptEnhancer.displayName = "Md3PromptEnhancer";

import * as React from "react";
import { Check, CornerDownRight, Info, Plus, RotateCw, X } from "lucide-react";
import { cn } from "@nucleux/utils";
import {
  suggestionKey,
  useSuggestions,
  useSuggestionsComposer,
  type SuggestionItem,
  type SuggestionsComposerProps,
  type SuggestionsMessages,
  type SuggestionsProps,
  type SuggestionsStatus,
  type SuggestionsVariant,
} from "@nucleux/suggestions";
import { Md3AgentComposer } from "@nucleux/md3-agent-composer";
import { Md3AiGeneratedIcon } from "@nucleux/md3-ai-icons";
import { Md3Button } from "@nucleux/md3-button";
import { Md3Chip } from "@nucleux/md3-chip";
import { Md3IconButton } from "@nucleux/md3-icon-button";
import { Md3LoadingIndicator } from "@nucleux/md3-loading-indicator";

/** Props of {@link Md3Suggestions} — identical to `SuggestionsProps` from `@nucleux/suggestions`. */
export type Md3SuggestionsProps = SuggestionsProps;
/** Props of {@link Md3SuggestionsComposer} — identical to `SuggestionsComposerProps`. */
export type Md3SuggestionsComposerProps = SuggestionsComposerProps;
/** One suggestion chip — identical to `SuggestionItem`. */
export type Md3SuggestionItem = SuggestionItem;
/** "compose", "follow-up" or "selection". */
export type Md3SuggestionsVariant = SuggestionsVariant;
/** "idle", "loading", "available", "error", "accepted", "dismissed" or "irrelevant". */
export type Md3SuggestionsStatus = SuggestionsStatus;
/** The row's copy — identical to `SuggestionsMessages`. */
export type Md3SuggestionsMessages = SuggestionsMessages;

export { appendSuggestion, suggestionsMessages } from "@nucleux/suggestions";

const stateLayer =
  "before:absolute before:inset-0 before:bg-current before:opacity-0 before:transition-opacity before:content-[''] hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12] active:before:opacity-[0.12] motion-reduce:before:transition-none";

const chipVariant: Record<Exclude<SuggestionsVariant, "selection">, string> = {
  compose: "border-md-outline-variant bg-transparent text-md-on-surface-variant",
  "follow-up": "border-md-outline-variant bg-md-surface-container-low text-md-on-surface-variant",
};

/**
 * The Material 3 suggestions row — the same API and behaviour as
 * `Suggestions`: at most three verb-labelled chips above the composer
 * ("compose"), under an answer ("follow-up") or as a floating toolbar on a
 * selection ("selection"). The row is headed by the agent's mark and name
 * (`label`, "Aria suggests") with an info icon button that reveals why
 * (`reason`) and a close icon button (Escape too); compose chips are outlined
 * M3 suggestion chips with a leading primary add icon and the standard state
 * layer. Choosing a chip only calls `onSelect` — never sends — and `status`
 * swaps the row for a one-line confirmation with a text Undo, a dismissed or
 * no-longer-relevant line, a loading indicator or an error-container line
 * with Retry. Arrow keys, Home and End move between chips; motion is reduced
 * under `prefers-reduced-motion`.
 */
export const Md3Suggestions = React.forwardRef<HTMLDivElement, Md3SuggestionsProps>((props, ref) => {
  const {
    suggestions: _suggestions,
    variant: _variant,
    status: _status,
    label,
    reason,
    actionLabel: _actionLabel,
    max: _max,
    pendingId,
    accepted,
    onSelect,
    onDismiss,
    onUndo,
    onRetry,
    messages: _messages,
    onKeyDown: _onKeyDown,
    "aria-label": _ariaLabel,
    className,
    ...rest
  } = props;
  const s = useSuggestions(props);
  const { msgs, status, variant } = s;

  if (status === "idle") return null;

  if (status === "loading") {
    return (
      <div
        ref={ref}
        role="status"
        className={cn("flex items-center gap-2 px-1 text-sm text-md-on-surface-variant", className)}
        {...rest}
      >
        <Md3LoadingIndicator size={24} aria-hidden="true" />
        <span>{msgs.loading}</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "flex flex-wrap items-center gap-2 rounded-md-md bg-md-error-container py-1 pl-3 pr-1 text-sm text-md-on-error-container",
          className,
        )}
        {...rest}
      >
        <span className="min-w-[12rem] flex-1">{msgs.error}</span>
        {onRetry && (
          <Md3Button variant="text" icon={<RotateCw />} onClick={onRetry} className="h-8 text-md-on-error-container">
            {msgs.retry}
          </Md3Button>
        )}
      </div>
    );
  }

  if (status === "accepted" || status === "dismissed" || status === "irrelevant") {
    const Icon = status === "accepted" ? Check : status === "dismissed" ? X : Info;
    const text = status === "accepted" ? msgs.accepted(accepted) : status === "dismissed" ? msgs.dismissed : msgs.irrelevant;
    return (
      <div
        ref={ref}
        role="status"
        className={cn(
          "flex flex-wrap items-center gap-x-2 gap-y-1 px-1 text-sm text-md-on-surface-variant motion-safe:animate-nx-fade-in",
          className,
        )}
        {...rest}
      >
        <Icon aria-hidden="true" className="size-[18px] shrink-0 text-md-primary" />
        <span className="min-w-[12rem] flex-1">{text}</span>
        {status === "accepted" && onUndo && (
          <Md3Button variant="text" onClick={onUndo} className="h-8 px-2.5">
            {msgs.undo}
          </Md3Button>
        )}
      </div>
    );
  }

  if (variant === "selection") {
    return (
      <div
        ref={ref}
        {...s.rootProps}
        className={cn(
          "inline-flex items-center gap-0.5 rounded-md-md bg-md-inverse-surface p-1 text-md-inverse-on-surface shadow-md-2 motion-safe:animate-nx-fade-in",
          className,
        )}
        {...rest}
      >
        {s.items.map((item, i) => {
          const pending = pendingId != null && pendingId === suggestionKey(item);
          return (
            <button
              key={suggestionKey(item)}
              type="button"
              data-suggestion=""
              aria-label={s.chipName(item)}
              aria-busy={pending || undefined}
              onClick={() => onSelect?.(item, i)}
              className={cn(
                "relative inline-flex h-8 items-center gap-1.5 overflow-hidden rounded-md-sm px-3 text-[13px] font-medium [&_svg]:size-4",
                stateLayer,
                "outline-none focus-visible:ring-2 focus-visible:ring-md-inverse-primary",
              )}
            >
              {pending ? (
                <Md3LoadingIndicator size={16} aria-hidden="true" className="relative" />
              ) : (
                item.icon && <span className="relative inline-flex shrink-0">{item.icon}</span>
              )}
              <span className="relative">{item.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={ref} {...s.rootProps} className={cn("flex flex-col gap-2 motion-safe:animate-nx-fade-in", className)} {...rest}>
      {s.showHeader && (
        <div className="flex min-h-8 items-center gap-2 px-0.5">
          {label != null && (
            <span id={s.labelId} className="inline-flex items-center gap-1.5 text-sm font-medium text-md-on-surface-variant">
              <Md3AiGeneratedIcon className="size-[18px]" />
              {label}
            </span>
          )}
          <span className="ml-auto inline-flex items-center gap-0.5">
            {reason != null && (
              <Md3IconButton
                aria-label={msgs.why}
                aria-expanded={s.whyOpen}
                aria-controls={s.whyOpen ? s.whyId : undefined}
                onClick={s.toggleWhy}
                className={cn("size-8 [&_svg]:size-5", s.whyOpen && "text-md-primary")}
              >
                <Info aria-hidden="true" />
              </Md3IconButton>
            )}
            {onDismiss && (
              <Md3IconButton aria-label={msgs.dismiss} onClick={onDismiss} className="size-8 [&_svg]:size-5">
                <X aria-hidden="true" />
              </Md3IconButton>
            )}
          </span>
        </div>
      )}
      {s.whyOpen && (
        <p id={s.whyId} className="px-0.5 text-[13px] leading-[18px] text-md-on-surface-variant">
          {reason}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {s.items.map((item, i) => {
          const pending = pendingId != null && pendingId === suggestionKey(item);
          const icon = pending ? (
            <Md3LoadingIndicator size={18} aria-hidden="true" />
          ) : (
            item.icon ??
            (variant === "follow-up" ? (
              <CornerDownRight aria-hidden="true" className="text-md-primary" />
            ) : (
              <Plus aria-hidden="true" className="text-md-primary" />
            ))
          );
          return (
            <Md3Chip
              key={suggestionKey(item)}
              variant="suggestion"
              icon={icon}
              data-suggestion=""
              aria-label={s.chipName(item)}
              aria-busy={pending || undefined}
              onClick={() => onSelect?.(item, i)}
              className={cn(
                "h-auto min-h-8 rounded-md-sm py-1 pl-2 pr-3.5 text-sm font-normal motion-reduce:before:transition-none",
                chipVariant[variant],
              )}
            >
              {item.label}
            </Md3Chip>
          );
        })}
      </div>
    </div>
  );
});
Md3Suggestions.displayName = "Md3Suggestions";

/**
 * Material 3 suggestions wired to the agent composer — the same API and
 * behaviour as `SuggestionsComposer`: after a pause on a request in progress,
 * "Aria suggests" chips ease in just above a raised composer card; pressing
 * one appends its words after the person's own (never replacing them),
 * returns focus to the field and replaces the row with a confirmation and
 * Undo. Nothing is sent for them; suggestions withdraw quietly when
 * `isRelevant` says the request changed.
 */
export const Md3SuggestionsComposer = React.forwardRef<HTMLDivElement, Md3SuggestionsComposerProps>((props, ref) => {
  const {
    value: _v,
    defaultValue: _dv,
    onValueChange: _ovc,
    onSubmit: _os,
    suggestions: _s,
    loadSuggestions: _ls,
    pauseMs: _pm,
    minLength: _ml,
    isRelevant: _ir,
    join: _j,
    label,
    reason,
    actionLabel = "Add to prompt",
    dismissible = true,
    undoable = true,
    max,
    onAccept: _oa,
    onDismiss: _od,
    onUndo: _ou,
    placeholder = "Describe what you need…",
    composerActions,
    loading,
    onStop,
    messages,
    onAdd,
    addLabel,
    add,
    model,
    onVoice,
    voiceLabel,
    className,
    ...rest
  } = props;
  const c = useSuggestionsComposer(props);
  return (
    <div ref={ref} className={cn("flex w-full flex-col gap-3", className)} {...rest}>
      <Md3Suggestions
        suggestions={c.items}
        status={c.status}
        label={label}
        reason={reason}
        actionLabel={actionLabel}
        max={max}
        accepted={c.accepted}
        onSelect={c.select}
        onDismiss={dismissible ? c.dismiss : undefined}
        onUndo={undoable ? c.undo : undefined}
        onRetry={c.retry}
        messages={messages}
      />
      <Md3AgentComposer
        ref={c.fieldRef}
        value={c.draft}
        onValueChange={c.type}
        onSubmit={(v) => {
          // A failed send keeps the draft; the app reports the error.
          Promise.resolve(c.submit(v)).catch(() => {});
        }}
        placeholder={placeholder}
        leftActions={composerActions}
        loading={loading}
        onStop={onStop}
        onAdd={onAdd}
        addLabel={addLabel}
        add={add}
        model={model}
        onVoice={onVoice}
        voiceLabel={voiceLabel}
      />
    </div>
  );
});
Md3SuggestionsComposer.displayName = "Md3SuggestionsComposer";

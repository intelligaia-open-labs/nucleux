import * as React from "react";
import { Check, Lock } from "lucide-react";
import { cn } from "@nucleux/utils";
import { defaultTones } from "@nucleux/personality";
import type {
  PersonalityProps,
  PersonalityVariant,
  PersonalitySampleDialogProps,
  PersonalityVoiceCardProps,
} from "@nucleux/personality";

export type { ToneOption, PersonalitySampleTurn } from "@nucleux/personality";
export { defaultTones } from "@nucleux/personality";
export type Md3PersonalityProps = PersonalityProps;
export type Md3PersonalityVariant = PersonalityVariant;
export type Md3PersonalityVoiceCardProps = PersonalityVoiceCardProps;
export type Md3PersonalitySampleDialogProps = PersonalitySampleDialogProps;

const stateLayer =
  "relative overflow-hidden before:absolute before:inset-0 before:bg-current before:opacity-0 before:transition-opacity before:content-[''] hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12] active:before:opacity-[0.12] motion-reduce:before:transition-none";

/**
 * The `tone-matrix` in Material 3 — the twin of `Personality`, with the same
 * API and keyboard model. A small set of writing styles as M3 filter chips:
 * the selected one takes the secondary-container role and a leading check;
 * hover, focus and press are the chip's 8% / 12% state layer. It is a radio
 * group with roving focus (arrow keys move and select, Home / End jump).
 * Tone changes how the agent writes, never what it may do — keep
 * permission, caveat and refusal strings outside it. `variant="list"` is
 * the settings-page picker: M3 radio rows with each description visible, a
 * primary-container "Recommended" `badge` and a locked `note`.
 */
export const Md3Personality = React.forwardRef<HTMLDivElement, Md3PersonalityProps>(
  (
    { options = defaultTones, value, defaultValue, onValueChange, label = "Tone", variant = "chips", note, className, ...props },
    ref,
  ) => {
    const list = variant === "list";
    // Selection and roving-focus logic copied from @nucleux/personality (internal there).
    const [internal, setInternal] = React.useState<string | undefined>(defaultValue);
    const current = value !== undefined ? value : internal;
    const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
    const descId = React.useId();
    const select = (next: string) => {
      if (value === undefined) setInternal(next);
      onValueChange?.(next);
    };
    const selectedIndex = options.findIndex((o) => o.value === current);
    const tabStop = selectedIndex >= 0 ? selectedIndex : 0;

    const onKeyDown = (e: React.KeyboardEvent, index: number) => {
      const last = options.length - 1;
      let next: number | null = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = index === last ? 0 : index + 1;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = index === 0 ? last : index - 1;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = last;
      if (next === null) return;
      e.preventDefault();
      refs.current[next]?.focus();
      select(options[next]!.value);
    };

    return (
      <div
        ref={ref}
        data-variant="tone-matrix"
        data-layout={variant}
        className={cn("flex flex-col gap-2", className)}
        {...props}
      >
        {label && (
          <span
            className={
              list
                ? "text-lg font-semibold text-md-on-surface"
                : "text-xs font-medium tracking-[0.5px] text-md-on-surface-variant"
            }
          >
            {label}
          </span>
        )}
        {note && (
          <p className="m-0 mt-2 flex items-center gap-1.5 text-sm tracking-[0.25px] text-md-on-surface-variant">
            <Lock aria-hidden="true" className="size-4 shrink-0" />
            {note}
          </p>
        )}
        <div
          role="radiogroup"
          aria-label={typeof label === "string" ? label : "Tone"}
          className={list ? "mt-2 flex flex-col" : "flex flex-wrap gap-2"}
        >
          {options.map((option, index) => {
            const active = current === option.value;
            if (list) {
              return (
                <button
                  key={option.value}
                  ref={(el) => {
                    refs.current[index] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-describedby={option.description ? `${descId}-${index}` : undefined}
                  tabIndex={index === tabStop ? 0 : -1}
                  onClick={() => select(option.value)}
                  onKeyDown={(e) => onKeyDown(e, index)}
                  className={cn(
                    "flex items-start gap-4 rounded-md-md py-2 pl-2.5 pr-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-md-primary",
                    stateLayer,
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "relative mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors motion-reduce:transition-none",
                      active ? "border-md-primary" : "border-md-on-surface-variant",
                    )}
                  >
                    {active && <span className="size-2.5 rounded-full bg-md-primary" />}
                  </span>
                  <span className="relative flex flex-col gap-1">
                    <span className="flex items-center gap-2 text-base text-md-on-surface">
                      {option.icon}
                      {option.label}
                      {option.badge != null && (
                        <span className="rounded-md-sm bg-md-primary-container px-1.5 py-0.5 text-xs font-semibold tracking-[0.5px] text-md-on-primary-container">
                          {option.badge}
                        </span>
                      )}
                    </span>
                    {option.description && (
                      <span id={`${descId}-${index}`} className="text-sm tracking-[0.25px] text-md-on-surface-variant">
                        {option.description}
                      </span>
                    )}
                  </span>
                </button>
              );
            }
            return (
              <button
                key={option.value}
                ref={(el) => {
                  refs.current[index] = el;
                }}
                type="button"
                role="radio"
                aria-checked={active}
                aria-describedby={option.description ? `${descId}-${index}` : undefined}
                tabIndex={index === tabStop ? 0 : -1}
                onClick={() => select(option.value)}
                onKeyDown={(e) => onKeyDown(e, index)}
                className={cn(
                  "inline-flex h-8 items-center gap-2 rounded-md-sm border px-3 text-sm font-medium tracking-[0.1px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-md-primary motion-reduce:transition-none [&_svg]:relative [&_svg]:size-[18px]",
                  stateLayer,
                  active
                    ? "border-transparent bg-md-secondary-container pl-2 text-md-on-secondary-container"
                    : "border-md-outline bg-transparent text-md-on-surface-variant",
                )}
              >
                {active && option.icon == null && <Check aria-hidden="true" />}
                {option.icon}
                <span className="relative">{option.label}</span>
                {option.description && (
                  <span id={`${descId}-${index}`} className="sr-only">
                    {option.description}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  },
);
Md3Personality.displayName = "Md3Personality";

/**
 * The `voice-card` in Material 3 — the twin of `PersonalityVoiceCard`. An
 * outlined card whose sample utterance sits on a surface-container ground
 * behind a primary rule (the voice, written down), with the voice tags as
 * outlined chips beneath it.
 */
export const Md3PersonalityVoiceCard = React.forwardRef<HTMLElement, Md3PersonalityVoiceCardProps>(
  ({ quote, tags = [], label = "Voice", className, ...props }, ref) => (
    <figure
      ref={ref}
      aria-label={label}
      data-variant="voice-card"
      className={cn(
        "m-0 rounded-md-lg border border-md-outline-variant bg-md-surface p-5 text-md-on-surface",
        className,
      )}
      {...props}
    >
      <blockquote className="m-0 rounded-md-xs border-l-[3px] border-md-primary bg-md-surface-container px-3.5 py-3 text-sm leading-5 tracking-[0.25px] text-md-on-surface">
        “{quote}”
      </blockquote>
      {tags.length > 0 && (
        <figcaption className="mt-3">
          <span className="sr-only">Voice: </span>
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {tags.map((tag) => (
              <li
                key={tag}
                className="inline-flex h-6 items-center rounded-md-sm border border-md-outline-variant px-2 text-xs font-medium tracking-[0.5px] text-md-on-surface-variant"
              >
                {tag}
              </li>
            ))}
          </ul>
        </figcaption>
      )}
    </figure>
  ),
);
Md3PersonalityVoiceCard.displayName = "Md3PersonalityVoiceCard";

/**
 * The `sample-dialog` in Material 3 — the twin of `PersonalitySampleDialog`.
 * Two authors, two grounds: the person's turns on surface-container-high,
 * the agent's on its primary-container ground, each with the M3 bubble
 * shape (a small corner toward its author). Lines marked `fixed` carry a
 * lock and "Same in every personality", so the contract is visible.
 */
export const Md3PersonalitySampleDialog = React.forwardRef<HTMLDivElement, Md3PersonalitySampleDialogProps>(
  ({ turns, agentName = "Assistant", label = "Sample dialog", className, ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      aria-label={label}
      data-variant="sample-dialog"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    >
      {turns.map((turn, i) => {
        const user = turn.from === "user";
        return (
          <div
            key={i}
            className={cn(
              "max-w-[85%] px-3.5 py-2.5 text-xs leading-[18px] tracking-[0.25px]",
              user
                ? "self-end rounded-md-lg rounded-br-md-xs bg-md-surface-container-high text-md-on-surface"
                : "self-start rounded-md-lg rounded-bl-md-xs bg-md-primary-container text-md-on-primary-container",
            )}
          >
            <span className="sr-only">{user ? "You said: " : `${agentName} said: `}</span>
            {turn.text}
            {turn.fixed && (
              <span className="mt-1 flex items-center gap-1 text-[11px] font-medium tracking-[0.5px] opacity-80">
                <Lock aria-hidden="true" className="size-3" />
                Same in every personality
              </span>
            )}
          </div>
        );
      })}
    </div>
  ),
);
Md3PersonalitySampleDialog.displayName = "Md3PersonalitySampleDialog";

import * as React from "react";
import { Lock } from "lucide-react";
import { cn } from "@nucleux/utils";
import { Bubble, BubbleContent } from "@nucleux/bubble";

export interface ToneOption {
  /** Stable value passed to `onValueChange`. */
  value: string;
  /** Display label. */
  label: React.ReactNode;
  /** Optional leading icon. */
  icon?: React.ReactNode;
  /** One-line description of the writing style, used as the option's accessible description (shown under the label in the `list` variant). */
  description?: string;
  /** A short tag beside the label — "Recommended". */
  badge?: React.ReactNode;
}

/** `chips` (a row of pills, default) or `list` (radio rows with each description visible). */
export type PersonalityVariant = "chips" | "list";

/** The default set of output tones. */
export const defaultTones: ToneOption[] = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "direct", label: "Direct" },
  { value: "playful", label: "Playful" },
];

export interface PersonalityProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Tone options. Defaults to {@link defaultTones}. */
  options?: ToneOption[];
  /** Selected value (controlled). */
  value?: string;
  /** Initial value (uncontrolled). */
  defaultValue?: string;
  /** Called when a tone is chosen. */
  onValueChange?: (value: string) => void;
  /** Group label. Defaults to `"Tone"`. In the `list` variant it is the setting's heading. */
  label?: React.ReactNode;
  /** `chips` (default) or `list`: a settings-page picker, one radio row per option with its description. */
  variant?: PersonalityVariant;
  /** A line under the label, marked with a lock: what the setting never changes ("Permissions, facts and safety stay the same."). */
  note?: React.ReactNode;
}

/**
 * The `tone-matrix`: a small set of tones the person can nudge the agent
 * into for a session — more formal, more casual. A radio group with
 * roving focus (arrow keys move and select, Home / End jump). Tone changes
 * how the agent writes, never what it may do: keep permission, caveat and
 * refusal strings outside it. `variant="list"` makes it the settings-page
 * picker: radio rows with each description, a "Recommended" `badge` and a
 * locked `note`. Pair with `PersonalityVoiceCard` and
 * `PersonalitySampleDialog` to preview a voice.
 */
export const Personality = React.forwardRef<HTMLDivElement, PersonalityProps>(
  (
    { options = defaultTones, value, defaultValue, onValueChange, label = "Tone", variant = "chips", note, className, ...props },
    ref,
  ) => {
    const list = variant === "list";
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
          <span className={list ? "text-base font-semibold text-foreground" : "text-xs font-medium text-muted-foreground"}>
            {label}
          </span>
        )}
        {note && (
          <p className="m-0 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock aria-hidden="true" className="size-3.5 shrink-0" />
            {note}
          </p>
        )}
        <div
          role="radiogroup"
          aria-label={typeof label === "string" ? label : "Tone"}
          className={list ? "flex flex-col gap-1" : "flex flex-wrap gap-1.5"}
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
                  className="flex items-start gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border",
                      active ? "border-primary" : "border-input",
                    )}
                  >
                    {active && <span className="size-2 rounded-full bg-primary" />}
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                      {option.icon}
                      {option.label}
                      {option.badge != null && (
                        <span className="rounded-md bg-brand-muted px-1.5 py-0.5 text-[11px] font-semibold text-foreground">
                          {option.badge}
                        </span>
                      )}
                    </span>
                    {option.description && (
                      <span id={`${descId}-${index}`} className="text-xs text-muted-foreground">
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
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-3.5",
                  active
                    ? "border-brand bg-brand-muted text-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {option.icon}
                {option.label}
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
Personality.displayName = "Personality";

export interface PersonalityVoiceCardProps extends React.HTMLAttributes<HTMLElement> {
  /** A sample utterance in the agent's voice. */
  quote: React.ReactNode;
  /** Voice tags — "calm", "proactive", "never breathless". */
  tags?: string[];
  /** Accessible name of the card. Default "Voice". */
  label?: string;
}

/**
 * The `voice-card`: one sample utterance with its voice written beneath it
 * ("Voice · calm · proactive"), showing the agent's tone at a glance — for
 * greetings and onboarding.
 */
export const PersonalityVoiceCard = React.forwardRef<HTMLElement, PersonalityVoiceCardProps>(
  ({ quote, tags = [], label = "Voice", className, ...props }, ref) => (
    <figure
      ref={ref}
      aria-label={label}
      data-variant="voice-card"
      className={cn("m-0 rounded-xl border border-border bg-background p-4 shadow-sm", className)}
      {...props}
    >
      <blockquote className="m-0 text-[13px] leading-5 text-foreground/80">“{quote}”</blockquote>
      {tags.length > 0 && (
        <figcaption className="mt-2.5 text-[11px] font-medium text-muted-foreground">
          {[label, ...tags].join(" · ")}
        </figcaption>
      )}
    </figure>
  ),
);
PersonalityVoiceCard.displayName = "PersonalityVoiceCard";

export interface PersonalitySampleTurn {
  /** Who speaks. */
  from: "user" | "agent";
  /** What they say. */
  text: React.ReactNode;
  /**
   * The line is fixed — a permission request, caveat or refusal that stays
   * the same in every personality. Marked with a lock and "Same in every personality".
   */
  fixed?: boolean;
}

export interface PersonalitySampleDialogProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The exchange, in order. */
  turns: PersonalitySampleTurn[];
  /** Agent name for screen readers ("Aria said"). Default "Assistant". */
  agentName?: string;
  /** Accessible name of the sample. Default "Sample dialog". */
  label?: string;
}

/**
 * The `sample-dialog`: a short exchange that demonstrates the voice in a
 * real interaction — the team keeps it as a regression test, and a
 * personality picker can preview it before applying. Lines marked `fixed`
 * carry a lock: they read the same in every personality.
 */
export const PersonalitySampleDialog = React.forwardRef<HTMLDivElement, PersonalitySampleDialogProps>(
  ({ turns, agentName = "Assistant", label = "Sample dialog", className, ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      aria-label={label}
      data-variant="sample-dialog"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    >
      {turns.map((turn, i) => (
        <Bubble key={i} variant={turn.from === "user" ? "secondary" : "outline"} align={turn.from === "user" ? "end" : "start"}>
          <BubbleContent className="text-xs leading-[18px]">
            <span className="sr-only">{turn.from === "user" ? "You said: " : `${agentName} said: `}</span>
            {turn.text}
            {turn.fixed && (
              <span className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                <Lock aria-hidden="true" className="size-3" />
                Same in every personality
              </span>
            )}
          </BubbleContent>
        </Bubble>
      ))}
    </div>
  ),
);
PersonalitySampleDialog.displayName = "PersonalitySampleDialog";

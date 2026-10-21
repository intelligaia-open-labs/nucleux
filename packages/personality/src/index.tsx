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
  /** One-line description of the writing style, used as the option's accessible description. */
  description?: string;
}

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
  /** Group label. Defaults to `"Tone"`. */
  label?: React.ReactNode;
}

/**
 * The `tone-matrix`: a small set of tones the person can nudge the agent
 * into for a session — more formal, more casual. A radio group with
 * roving focus (arrow keys move and select, Home / End jump). Tone changes
 * how the agent writes, never what it may do: keep permission, caveat and
 * refusal strings outside it. Pair with `PersonalityVoiceCard` and
 * `PersonalitySampleDialog` to preview a voice.
 */
export const Personality = React.forwardRef<HTMLDivElement, PersonalityProps>(
  ({ options = defaultTones, value, defaultValue, onValueChange, label = "Tone", className, ...props }, ref) => {
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
      <div ref={ref} data-variant="tone-matrix" className={cn("flex flex-col gap-2", className)} {...props}>
        {label && <span className="text-xs font-medium text-muted-foreground">{label}</span>}
        <div role="radiogroup" aria-label={typeof label === "string" ? label : "Tone"} className="flex flex-wrap gap-1.5">
          {options.map((option, index) => {
            const active = current === option.value;
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
 * The `voice-card`: one sample utterance plus voice tags, showing the
 * agent's tone at a glance — for greetings and onboarding.
 */
export const PersonalityVoiceCard = React.forwardRef<HTMLElement, PersonalityVoiceCardProps>(
  ({ quote, tags = [], label = "Voice", className, ...props }, ref) => (
    <figure
      ref={ref}
      aria-label={label}
      data-variant="voice-card"
      className={cn("m-0 rounded-xl border border-border bg-background p-4", className)}
      {...props}
    >
      <blockquote className="m-0 text-sm italic leading-5 text-foreground/80">“{quote}”</blockquote>
      {tags.length > 0 && (
        <figcaption className="mt-3">
          <span className="sr-only">Voice: </span>
          <ul className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground"
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

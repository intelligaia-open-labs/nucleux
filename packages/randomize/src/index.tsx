import * as React from "react";
import { ChevronLeft, Dices, RotateCw } from "lucide-react";
import { cn } from "@nucleux/utils";
import { Button } from "@nucleux/button";
import { Spinner } from "@nucleux/spinner";

/** Form of the control, from the spec's variants. */
export type RandomizeVariant = "dice-button" | "shuffle-bar" | "random-card";

/** How a prompt lands in the composer: replacing its text, or added below it. */
export type RandomizeUseMode = "replace" | "append";

export interface RandomizeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** "dice-button" (default), "shuffle-bar" or "random-card". */
  variant?: RandomizeVariant;
  /** A pool of starter prompts to pick from — no repeats until the pool is used up. */
  prompts?: string[];
  /**
   * Generates a direction instead of picking from `prompts` (e.g. a model
   * call). Gets the prompts shown so far, so it can avoid repeats. May be
   * async: the control shows a working state and, on failure, Try again.
   */
  generate?: (previous: string[]) => string | Promise<string>;
  /**
   * Called with the chosen prompt. Put it in the composer as editable text
   * and focus it — never send it. `mode` is "append" when the person chose
   * to add it below their own words.
   */
  onSelect: (prompt: string, detail: { mode: RandomizeUseMode }) => void;
  /** The composer's current text. When it holds the person's own words, Use asks: replace, add below, or cancel. */
  draft?: string;
  /** The control's label. Defaults to "Surprise me". */
  label?: string;
  /** Dice button: show the label beside the dice. Set false inside a composer toolbar (the label stays the accessible name). Defaults to true. */
  showLabel?: boolean;
  /** The shuffle bar's lead. Defaults to "Not sure where to start?". */
  lead?: React.ReactNode;
  /** The random card's eyebrow. Defaults to "Surprise prompt". */
  cardLabel?: React.ReactNode;
  /** Shown while `generate` is working. Defaults to "Finding a different direction…". */
  loadingLabel?: string;
  /** Shown when `generate` fails. Defaults to "Couldn't find a new direction." */
  errorLabel?: string;
  /** The control's icon. Defaults to dice; pass an AI sparkle when a model generates the directions. */
  icon?: React.ReactNode;
  /** Dice button with its label: one supporting line beside the control ("A random starting point for the launch — edit it before you use it."). */
  supportingText?: React.ReactNode;
}

const pickFrom = (pool: string[], exclude: string[]) => {
  const fresh = pool.filter((p) => !exclude.includes(p));
  const from = fresh.length > 0 ? fresh : pool.filter((p) => p !== exclude[exclude.length - 1]);
  const list = from.length > 0 ? from : pool;
  return list[Math.floor(Math.random() * list.length)];
};

/**
 * A "surprise me" control that fills the empty composer with a random
 * starter when the person has no specific intent. It sits beside the input,
 * never replaces it, and nothing it produces is sent: the chosen prompt goes
 * to `onSelect` to be placed in the composer, editable. If the composer
 * already holds the person's words (`draft`), it asks first — Replace, Add
 * below or Cancel. Directions come from a `prompts` pool (no repeats this
 * round) or an async `generate`, with working and error states. Shown as a
 * labelled button with an optional supporting line (a dice icon button in a
 * composer toolbar with `showLabel={false}`), a shuffle bar that previews the pick,
 * or a random card with Pick another and a way back to the previous one.
 */
export const Randomize = React.forwardRef<HTMLDivElement, RandomizeProps>(
  (
    {
      variant = "dice-button",
      prompts = [],
      generate,
      onSelect,
      draft,
      label = "Surprise me",
      showLabel = true,
      lead = "Not sure where to start?",
      cardLabel = "Surprise prompt",
      loadingLabel = "Finding a different direction…",
      errorLabel = "Couldn't find a new direction.",
      icon,
      supportingText,
      className,
      ...props
    },
    ref,
  ) => {
    const baseId = React.useId();
    // History of directions shown this round, and which one is on screen.
    const [history, setHistory] = React.useState<string[]>(() =>
      variant === "random-card" && !generate && prompts.length > 0 ? [pickFrom(prompts, [])] : [],
    );
    const [pos, setPos] = React.useState(history.length - 1);
    const [loading, setLoading] = React.useState(false);
    const [failed, setFailed] = React.useState(false);
    const [confirming, setConfirming] = React.useState<string | null>(null);
    const [announce, setAnnounce] = React.useState("");
    const lastPlaced = React.useRef<string | null>(null);
    const replaceRef = React.useRef<HTMLButtonElement>(null);
    const mounted = React.useRef(true);
    React.useEffect(
      () => () => {
        mounted.current = false;
      },
      [],
    );

    const current = pos >= 0 ? history[pos] : undefined;

    const place = (prompt: string, mode: RandomizeUseMode) => {
      lastPlaced.current = prompt;
      setConfirming(null);
      setAnnounce(mode === "append" ? "Added below your message." : "Placed in the message field.");
      onSelect(prompt, { mode });
    };

    const use = (prompt: string) => {
      const own = draft?.trim();
      if (own && draft !== lastPlaced.current) {
        setConfirming(prompt);
        return;
      }
      place(prompt, "replace");
    };

    const push = (next: string, thenUse: boolean) => {
      setHistory((h) => [...h.slice(0, pos + 1), next]);
      setPos((p) => p + 1);
      if (thenUse) use(next);
    };

    const next = (thenUse = false) => {
      setFailed(false);
      setConfirming(null);
      if (generate) {
        let result: string | Promise<string>;
        try {
          result = generate(history);
        } catch {
          setFailed(true);
          return;
        }
        if (typeof result === "string") {
          push(result, thenUse);
          return;
        }
        setLoading(true);
        setAnnounce(loadingLabel);
        result.then(
          (text) => {
            if (!mounted.current) return;
            setLoading(false);
            setAnnounce("");
            push(text, thenUse);
          },
          () => {
            if (!mounted.current) return;
            setLoading(false);
            setFailed(true);
            setAnnounce(errorLabel);
          },
        );
        return;
      }
      if (prompts.length === 0) return;
      push(pickFrom(prompts, history), thenUse);
    };

    // A generated random card fetches its first direction on mount.
    React.useEffect(() => {
      if (variant === "random-card" && generate && history.length === 0) next();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
      if (confirming) replaceRef.current?.focus();
    }, [confirming]);

    const busyIcon = <Spinner aria-hidden="true" role={undefined} aria-label={undefined} className="motion-reduce:animate-none" />;
    const diceIcon = icon ?? <Dices aria-hidden="true" className="size-4" />;
    const disabled = loading || (!generate && prompts.length === 0);

    const confirmPanel = confirming != null && (
      <div
        role="group"
        aria-labelledby={`${baseId}-confirm`}
        className={cn(
          "flex flex-col gap-2 rounded-lg border border-border bg-background p-3 text-sm shadow-md",
          variant === "dice-button" && "absolute left-0 top-full z-50 mt-2 w-72",
          variant === "random-card" && "mt-2.5",
        )}
      >
        <p id={`${baseId}-confirm`} className="text-foreground">
          Your message already has text. Use this prompt instead?
        </p>
        <div className="flex flex-wrap gap-1.5">
          <Button ref={replaceRef} size="sm" onClick={() => place(confirming, "replace")}>
            Replace
          </Button>
          <Button size="sm" variant="secondary" onClick={() => place(confirming, "append")}>
            Add below
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirming(null)}>
            Cancel
          </Button>
        </div>
      </div>
    );

    const status = (
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    );

    const errorRow = failed && (
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        {errorLabel}
        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" leftIcon={<RotateCw className="size-3.5" />} onClick={() => next()}>
          Try again
        </Button>
      </p>
    );

    const backButton = pos > 0 && (
      <Button
        size="icon-sm"
        variant="ghost"
        aria-label="Previous prompt"
        onClick={() => {
          setConfirming(null);
          setPos((p) => p - 1);
        }}
        className="size-7"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
      </Button>
    );

    if (variant === "dice-button") {
      return (
        <div ref={ref} className={cn("relative inline-flex flex-wrap items-center gap-x-3 gap-y-1.5", className)} {...props}>
          {showLabel ? (
            <Button
              variant="secondary"
              aria-busy={loading || undefined}
              disabled={disabled}
              leftIcon={loading ? busyIcon : diceIcon}
              onClick={() => next(true)}
              className="[&_svg]:size-4"
            >
              {label}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={label}
              aria-busy={loading || undefined}
              disabled={disabled}
              onClick={() => next(true)}
              className="[&_svg]:size-4"
            >
              {loading ? busyIcon : diceIcon}
            </Button>
          )}
          {showLabel && (loading || supportingText != null) && (
            <span className="text-sm text-muted-foreground">{loading ? loadingLabel : supportingText}</span>
          )}
          {errorRow}
          {confirmPanel}
          {status}
        </div>
      );
    }

    if (variant === "shuffle-bar") {
      return (
        <div
          ref={ref}
          role="group"
          aria-labelledby={`${baseId}-lead`}
          className={cn("flex flex-col gap-2 rounded-lg border border-border bg-background px-3.5 py-2.5", className)}
          {...props}
        >
          <div className="flex items-center justify-between gap-3">
            <p id={`${baseId}-lead`} className="text-sm text-foreground">
              {lead}
            </p>
            <Button
              size="sm"
              className="rounded-full"
              aria-busy={loading || undefined}
              disabled={disabled}
              leftIcon={loading ? busyIcon : diceIcon}
              onClick={() => next()}
            >
              {current ? "Shuffle" : label}
            </Button>
          </div>
          {loading && <p className="text-xs text-muted-foreground">{loadingLabel}</p>}
          {current && !loading && (
            <div className="flex items-center gap-2 border-t border-border pt-2">
              {backButton}
              <p className="min-w-0 flex-1 text-sm italic text-foreground">“{current}”</p>
              <Button size="sm" variant="secondary" onClick={() => use(current)}>
                Use this
              </Button>
            </div>
          )}
          {errorRow}
          {confirmPanel}
          {status}
        </div>
      );
    }

    // The random card's own look (nucleux.in): a dashed slate card with the 🎲 emoji.
    const cardIcon = icon ?? <span aria-hidden="true">🎲</span>;
    return (
      <div
        ref={ref}
        role="group"
        aria-labelledby={`${baseId}-card`}
        className={cn(
          "flex flex-col rounded-xl border-[1.5px] border-dashed border-[hsl(213_27%_84%)] from-[hsl(var(--nx-slate-100))] to-[hsl(var(--nx-slate-50))] px-[18px] pb-4 pt-[18px] [background-image:linear-gradient(140deg,var(--tw-gradient-stops))]",
          className,
        )}
        {...props}
      >
        <p
          id={`${baseId}-card`}
          className="mb-2.5 flex items-center gap-1.5 text-[10px] font-bold uppercase leading-[1.55] tracking-[0.08em] text-[hsl(var(--nx-slate-500))] [&>:first-child]:text-[16px] [&>:first-child]:font-normal [&>:first-child]:tracking-normal [&_svg]:size-4 [&_svg]:text-foreground"
        >
          {cardIcon}
          {cardLabel}
        </p>
        {loading ? (
          <p className="text-[13.5px] leading-[1.65] text-muted-foreground">{loadingLabel}</p>
        ) : current ? (
          <p className="text-[13.5px] italic leading-[1.65] text-foreground">"{current}"</p>
        ) : null}
        {errorRow}
        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          {backButton}
          <Button
            size="sm"
            variant="secondary"
            className="h-auto gap-[5px] rounded-lg border-[hsl(213_27%_84%)] bg-[hsl(var(--nx-slate-50))] px-3 py-1.5 text-[11.5px] font-medium leading-[1.55] tracking-normal text-[hsl(215_19%_35%)] shadow-none hover:bg-[hsl(var(--nx-slate-100))] [&_svg]:size-3.5"
            aria-busy={loading || undefined}
            disabled={disabled}
            leftIcon={loading ? busyIcon : icon ?? <span aria-hidden="true" className="text-[13px]">🎲</span>}
            onClick={() => next()}
          >
            Pick another
          </Button>
          {current && !loading && (
            <Button
              size="sm"
              className="h-auto gap-[5px] rounded-lg border-0 px-3.5 py-1.5 text-[11.5px] font-medium leading-[1.55] tracking-normal shadow-none hover:bg-[hsl(215_25%_27%)]"
              onClick={() => use(current)}
            >
              Use this
            </Button>
          )}
        </div>
        {confirmPanel}
        {status}
      </div>
    );
  },
);
Randomize.displayName = "Randomize";

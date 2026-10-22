import * as React from "react";
import { ChevronLeft, Dices, RotateCw } from "lucide-react";
import { cn } from "@nucleux/utils";
import type { RandomizeProps, RandomizeUseMode, RandomizeVariant } from "@nucleux/randomize";
import { Md3Button } from "@nucleux/md3-button";
import { Md3IconButton } from "@nucleux/md3-icon-button";
import { Md3LoadingIndicator } from "@nucleux/md3-loading-indicator";

/** Props of {@link Md3Randomize} — identical to `RandomizeProps` from `@nucleux/randomize`. */
export type Md3RandomizeProps = RandomizeProps;
/** "dice-button", "shuffle-bar" or "random-card". */
export type Md3RandomizeVariant = RandomizeVariant;
/** "replace" or "append". */
export type Md3RandomizeUseMode = RandomizeUseMode;

// Copied from @nucleux/randomize (internal there): no repeats until the pool is used up.
const pickFrom = (pool: string[], exclude: string[]) => {
  const fresh = pool.filter((p) => !exclude.includes(p));
  const from = fresh.length > 0 ? fresh : pool.filter((p) => p !== exclude[exclude.length - 1]);
  const list = from.length > 0 ? from : pool;
  return list[Math.floor(Math.random() * list.length)];
};

// M3 small button (32dp) on top of Md3Button.
const small = "h-8 gap-1.5 px-4 [&_svg]:size-4";
// A new direction rises in on emphasized-decelerate; under reduced motion it simply appears.
const rise = "animate-nx-fade-in [animation-duration:400ms] [animation-timing-function:cubic-bezier(0.05,0.7,0.1,1)] motion-reduce:animate-none";

/**
 * The Material 3 "surprise me" control — the same API and behaviour as
 * `Randomize`. It sits beside the composer, never replaces it, and sends
 * nothing: the chosen prompt goes to `onSelect` to be placed in the composer,
 * editable, and if the composer already holds the person's words it asks
 * first (Replace, Add below, Cancel) in a level-2 surface. Drawn as a tonal
 * labelled button with an optional supporting line (or a dice icon button in a
 * composer toolbar with `showLabel={false}`), an outlined shuffle bar that
 * previews the pick, or a random card whose ground is tinted while a
 * direction is still being found and resolves to an outlined edge once it
 * lands. Working uses the M3 loading indicator; no dice animation.
 */
export const Md3Randomize = React.forwardRef<HTMLDivElement, Md3RandomizeProps>(
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

    const busyIcon = <Md3LoadingIndicator aria-hidden="true" size={20} className="text-current" />;
    const diceIcon = icon ?? <Dices aria-hidden="true" />;
    const disabled = loading || (!generate && prompts.length === 0);

    const confirmPanel = confirming != null && (
      <div
        role="group"
        aria-labelledby={`${baseId}-confirm`}
        className={cn(
          "flex flex-col gap-3 rounded-md-md bg-md-surface-container-high p-4 text-sm text-md-on-surface shadow-md-2",
          rise,
          variant === "dice-button" && "absolute left-0 top-full z-50 mt-2 w-80",
        )}
      >
        <p id={`${baseId}-confirm`} className="tracking-[0.25px]">
          Your message already has text. Use this prompt instead?
        </p>
        <div className="flex flex-wrap gap-2">
          <Md3Button ref={replaceRef} onClick={() => place(confirming, "replace")} className={small}>
            Replace
          </Md3Button>
          <Md3Button variant="tonal" onClick={() => place(confirming, "append")} className={small}>
            Add below
          </Md3Button>
          <Md3Button variant="text" onClick={() => setConfirming(null)} className={cn(small, "px-3")}>
            Cancel
          </Md3Button>
        </div>
      </div>
    );

    const status = (
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    );

    const errorRow = failed && (
      <p className="flex items-center gap-2 text-xs tracking-[0.4px] text-md-on-surface-variant">
        {errorLabel}
        <Md3Button variant="text" icon={<RotateCw aria-hidden="true" />} onClick={() => next()} className={cn(small, "px-3")}>
          Try again
        </Md3Button>
      </p>
    );

    const backButton = pos > 0 && (
      <Md3IconButton
        aria-label="Previous prompt"
        onClick={() => {
          setConfirming(null);
          setPos((p) => p - 1);
        }}
        className="size-8 [&_svg]:size-5"
      >
        <ChevronLeft aria-hidden="true" />
      </Md3IconButton>
    );

    if (variant === "dice-button") {
      return (
        <div ref={ref} className={cn("relative inline-flex flex-wrap items-center gap-x-4 gap-y-2", className)} {...props}>
          {showLabel ? (
            <Md3Button
              variant="tonal"
              aria-busy={loading || undefined}
              disabled={disabled}
              icon={loading ? busyIcon : diceIcon}
              onClick={() => next(true)}
              className="[&_svg]:size-[18px]"
            >
              {label}
            </Md3Button>
          ) : (
            <Md3IconButton
              variant="standard"
              aria-label={label}
              aria-busy={loading || undefined}
              disabled={disabled}
              onClick={() => next(true)}
              className="size-10"
            >
              {loading ? busyIcon : diceIcon}
            </Md3IconButton>
          )}
          {showLabel && (loading || supportingText != null) && (
            <span className="text-sm tracking-[0.25px] text-md-on-surface-variant">{loading ? loadingLabel : supportingText}</span>
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
          className={cn(
            "flex flex-col gap-3 rounded-md-lg border border-md-outline-variant bg-md-surface px-4 py-3 text-md-on-surface",
            className,
          )}
          {...props}
        >
          <div className="flex items-center justify-between gap-3">
            <p id={`${baseId}-lead`} className="text-sm tracking-[0.25px]">
              {lead}
            </p>
            <Md3Button
              variant="tonal"
              aria-busy={loading || undefined}
              disabled={disabled}
              icon={loading ? busyIcon : diceIcon}
              onClick={() => next()}
              className={small}
            >
              {current ? "Shuffle" : label}
            </Md3Button>
          </div>
          {loading && <p className="text-xs tracking-[0.4px] text-md-on-surface-variant">{loadingLabel}</p>}
          {current && !loading && (
            <div className={cn("flex items-center gap-2 border-t border-md-outline-variant pt-3", rise)}>
              {backButton}
              <p className="min-w-0 flex-1 text-sm tracking-[0.25px]">“{current}”</p>
              <Md3Button variant="outlined" onClick={() => use(current)} className={small}>
                Use this
              </Md3Button>
            </div>
          )}
          {errorRow}
          {confirmPanel}
          {status}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        role="group"
        aria-labelledby={`${baseId}-card`}
        className={cn(
          "flex flex-col gap-3 rounded-md-lg border p-4 text-md-on-surface transition-[border-color,background-color] duration-[380ms] ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none",
          loading
            ? "border-transparent bg-gradient-to-b from-md-primary-container to-md-surface"
            : "border-md-outline-variant bg-md-surface",
          className,
        )}
        {...props}
      >
        <p id={`${baseId}-card`} className="text-xs font-medium tracking-[0.5px] text-md-primary">
          {cardLabel}
        </p>
        {loading ? (
          <p className="text-sm tracking-[0.25px] text-md-on-surface-variant">{loadingLabel}</p>
        ) : current ? (
          <p key={pos} className={cn("text-base leading-6 tracking-[0.5px]", rise)}>
            “{current}”
          </p>
        ) : null}
        {errorRow}
        <div className="flex flex-wrap items-center gap-2">
          {backButton}
          <Md3Button
            variant="tonal"
            aria-busy={loading || undefined}
            disabled={disabled}
            icon={loading ? busyIcon : diceIcon}
            onClick={() => next()}
            className={small}
          >
            Pick another
          </Md3Button>
          {current && !loading && (
            <Md3Button onClick={() => use(current)} className={small}>
              Use this
            </Md3Button>
          )}
        </div>
        {confirmPanel}
        {status}
      </div>
    );
  },
);
Md3Randomize.displayName = "Md3Randomize";

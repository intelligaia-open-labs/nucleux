import * as React from "react";
import { CheckCircle2, Sparkles, X } from "lucide-react";
import { cn } from "@nucleux/utils";
import type {
  ProactiveSuggestionPersist,
  ProactiveSuggestionProps,
  ProactiveSuggestionVariant,
} from "@nucleux/proactive";
import { Md3Button } from "@nucleux/md3-button";
import { Md3IconButton } from "@nucleux/md3-icon-button";
import { Md3LoadingIndicator } from "@nucleux/md3-loading-indicator";

/** Props of {@link Md3ProactiveSuggestion} — identical to `ProactiveSuggestionProps`. */
export type Md3ProactiveSuggestionProps = ProactiveSuggestionProps;
/** "contextual-banner", "inline-suggestion" or "side-toast". */
export type Md3ProactiveSuggestionVariant = ProactiveSuggestionVariant;
/** "none", "session" or "local". */
export type Md3ProactiveSuggestionPersist = ProactiveSuggestionPersist;

// Copied from @nucleux/proactive (internal there) — the same storage keys, so a
// suggestion dismissed in one family stays dismissed in the other.
const KEY = "nucleux:proactive:";
const SESSION_KEY = "nucleux:proactive:session";

function getStore(kind: "session" | "local"): Storage | null {
  try {
    return typeof window === "undefined" ? null : kind === "session" ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}
function read(kind: "session" | "local", key: string) {
  try {
    return getStore(kind)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}
function write(kind: "session" | "local", key: string, value: string) {
  try {
    getStore(kind)?.setItem(key, value);
  } catch {
    /* storage unavailable: memory is best effort */
  }
}

// M3 small button (32dp) on top of Md3Button.
const small = "h-8 gap-1.5 px-4 [&_svg]:size-4";
// Arrives, does not interrupt: rises in on emphasized-decelerate; nothing moves under reduced motion.
const rise = "animate-nx-fade-in [animation-duration:400ms] [animation-timing-function:cubic-bezier(0.05,0.7,0.1,1)] motion-reduce:animate-none";

/**
 * The Material 3 proactive suggestion — the same API and behaviour as
 * `ProactiveSuggestion`. The agent leads with the finding, can show the
 * evidence, and offers exactly one next action (a filled M3 small button
 * that shows the working mark and `pendingLabel` while `onAction` is
 * pending), an optional text-button snooze and a dismiss icon button (or
 * Escape). The contextual banner is a secondary-container card with a
 * "Suggested by" provenance line; the inline suggestion a single capsule
 * beside its row; the side toast a level-3 surface in the corner. It rises
 * in on the emphasized-decelerate curve, is announced politely, and with an
 * `evidenceKey` a dismissal is remembered for the same facts.
 */
export const Md3ProactiveSuggestion = React.forwardRef<HTMLElement, Md3ProactiveSuggestionProps>(
  (
    {
      variant = "contextual-banner",
      title,
      description,
      reason,
      agentName = "the assistant",
      actionLabel,
      onAction,
      pendingLabel = "Preparing…",
      onSnooze,
      snoozeLabel = "Not now",
      onDismiss,
      dismissLabel = "Dismiss suggestion",
      open: openProp,
      defaultOpen = true,
      onOpenChange,
      evidenceKey,
      persist = "local",
      resolved = false,
      onImpression,
      className,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const baseId = React.useId();
    const titleId = `${baseId}-title`;
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
    const open = openProp ?? internalOpen;
    const remembering = evidenceKey != null && persist !== "none";
    const [allowed, setAllowed] = React.useState(!remembering);
    const [pending, setPending] = React.useState(false);
    const mounted = React.useRef(true);
    React.useEffect(
      () => () => {
        mounted.current = false;
      },
      [],
    );

    React.useEffect(() => {
      if (!remembering) {
        setAllowed(true);
        return;
      }
      const dismissed = read(persist as "session" | "local", KEY + evidenceKey);
      const shown = read("session", SESSION_KEY);
      setAllowed(!dismissed && (!shown || shown === evidenceKey));
    }, [remembering, persist, evidenceKey]);

    const visible = open && allowed;

    const impressed = React.useRef(false);
    React.useEffect(() => {
      if (!visible) {
        impressed.current = false;
        return;
      }
      if (impressed.current) return;
      impressed.current = true;
      if (evidenceKey != null) write("session", SESSION_KEY, evidenceKey);
      onImpression?.();
    }, [visible, evidenceKey, onImpression]);

    const setOpen = (next: boolean) => {
      if (openProp === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    };
    const dismiss = () => {
      if (remembering) write(persist as "session" | "local", KEY + evidenceKey, "dismissed");
      setOpen(false);
      onDismiss?.();
    };
    const snooze = () => {
      setOpen(false);
      onSnooze?.();
    };
    const act = () => {
      if (!onAction || pending) return;
      const result = onAction();
      if (result && typeof (result as Promise<unknown>).then === "function") {
        setPending(true);
        (result as Promise<unknown>).finally(() => {
          if (mounted.current) setPending(false);
        });
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
      onKeyDown?.(e);
      if (e.key === "Escape") {
        e.stopPropagation();
        dismiss();
      }
    };

    const label = `Suggestion from ${agentName}`;
    const working = <Md3LoadingIndicator aria-hidden="true" size={18} className="text-current" />;
    const dismissButton = (
      <Md3IconButton
        aria-label={dismissLabel}
        onClick={dismiss}
        className="-mr-1 -mt-1 size-8 shrink-0 text-current [&_svg]:size-[18px]"
      >
        <X aria-hidden="true" />
      </Md3IconButton>
    );
    const resolvedLine = (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.5px] text-md-on-surface-variant">
        <CheckCircle2 aria-hidden="true" className="size-4 text-md-primary" />
        Resolved
      </span>
    );

    let body: React.ReactNode = null;
    if (visible && variant === "inline-suggestion") {
      body = (
        <section
          ref={ref}
          aria-label={label}
          onKeyDown={handleKeyDown}
          className={cn("inline-flex items-center gap-1 text-md-on-surface-variant", rise, className)}
          {...props}
        >
          <span id={titleId} className="sr-only">
            {title}
            {description ? <> {description}</> : null}
          </span>
          {resolved ? (
            resolvedLine
          ) : (
            <>
              <Md3Button
                variant="tonal"
                aria-describedby={titleId}
                aria-busy={pending || undefined}
                onClick={act}
                icon={pending ? working : <Sparkles aria-hidden="true" />}
                className={small}
              >
                {pending ? pendingLabel : actionLabel}
              </Md3Button>
              {dismissButton}
            </>
          )}
        </section>
      );
    } else if (visible) {
      const toast = variant === "side-toast";
      body = (
        <section
          ref={ref}
          aria-labelledby={titleId}
          onKeyDown={handleKeyDown}
          className={cn(
            "flex items-start gap-3 text-sm tracking-[0.25px]",
            rise,
            toast
              ? "fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-md-lg bg-md-surface-container-high p-4 text-md-on-surface shadow-md-3"
              : "rounded-md-lg bg-md-secondary-container px-4 py-3.5 text-md-on-secondary-container",
            className,
          )}
          {...props}
        >
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p
              aria-hidden="true"
              className={cn(
                "mb-0.5 flex items-center gap-1.5 text-xs font-medium tracking-[0.5px]",
                toast ? "text-md-primary" : "opacity-80",
              )}
            >
              <Sparkles className="size-4" />
              {toast ? "Worth a look" : `Suggested by ${agentName}`}
            </p>
            <p id={titleId} className="text-base font-medium leading-6 tracking-[0.15px]">
              <span className="sr-only">{label}: </span>
              {title}
            </p>
            {description && <p className={toast ? "text-md-on-surface-variant" : undefined}>{description}</p>}
            {reason && (
              <p className={cn("text-xs tracking-[0.4px]", toast ? "text-md-on-surface-variant" : "opacity-80")}>{reason}</p>
            )}
            {resolved ? (
              <p className="mt-1">{resolvedLine}</p>
            ) : (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Md3Button
                  onClick={act}
                  aria-busy={pending || undefined}
                  icon={pending ? working : undefined}
                  className={small}
                >
                  {pending ? pendingLabel : actionLabel}
                </Md3Button>
                {onSnooze && (
                  <Md3Button variant="text" onClick={snooze} className={cn(small, "px-3", !toast && "text-current")}>
                    {snoozeLabel}
                  </Md3Button>
                )}
              </div>
            )}
          </div>
          {!resolved && dismissButton}
        </section>
      );
    }

    // A persistent polite live region, so a suggestion appearing is announced without stealing focus.
    return (
      <div aria-live="polite" className="contents">
        {body}
      </div>
    );
  },
);
Md3ProactiveSuggestion.displayName = "Md3ProactiveSuggestion";

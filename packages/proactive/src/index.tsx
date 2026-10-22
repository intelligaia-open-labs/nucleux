import * as React from "react";
import { CheckCircle2, Sparkles, X } from "lucide-react";
import { cn } from "@nucleux/utils";
import { Button } from "@nucleux/button";
import { Spinner } from "@nucleux/spinner";

/** Form of the suggestion, from the spec's variants. */
export type ProactiveSuggestionVariant = "contextual-banner" | "inline-suggestion" | "side-toast";

/** How dismiss is offered: an × icon button, or a labelled button beside the action. */
export type ProactiveSuggestionDismissDisplay = "icon" | "button";

/** Where dismissals are remembered when the suggestion has an `evidenceKey`. */
export type ProactiveSuggestionPersist = "none" | "session" | "local";

export interface ProactiveSuggestionProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** "contextual-banner" (default), "inline-suggestion" or "side-toast". */
  variant?: ProactiveSuggestionVariant;
  /** The finding, first ("Three renewals expire this week"). */
  title: React.ReactNode;
  /** The recommendation, phrased as a question ("Want Aria to draft outreach for each?"). */
  description?: React.ReactNode;
  /** The evidence it is based on ("Acme, Globex and Initech renew before Friday."). */
  reason?: React.ReactNode;
  /** The agent's name, used in the accessible label and the provenance line. Defaults to "the assistant". */
  agentName?: string;
  /** The one next action ("Draft emails"). */
  actionLabel: string;
  /**
   * Called by the action. It should open a review the person confirms, not
   * act on its own. May return a promise: while it is pending the action
   * shows a spinner and `pendingLabel`.
   */
  onAction?: () => void | Promise<unknown>;
  /** Shown on the action while `onAction` is pending. Defaults to "Preparing…". */
  pendingLabel?: string;
  /** Shows a snooze action ("Not now", "Remind me tomorrow"); hides without remembering a dismissal. */
  onSnooze?: () => void;
  /** Label of the snooze action. Defaults to "Not now". */
  snoozeLabel?: string;
  /** Called when dismissed (× or Escape). One press; remembered for `evidenceKey`. */
  onDismiss?: () => void;
  /** Accessible name of the dismiss button (its visible text when `dismissDisplay="button"`). Defaults to "Dismiss suggestion". */
  dismissLabel?: string;
  /**
   * `icon` (default): an × in the corner. `button`: a labelled outline
   * button after the action ("Dismiss"), as on nucleux.in's banner.
   */
  dismissDisplay?: ProactiveSuggestionDismissDisplay;
  /** Whether the suggestion is showing (controlled). */
  open?: boolean;
  /** Initial visibility when uncontrolled. Defaults to true. */
  defaultOpen?: boolean;
  /** Called whenever it shows or hides. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Identifies the facts behind it. With a key, a dismissal is remembered so
   * the same evidence never brings it back, and only one suggestion with a
   * key is shown per browser session.
   */
  evidenceKey?: string;
  /** Where to remember dismissals of `evidenceKey`. Defaults to "local". */
  persist?: ProactiveSuggestionPersist;
  /** The reason went away: say "Resolved" and drop the actions. */
  resolved?: boolean;
  /** Called once each time it is shown. */
  onImpression?: () => void;
}

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

/**
 * An unsolicited suggestion the agent raises when it notices something
 * specific and actionable — a risk, an anomaly, an overdue step. It leads
 * with the finding, can show the evidence, and offers exactly one next action
 * plus a frictionless dismiss (× or Escape) and an optional snooze; nothing
 * happens until the person acts. It is announced politely, never as a
 * dialog. Use a contextual banner at the top of a surface, an inline
 * suggestion beside the row it is about, or a side toast in the corner. With
 * an `evidenceKey` it is capped at one per session and a dismissed one never
 * comes back for the same facts.
 */
export const ProactiveSuggestion = React.forwardRef<HTMLElement, ProactiveSuggestionProps>(
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
      dismissDisplay = "icon",
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
    const spinner = (
      <Spinner aria-hidden="true" role={undefined} aria-label={undefined} className="size-3.5 motion-reduce:animate-none" />
    );
    const dismissButton = (
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={dismissLabel}
        onClick={dismiss}
        className="size-6 shrink-0 text-muted-foreground [&_svg]:size-3.5"
      >
        <X aria-hidden="true" />
      </Button>
    );

    let body: React.ReactNode = null;
    if (visible && variant === "inline-suggestion") {
      body = (
        <section
          ref={ref}
          aria-label={label}
          onKeyDown={handleKeyDown}
          className={cn("inline-flex items-center gap-1 animate-nx-fade-in motion-reduce:animate-none", className)}
          {...props}
        >
          <span id={titleId} className="sr-only">
            {title}
            {description ? <> {description}</> : null}
          </span>
          {resolved ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 aria-hidden="true" className="size-3.5 text-success" />
              Resolved
            </span>
          ) : (
            <>
              <Button
                size="sm"
                aria-describedby={titleId}
                aria-busy={pending || undefined}
                onClick={act}
                className="h-7 rounded-full px-3 text-xs"
                leftIcon={pending ? spinner : <Sparkles aria-hidden="true" className="size-3.5" />}
              >
                {pending ? pendingLabel : actionLabel}
              </Button>
              {dismissButton}
            </>
          )}
        </section>
      );
    } else if (visible) {
      const toast = variant === "side-toast";
      const dismissInline = dismissDisplay === "button";
      body = (
        <section
          ref={ref}
          aria-labelledby={titleId}
          onKeyDown={handleKeyDown}
          className={cn(
            "flex items-start gap-3 text-sm animate-nx-fade-in motion-reduce:animate-none",
            toast
              ? "fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-background p-3.5 shadow-lg"
              : "rounded-xl border border-border bg-muted/40 px-4 py-3.5",
            className,
          )}
          {...props}
        >
          {!toast && (
            <span
              aria-hidden="true"
              className="mt-px grid size-7 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground [&_svg]:size-3.5"
            >
              <Sparkles />
            </span>
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            {toast && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-brand">
                <Sparkles aria-hidden="true" className="size-3.5" />
                Worth a look
              </p>
            )}
            <p id={titleId} className="text-[13px] font-semibold leading-snug text-foreground">
              <span className="sr-only">{label}: </span>
              {title}
            </p>
            {description && <p className="text-xs leading-normal text-muted-foreground">{description}</p>}
            {reason && <p className="text-xs text-muted-foreground">{reason}</p>}
            {resolved ? (
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckCircle2 aria-hidden="true" className="size-3.5 text-success" />
                Resolved
              </p>
            ) : (
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <Button
                  size="sm"
                  onClick={act}
                  aria-busy={pending || undefined}
                  leftIcon={pending ? spinner : undefined}
                  className="px-3.5 text-xs font-medium"
                >
                  {pending ? pendingLabel : actionLabel}
                </Button>
                {onSnooze && (
                  <Button size="sm" variant="ghost" onClick={snooze} className="px-3.5 text-xs font-medium">
                    {snoozeLabel}
                  </Button>
                )}
                {dismissInline && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={dismiss}
                    className="bg-transparent px-3.5 text-xs font-medium text-muted-foreground shadow-none"
                  >
                    {dismissLabel}
                  </Button>
                )}
              </div>
            )}
          </div>
          {!resolved && !dismissInline && dismissButton}
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
ProactiveSuggestion.displayName = "ProactiveSuggestion";

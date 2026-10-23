import * as React from "react";
import { ChevronDown, ChevronRight, Lightbulb, Sparkles, X } from "lucide-react";
import { cn } from "@nucleux/utils";
import { Button, type ButtonProps } from "@nucleux/button";
import { Badge } from "@nucleux/badge";

/** Form of the nudge, from the spec's variants. */
export type NudgeVariant = "tooltip-nudge" | "inline-tip-card" | "highlight-pulse";

/** Side of the anchor the tooltip nudge sits on. */
export type NudgeSide = "top" | "right" | "bottom" | "left";

/** How the inline tip sits in the layout: a filled `card`, or a quiet `inline` rule with no fill. */
export type NudgeAppearance = "card" | "inline";

/** Where dismissals and uses are remembered when the nudge has an `id`. */
export type NudgePersist = "none" | "session" | "local";

const NudgeContext = React.createContext<{ inverted: boolean }>({ inverted: false });

export type NudgeActionProps = ButtonProps;

/**
 * An action inside a nudge ("Try it", "Not now"): a small ghost Button that
 * inverts its colours inside the dark tooltip nudge. Use it for extra
 * actions passed through `actions`.
 */
export const NudgeAction = React.forwardRef<HTMLButtonElement, NudgeActionProps>(
  ({ variant = "ghost", size = "sm", className, ...props }, ref) => {
    const { inverted } = React.useContext(NudgeContext);
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "h-7 px-2 text-xs",
          inverted && variant === "ghost" && "text-background hover:bg-background/15",
          className,
        )}
        {...props}
      />
    );
  },
);
NudgeAction.displayName = "NudgeAction";

export interface NudgeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** "inline-tip-card" (default), "tooltip-nudge" (a bubble pointing at `children`) or "highlight-pulse" (a ring around `children`). */
  variant?: NudgeVariant;
  /** What the person can do, in one line ("Try uploading a PDF — Aria can summarise it in seconds."). */
  message: React.ReactNode;
  /** A short heading for the inline card ("New: streaming summaries"). */
  title?: React.ReactNode;
  /** Why the tip appeared now, revealed by "Why this tip?" ("You've sent three text-only messages."). */
  reason?: React.ReactNode;
  /** The control the nudge is about. Required for "tooltip-nudge" and "highlight-pulse"; unused by the inline card. */
  children?: React.ReactNode;
  /** Side of `children` the tooltip nudge sits on. Defaults to "right". */
  side?: NudgeSide;
  /** Whether the nudge is showing (controlled). */
  open?: boolean;
  /** Initial visibility when uncontrolled. Defaults to true — mount it when the trigger fires. */
  defaultOpen?: boolean;
  /** Called whenever the nudge shows or hides. */
  onOpenChange?: (open: boolean) => void;
  /** Shows a "Try it" action; the nudge closes and is remembered as used. */
  onTry?: () => void;
  /** Label of the try action. Defaults to "Try it". */
  tryLabel?: string;
  /** Called when the nudge is dismissed (× or Escape). It is remembered and won't come back. */
  onDismiss?: () => void;
  /** Accessible name of the dismiss button. Defaults to "Dismiss tip". */
  dismissLabel?: string;
  /**
   * Show the × dismiss button. Defaults to true. Off, the nudge still closes
   * with Escape (and, as a tooltip, on an outside click).
   */
  dismissible?: boolean;
  /**
   * `inline-tip-card` only: `card` (default) is a filled card; `inline` is a
   * quiet left rule with no fill, and its actions are all text buttons.
   */
  appearance?: NudgeAppearance;
  /** Shows a "Not now" action that hides the nudge without remembering a dismissal. */
  onSnooze?: () => void;
  /** Label of the snooze action. Defaults to "Not now". */
  snoozeLabel?: string;
  /** Called once each time the nudge is shown — track impressions here. */
  onImpression?: () => void;
  /**
   * Stable id. With an id, dismissals and uses are remembered (see
   * `persist`) and only one nudge with an id is shown per browser session.
   */
  nudgeId?: string;
  /** Where to remember dismissals and uses of `nudgeId`. Defaults to "local". */
  persist?: NudgePersist;
  /** Badge text on the highlight pulse. Defaults to "New". */
  badge?: React.ReactNode;
  /** Extra actions, typically {@link NudgeAction}s. */
  actions?: React.ReactNode;
}

const KEY = "nucleux:nudge:";
const SESSION_KEY = "nucleux:nudge:session";

function store(kind: "session" | "local"): Storage | null {
  try {
    return typeof window === "undefined"
      ? null
      : kind === "session"
        ? window.sessionStorage
        : window.localStorage;
  } catch {
    return null;
  }
}
function read(kind: "session" | "local", key: string) {
  try {
    return store(kind)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}
function write(kind: "session" | "local", key: string, value: string) {
  try {
    store(kind)?.setItem(key, value);
  } catch {
    /* storage unavailable: memory is best effort */
  }
}

const tooltipSide: Record<NudgeSide, { box: string; arrow: string }> = {
  right: {
    box: "left-full top-0 ml-3",
    arrow:
      "-left-1.5 top-[18px] border-y-[6px] border-r-[6px] border-y-transparent border-r-foreground",
  },
  left: {
    box: "right-full top-0 mr-3",
    arrow:
      "-right-1.5 top-[18px] border-y-[6px] border-l-[6px] border-y-transparent border-l-foreground",
  },
  top: {
    box: "bottom-full left-1/2 mb-3 -translate-x-1/2",
    arrow: "-bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-foreground",
  },
  bottom: {
    box: "top-full left-1/2 mt-3 -translate-x-1/2",
    arrow: "-top-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-foreground",
  },
};

/**
 * A tiny, non-blocking hint that surfaces a capability the person hasn't
 * found yet, at the moment it would help. Mount it when a real signal fires
 * (three text-only sends, idle, a related action); it says what they can do,
 * optionally why it appeared ("Why this tip?"), and offers Try it, Not now and
 * a dismiss button (Escape works too). As an inline tip card it sits in the
 * layout; as a tooltip nudge it points at the control passed as `children`
 * and closes on an outside click; as a highlight pulse it rings that control
 * until it is used. With a `nudgeId` it is capped at one per session and a
 * dismissal or use is remembered, so it never nags.
 */
export const Nudge = React.forwardRef<HTMLDivElement, NudgeProps>(
  (
    {
      variant = "inline-tip-card",
      message,
      title,
      reason,
      children,
      side = "right",
      open: openProp,
      defaultOpen = true,
      onOpenChange,
      onTry,
      tryLabel = "Try it",
      onDismiss,
      dismissLabel = "Dismiss tip",
      dismissible = true,
      appearance = "card",
      onSnooze,
      snoozeLabel = "Not now",
      onImpression,
      nudgeId,
      persist = "local",
      badge = "New",
      actions,
      className,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const baseId = React.useId();
    const messageId = `${baseId}-message`;
    const reasonId = `${baseId}-reason`;
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
    const open = openProp ?? internalOpen;
    const remembering = nudgeId != null && persist !== "none";
    // With an id, stay hidden until storage has been checked (avoids a flash on reload).
    const [allowed, setAllowed] = React.useState(!remembering);
    const [whyOpen, setWhyOpen] = React.useState(false);
    const rootRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

    React.useEffect(() => {
      if (!remembering) {
        setAllowed(true);
        return;
      }
      const remembered = read(persist as "session" | "local", KEY + nudgeId);
      const shownThisSession = read("session", SESSION_KEY);
      setAllowed(!remembered && (!shownThisSession || shownThisSession === nudgeId));
    }, [remembering, persist, nudgeId]);

    const visible = open && allowed;

    const impressed = React.useRef(false);
    React.useEffect(() => {
      if (!visible) {
        impressed.current = false;
        return;
      }
      if (impressed.current) return;
      impressed.current = true;
      if (nudgeId != null) write("session", SESSION_KEY, nudgeId);
      onImpression?.();
    }, [visible, nudgeId, onImpression]);

    const setOpen = (next: boolean) => {
      if (openProp === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    };
    const remember = (what: "dismissed" | "used") => {
      if (remembering) write(persist as "session" | "local", KEY + nudgeId, what);
    };
    const dismiss = () => {
      remember("dismissed");
      setOpen(false);
      onDismiss?.();
    };
    const tryIt = () => {
      remember("used");
      setOpen(false);
      onTry?.();
    };
    const snooze = () => {
      setOpen(false);
      onSnooze?.();
    };

    // The tooltip nudge closes on a click outside it and its anchor.
    React.useEffect(() => {
      if (!visible || variant !== "tooltip-nudge") return;
      const onDown = (e: MouseEvent) => {
        if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
      };
      document.addEventListener("mousedown", onDown);
      return () => document.removeEventListener("mousedown", onDown);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, variant]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (visible && e.key === "Escape" && variant !== "highlight-pulse") {
        e.stopPropagation();
        dismiss();
      }
    };

    // Point the anchor control at the message so its tip is announced with it.
    const anchor =
      visible && React.isValidElement<{ "aria-describedby"?: string }>(children)
        ? React.cloneElement(children, {
            "aria-describedby": [children.props["aria-describedby"], messageId]
              .filter(Boolean)
              .join(" "),
          })
        : children;

    const inverted = variant === "tooltip-nudge";
    const quiet = variant === "inline-tip-card" && appearance === "inline";
    const actionRow = (onTry || onSnooze || reason || actions) && (
      <div className="flex flex-wrap items-center gap-1">
        {onTry && (
          <NudgeAction
            variant={quiet ? "ghost" : inverted ? "secondary" : "primary"}
            className={inverted ? "border-transparent" : undefined}
            onClick={tryIt}
          >
            {tryLabel}
          </NudgeAction>
        )}
        {onSnooze && <NudgeAction onClick={snooze}>{snoozeLabel}</NudgeAction>}
        {actions}
        {reason && (
          <NudgeAction
            aria-expanded={whyOpen}
            aria-controls={reasonId}
            onClick={() => setWhyOpen((w) => !w)}
            leftIcon={
              quiet ? (
                whyOpen ? (
                  <ChevronDown aria-hidden="true" />
                ) : (
                  <ChevronRight aria-hidden="true" />
                )
              ) : undefined
            }
          >
            Why this tip?
          </NudgeAction>
        )}
      </div>
    );
    const reasonNode = reason && whyOpen && (
      <p
        id={reasonId}
        className={cn("text-xs", inverted ? "text-background/80" : "text-muted-foreground")}
      >
        {reason}
      </p>
    );
    const dismissButton = dismissible && (
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={dismissLabel}
        onClick={dismiss}
        className={cn(
          "size-6 shrink-0 [&_svg]:size-3.5",
          inverted && "text-background hover:bg-background/15",
        )}
      >
        <X aria-hidden="true" />
      </Button>
    );

    if (variant === "highlight-pulse") {
      return (
        <div
          ref={rootRef}
          className={cn("relative inline-flex items-center gap-2", className)}
          onClickCapture={() => {
            if (visible) {
              remember("used");
              setOpen(false);
            }
          }}
          {...props}
        >
          <span className="relative inline-flex rounded-lg">
            {anchor}
            {visible && (
              <>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-1 rounded-[inherit] ring-2 ring-brand/60"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-1 animate-ping rounded-[inherit] ring-2 ring-brand/40 [animation-duration:2.4s] motion-reduce:hidden motion-reduce:animate-none"
                />
              </>
            )}
          </span>
          {visible && (
            <>
              <Badge className="bg-brand-muted text-brand">{badge}</Badge>
              <span id={messageId} className="sr-only">
                {message}
              </span>
            </>
          )}
        </div>
      );
    }

    if (variant === "tooltip-nudge") {
      const pos = tooltipSide[side];
      return (
        <NudgeContext.Provider value={{ inverted: true }}>
          <div
            ref={rootRef}
            className={cn("relative inline-flex", className)}
            onKeyDown={handleKeyDown}
            {...props}
          >
            {anchor}
            <div aria-live="polite" className={cn("absolute z-50 w-[260px]", pos.box)}>
              {visible && (
                <div
                  role="note"
                  aria-label="Tip"
                  className="relative flex animate-nx-fade-in flex-col gap-2 rounded-[10px] bg-foreground px-3.5 py-2.5 text-xs leading-[17px] text-background shadow-[0_4px_8px_rgba(12,12,10,0.05),0_8px_24px_rgba(12,12,10,0.06)] motion-reduce:animate-none"
                >
                  <div className="flex items-start gap-2">
                    <p id={messageId} className="min-w-0 flex-1">
                      <span className="text-background/70">Tip</span> · {message}
                    </p>
                    {dismissButton}
                  </div>
                  {actionRow}
                  {reasonNode}
                  <span aria-hidden="true" className={cn("absolute size-0", pos.arrow)} />
                </div>
              )}
            </div>
          </div>
        </NudgeContext.Provider>
      );
    }

    if (!visible) return null;
    return (
      <NudgeContext.Provider value={{ inverted: false }}>
        <div
          ref={rootRef}
          role="note"
          aria-label="Tip"
          onKeyDown={handleKeyDown}
          data-appearance={appearance}
          className={cn(
            "flex animate-nx-fade-in items-start gap-3 text-sm motion-reduce:animate-none",
            quiet
              ? "border-l-[3px] border-border py-1 pl-3 pr-2"
              : "rounded-lg border border-brand/30 bg-brand-muted/60 p-3",
            className,
          )}
          {...props}
        >
          <span
            aria-hidden="true"
            className={cn(
              "grid shrink-0 place-items-center",
              quiet
                ? "mt-0.5 text-muted-foreground [&_svg]:size-4"
                : "size-6 rounded-md bg-brand text-brand-foreground [&_svg]:size-3.5",
            )}
          >
            {title ? <Sparkles /> : <Lightbulb />}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex flex-col gap-0.5">
              {title && <p className="font-semibold text-foreground">{title}</p>}
              <p id={messageId} className={quiet ? "text-foreground" : "text-muted-foreground"}>
                {message}
              </p>
            </div>
            {actionRow}
            {reasonNode}
          </div>
          {dismissButton}
        </div>
      </NudgeContext.Provider>
    );
  },
);
Nudge.displayName = "Nudge";

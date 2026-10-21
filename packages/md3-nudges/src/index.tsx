import * as React from "react";
import { Lightbulb, Sparkles, X } from "lucide-react";
import { cn, Slot } from "@nucleux/utils";
import type { ButtonSize, ButtonVariant } from "@nucleux/button";
import type { NudgeActionProps, NudgePersist, NudgeProps, NudgeSide, NudgeVariant } from "@nucleux/nudges";
import { Md3Badge } from "@nucleux/md3-badge";
import { Md3IconButton } from "@nucleux/md3-icon-button";

/** Props of {@link Md3Nudge} — identical to `NudgeProps` from `@nucleux/nudges`. */
export type Md3NudgeProps = NudgeProps;
/** Props of {@link Md3NudgeAction} — identical to `NudgeActionProps` (the shadcn `ButtonProps`). */
export type Md3NudgeActionProps = NudgeActionProps;
/** "tooltip-nudge", "inline-tip-card" or "highlight-pulse". */
export type Md3NudgeVariant = NudgeVariant;
/** "top", "right", "bottom" or "left". */
export type Md3NudgeSide = NudgeSide;
/** "none", "session" or "local". */
export type Md3NudgePersist = NudgePersist;

/** Where the action sits: on a neutral card (`surface`) or on the anchored primary-container bubble. */
const NudgeContext = React.createContext<{ onContainer: boolean }>({ onContainer: false });

const stateLayer =
  "before:absolute before:inset-0 before:bg-current before:opacity-0 before:transition-opacity before:content-[''] hover:before:opacity-[0.08] focus-visible:before:opacity-[0.10] active:before:opacity-[0.10] motion-reduce:before:transition-none";

// The shadcn variants mapped onto M3 button roles: filled, tonal, text, error.
const actionVariants = (onContainer: boolean): Record<ButtonVariant, string> => ({
  primary: "bg-md-primary text-md-on-primary hover:shadow-md-1",
  cta: "bg-md-primary text-md-on-primary hover:shadow-md-1",
  secondary: "bg-md-secondary-container text-md-on-secondary-container",
  ghost: onContainer ? "bg-transparent text-md-on-primary-container" : "bg-transparent text-md-primary",
  destructive: "bg-md-error text-md-on-error",
  link: cn("h-auto bg-transparent px-0 underline underline-offset-2 before:hidden", onContainer ? "text-md-on-primary-container" : "text-md-primary"),
});
const actionSizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "size-10",
  "icon-sm": "size-8",
  "icon-lg": "size-12",
};

/**
 * An action inside a Material 3 nudge ("Try it", "Not now") — the same API
 * as `NudgeAction` (the shadcn `ButtonProps`, so `variant`, `size`, `asChild`
 * and `leftIcon`/`rightIcon` all work), drawn as an M3 small button: a
 * full-corner capsule with an on-colour state layer. `primary` is filled,
 * `secondary` tonal, `ghost` a text button that takes on-primary-container on
 * the anchored bubble.
 */
export const Md3NudgeAction = React.forwardRef<HTMLButtonElement, Md3NudgeActionProps>(
  (
    { color, variant = color ?? "ghost", size = "sm", asChild = false, leftIcon, rightIcon, type = "button", className, children, ...props },
    ref,
  ) => {
    const { onContainer } = React.useContext(NudgeContext);
    const classes = cn(
      "relative inline-flex select-none items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap rounded-full font-medium tracking-[0.1px] transition-shadow [&_svg]:size-4 [&_svg]:shrink-0",
      stateLayer,
      "outline-none focus-visible:ring-2 focus-visible:ring-md-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-md-surface",
      "disabled:pointer-events-none disabled:opacity-[0.38] disabled:shadow-none",
      actionSizes[size],
      actionVariants(onContainer)[variant],
      className,
    );
    if (asChild) {
      return (
        <Slot ref={ref} className={classes} {...(props as React.HTMLAttributes<HTMLElement>)}>
          {children}
        </Slot>
      );
    }
    return (
      <button ref={ref} type={type} className={classes} {...props}>
        {leftIcon && <span className="relative inline-flex">{leftIcon}</span>}
        {children != null && <span className="relative">{children}</span>}
        {rightIcon && <span className="relative inline-flex">{rightIcon}</span>}
      </button>
    );
  },
);
Md3NudgeAction.displayName = "Md3NudgeAction";

// Copied from @nucleux/nudges (internal there) — the same storage keys, so a tip
// dismissed in one family stays dismissed in the other.
const KEY = "nucleux:nudge:";
const SESSION_KEY = "nucleux:nudge:session";

function store(kind: "session" | "local"): Storage | null {
  try {
    return typeof window === "undefined" ? null : kind === "session" ? window.sessionStorage : window.localStorage;
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
  right: { box: "left-full top-1/2 ml-3 -translate-y-1/2", arrow: "-left-1.5 top-1/2 -translate-y-1/2" },
  left: { box: "right-full top-1/2 mr-3 -translate-y-1/2", arrow: "-right-1.5 top-1/2 -translate-y-1/2" },
  top: { box: "bottom-full left-1/2 mb-3 -translate-x-1/2", arrow: "-bottom-1.5 left-1/2 -translate-x-1/2" },
  bottom: { box: "top-full left-1/2 mt-3 -translate-x-1/2", arrow: "-top-1.5 left-1/2 -translate-x-1/2" },
};

/**
 * The Material 3 nudge — the same API and behaviour as `Nudge`: a small,
 * non-blocking tip about a capability, mounted when a real signal fires, with
 * "Why this tip?", Try it, Not now and a dismiss icon button (Escape works
 * too). The inline tip card is a filled M3 card that never rises above the
 * work; the tooltip nudge is an anchored primary-container bubble at level 2
 * with a tail pointing at `children`, closing on an outside click; the
 * highlight pulse rings the control in primary with a "New" badge until it is
 * used (the ring stops pulsing under reduced motion). With a `nudgeId` it is
 * capped at one per session and a dismissal or use is remembered.
 */
export const Md3Nudge = React.forwardRef<HTMLDivElement, Md3NudgeProps>(
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
            "aria-describedby": [children.props["aria-describedby"], messageId].filter(Boolean).join(" "),
          })
        : children;

    const onContainer = variant === "tooltip-nudge";
    const actionRow = (onTry || onSnooze || reason || actions) && (
      <div className="flex flex-wrap items-center gap-1">
        {onTry && (
          <Md3NudgeAction variant="primary" onClick={tryIt}>
            {tryLabel}
          </Md3NudgeAction>
        )}
        {onSnooze && <Md3NudgeAction onClick={snooze}>{snoozeLabel}</Md3NudgeAction>}
        {actions}
        {reason && (
          <Md3NudgeAction aria-expanded={whyOpen} aria-controls={reasonId} onClick={() => setWhyOpen((w) => !w)}>
            Why this tip?
          </Md3NudgeAction>
        )}
      </div>
    );
    const reasonNode = reason && whyOpen && (
      <p
        id={reasonId}
        className={cn(
          "text-xs tracking-[0.4px] animate-nx-fade-in motion-reduce:animate-none",
          onContainer ? "text-md-on-primary-container/80" : "text-md-on-surface-variant",
        )}
      >
        {reason}
      </p>
    );
    const dismissButton = (
      <Md3IconButton
        aria-label={dismissLabel}
        onClick={dismiss}
        className={cn("-mr-1 -mt-1 size-8 shrink-0 [&_svg]:size-[18px]", onContainer && "text-md-on-primary-container")}
      >
        <X aria-hidden="true" />
      </Md3IconButton>
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
          <span className="relative inline-flex rounded-full">
            {anchor}
            {visible && (
              <>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-1 rounded-[inherit] ring-2 ring-md-primary"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-1 animate-ping rounded-[inherit] ring-2 ring-md-primary/40 [animation-duration:2.4s] motion-reduce:hidden motion-reduce:animate-none"
                />
              </>
            )}
          </span>
          {visible && (
            <>
              <Md3Badge
                content={badge}
                className="h-5 bg-md-primary-container px-2 text-[11px] tracking-[0.5px] text-md-on-primary-container"
              />
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
        <NudgeContext.Provider value={{ onContainer: true }}>
          <div ref={rootRef} className={cn("relative inline-flex", className)} onKeyDown={handleKeyDown} {...props}>
            {anchor}
            <div aria-live="polite" className={cn("absolute z-50 w-72", pos.box)}>
              {visible && (
                <div
                  role="note"
                  aria-label="Tip"
                  className="relative flex flex-col gap-3 rounded-md-lg bg-md-primary-container px-4 pb-3 pt-3.5 text-sm text-md-on-primary-container shadow-md-2 animate-nx-fade-in motion-reduce:animate-none"
                >
                  <div className="flex items-start gap-2.5">
                    <Lightbulb aria-hidden="true" className="mt-0.5 size-[18px] shrink-0 text-md-primary" />
                    <p id={messageId} className="min-w-0 flex-1 tracking-[0.25px]">
                      <span className="font-medium">Tip · </span>
                      {message}
                    </p>
                    {dismissButton}
                  </div>
                  {actionRow}
                  {reasonNode}
                  <span aria-hidden="true" className={cn("absolute size-3 rotate-45 bg-md-primary-container", pos.arrow)} />
                </div>
              )}
            </div>
          </div>
        </NudgeContext.Provider>
      );
    }

    if (!visible) return null;
    return (
      <NudgeContext.Provider value={{ onContainer: false }}>
        <div
          ref={rootRef}
          role="note"
          aria-label="Tip"
          onKeyDown={handleKeyDown}
          className={cn(
            "flex items-start gap-3 rounded-md-md bg-md-surface-container-high p-4 text-sm text-md-on-surface animate-nx-fade-in motion-reduce:animate-none",
            className,
          )}
          {...props}
        >
          <span aria-hidden="true" className="mt-0.5 flex shrink-0 text-md-primary [&_svg]:size-5">
            {title ? <Sparkles /> : <Lightbulb />}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-col gap-1">
              {title && <p className="text-base font-medium leading-6 tracking-[0.15px] text-md-on-surface">{title}</p>}
              <p id={messageId} className="tracking-[0.25px] text-md-on-surface-variant">
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
Md3Nudge.displayName = "Md3Nudge";

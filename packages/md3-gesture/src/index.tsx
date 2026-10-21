import * as React from "react";
import { cn } from "@nucleux/utils";
import { Md3Button } from "@nucleux/md3-button";
import { Md3Chip } from "@nucleux/md3-chip";
import { Md3IconButton } from "@nucleux/md3-icon-button";
import {
  recognizeSimpleGesture,
  type GestureInputAction,
  type GestureInputBounds,
  type GestureInputBuiltInGesture,
  type GestureInputEvent,
  type GestureInputGesture,
  type GestureInputPoint,
  type GestureInputProps,
  type GestureInputSource,
  type GestureInputVariant,
} from "@nucleux/gesture";
import { Check, Undo2, X } from "lucide-react";

// Same API as the shadcn twin: the props and data shapes are the twin's own types.
export type Md3GestureInputProps = GestureInputProps;
export type {
  GestureInputVariant as Md3GestureInputVariant,
  GestureInputBuiltInGesture as Md3GestureInputBuiltInGesture,
  GestureInputGesture as Md3GestureInputGesture,
  GestureInputSource as Md3GestureInputSource,
  GestureInputRecognizer as Md3GestureInputRecognizer,
  GestureInputPoint,
  GestureInputBounds,
  GestureInputAction,
  GestureInputEvent,
  GestureInputRecognizeRequest,
} from "@nucleux/gesture";
/** The built-in geometric recogniser — shared with `@nucleux/gesture`. */
export { recognizeSimpleGesture };

// The tables and geometry below are copied from @nucleux/gesture, where they are
// internal, so key equivalents and announcements read identically in both families.
const DEFAULT_KEYS: Record<GestureInputBuiltInGesture, string> = {
  "swipe-left": "ArrowLeft",
  "swipe-right": "ArrowRight",
  "swipe-up": "ArrowUp",
  "swipe-down": "ArrowDown",
  circle: "Enter",
  "pinch-out": "+",
  "pinch-in": "-",
};

const KEY_GLYPHS: Record<string, string> = {
  ArrowLeft: "←",
  ArrowRight: "→",
  ArrowUp: "↑",
  ArrowDown: "↓",
  Enter: "Enter",
  " ": "Space",
};

const GESTURE_NAMES: Record<string, string> = {
  "swipe-left": "Swiped left",
  "swipe-right": "Swiped right",
  "swipe-up": "Swiped up",
  "swipe-down": "Swiped down",
  circle: "Circled",
  "pinch-in": "Pinched in",
  "pinch-out": "Zoomed in",
};

const DEFAULT_HINTS: Record<GestureInputVariant, string> = {
  "circle-to-select": "Draw a circle around content to select it",
  "swipe-action": "Swipe the card left or right to act on it",
  "pinch-context": "Pinch to zoom into a region, then ask about it",
};

const DEFAULT_LABELS: Record<GestureInputVariant, string> = {
  "circle-to-select": "Gesture area — draw a circle to select",
  "swipe-action": "Gesture area — swipe to act",
  "pinch-context": "Gesture area — pinch to zoom",
};

const keyFor = (action: GestureInputAction) =>
  action.key ?? DEFAULT_KEYS[action.gesture as GestureInputBuiltInGesture];

const keyMatches = (key: string | undefined, e: React.KeyboardEvent) =>
  !!key && (e.key === key || (key === "+" && e.key === "=") || (key.length === 1 && e.key.toLowerCase() === key.toLowerCase()));

const dist = (a: GestureInputPoint, b: GestureInputPoint) => Math.hypot(a.x - b.x, a.y - b.y);

function boundsOf(points: GestureInputPoint[]): GestureInputBounds {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

type Feedback =
  | { kind: "pending"; event: GestureInputEvent }
  | { kind: "done"; event: GestureInputEvent }
  | { kind: "missed" }
  | null;

/** A keyboard hint drawn with MD3 tokens (there is no MD3 kbd primitive). */
function KeyHint({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      aria-hidden="true"
      className="relative ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-md-xs bg-md-surface-container-high px-1 font-sans text-[11px] font-medium text-md-on-surface-variant"
    >
      {children}
    </kbd>
  );
}

/**
 * Material 3 gesture input: turns swipes, circles and pinches on a target
 * region into AI actions using pointer events. Each gesture maps to one action;
 * recognition is the app's `recognize` callback or the shared geometric
 * `recognizeSimpleGesture`. The mark draws in the primary colour as you draw,
 * what was captured gets a primary boundary and a named label, is announced,
 * and waits in an MD3 bar for Confirm or Dismiss (or fires and offers Undo with
 * `confirm={false}`). Every gesture has a keyboard equivalent on the focused
 * target and an assist chip, so nothing is pointer-only; motion stops under
 * reduced motion. Shares its API with `GestureInput` from `@nucleux/gesture`.
 * Variants: circle-to-select, swipe-action, pinch-context.
 */
export const Md3GestureInput = React.forwardRef<HTMLDivElement, Md3GestureInputProps>(
  (
    {
      variant = "swipe-action",
      actions,
      recognize,
      onGesture,
      confirm = true,
      onUndo,
      onDismiss,
      label,
      hint,
      threshold = 40,
      showActions = true,
      contentClassName,
      disabled = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const targetRef = React.useRef<HTMLDivElement>(null);
    const confirmRef = React.useRef<HTMLButtonElement>(null);
    const pointers = React.useRef(new Map<number, GestureInputPoint[]>());
    const active = React.useRef(new Set<number>());
    const captured = React.useRef(false);
    const pinchStart = React.useRef<{ distance: number; scale: number } | null>(null);
    const [livePath, setLivePath] = React.useState<GestureInputPoint[] | null>(null);
    const [offsetX, setOffsetX] = React.useState(0);
    const [scale, setScale] = React.useState(1);
    const [origin, setOrigin] = React.useState<{ x: number; y: number } | null>(null);
    const [feedback, setFeedback] = React.useState<Feedback>(null);
    const [announcement, setAnnouncement] = React.useState("");
    const hintId = React.useId();
    const scaleRef = React.useRef(scale);
    scaleRef.current = scale;

    const pointFrom = (e: { clientX: number; clientY: number; timeStamp: number }): GestureInputPoint => {
      const rect = targetRef.current?.getBoundingClientRect();
      return { x: (e.clientX ?? 0) - (rect?.left ?? 0), y: (e.clientY ?? 0) - (rect?.top ?? 0), t: e.timeStamp };
    };

    const actionFor = (gesture: GestureInputGesture | null) =>
      gesture ? actions.find((a) => a.gesture === gesture) : undefined;

    const describe = (event: GestureInputEvent) =>
      `${GESTURE_NAMES[event.gesture] ?? event.gesture} · ${event.action.label}`;

    const capture = (event: GestureInputEvent, focusConfirm: boolean) => {
      if (confirm) {
        setFeedback({ kind: "pending", event });
        setAnnouncement(`${describe(event)}. Press Enter to confirm or Escape to dismiss.`);
        if (focusConfirm) requestAnimationFrame(() => confirmRef.current?.focus());
      } else {
        onGesture?.(event);
        setFeedback({ kind: "done", event });
        setAnnouncement(`${describe(event)}. Undo is available.`);
      }
    };

    const runAction = (action: GestureInputAction, source: GestureInputSource, focusConfirm = false) => {
      if (disabled) return;
      const rect = targetRef.current?.getBoundingClientRect();
      let bounds: GestureInputBounds | null = null;
      let nextScale: number | undefined;
      if (action.gesture === "circle" && rect) bounds = { x: 0, y: 0, width: rect.width, height: rect.height };
      if (action.gesture === "pinch-out" || action.gesture === "pinch-in") {
        nextScale = Math.min(4, Math.max(1, scaleRef.current * (action.gesture === "pinch-out" ? 1.5 : 1 / 1.5)));
        if (variant === "pinch-context") setScale(nextScale);
      }
      capture({ gesture: action.gesture, action, bounds, strokes: [], scale: nextScale, source }, focusConfirm);
    };

    const confirmPending = () => {
      if (feedback?.kind !== "pending") return;
      onGesture?.(feedback.event);
      setAnnouncement(`${feedback.event.action.label}: confirmed.`);
      setFeedback(null);
      targetRef.current?.focus();
    };

    const dismiss = () => {
      if (!feedback || feedback.kind === "missed") {
        setFeedback(null);
        return;
      }
      onDismiss?.(feedback.event);
      setFeedback(null);
      setAnnouncement("Dismissed.");
      targetRef.current?.focus();
    };

    const undo = () => {
      if (feedback?.kind !== "done") return;
      onUndo?.(feedback.event);
      setFeedback(null);
      setAnnouncement(`${feedback.event.action.label}: undone.`);
      targetRef.current?.focus();
    };

    // ---- pointer -----------------------------------------------------------
    const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled || (e.pointerType === "mouse" && e.button !== 0)) return;
      if (active.current.size === 0) pointers.current.clear();
      pointers.current.set(e.pointerId, [pointFrom(e)]);
      active.current.add(e.pointerId);
      if (active.current.size === 2) {
        const [a, b] = Array.from(active.current).map((id) => pointers.current.get(id)!);
        pinchStart.current = { distance: dist(a[a.length - 1], b[b.length - 1]), scale: scaleRef.current };
      }
    };

    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      const path = pointers.current.get(e.pointerId);
      if (!path || !active.current.has(e.pointerId)) return;
      const p = pointFrom(e);
      path.push(p);
      // Capture only once it is clearly a gesture, so taps still reach children.
      if (!captured.current && dist(path[0], p) > 8) {
        captured.current = true;
        e.currentTarget.setPointerCapture?.(e.pointerId);
      }
      if (!captured.current) return;
      const all = Array.from(active.current).map((id) => pointers.current.get(id)!);
      if (all.length >= 2) {
        const [a, b] = all;
        const start = pinchStart.current;
        if (variant === "pinch-context" && start && start.distance > 0) {
          const d = dist(a[a.length - 1], b[b.length - 1]);
          setScale(Math.min(4, Math.max(1, start.scale * (d / start.distance))));
          setOrigin({ x: (a[0].x + b[0].x) / 2, y: (a[0].y + b[0].y) / 2 });
        }
        return;
      }
      if (variant === "swipe-action") setOffsetX(Math.max(-120, Math.min(120, p.x - path[0].x)));
      else setLivePath([...path]);
    };

    const finish = async (e: React.PointerEvent<HTMLDivElement>) => {
      const path = pointers.current.get(e.pointerId);
      if (!path || !active.current.has(e.pointerId)) return;
      path.push(pointFrom(e));
      active.current.delete(e.pointerId);
      if (active.current.size > 0) return; // wait for the last pointer to lift
      const strokes = Array.from(pointers.current.values());
      pointers.current.clear();
      pinchStart.current = null;
      const wasGesture = captured.current;
      captured.current = false;
      setOffsetX(0);
      setLivePath(null);
      if (!wasGesture) return; // a tap — leave it to the content
      const rect = targetRef.current?.getBoundingClientRect();
      const request = { strokes, width: rect?.width ?? 0, height: rect?.height ?? 0 };
      const gesture = await (recognize ?? ((r) => recognizeSimpleGesture(r, threshold)))(request);
      const action = actionFor(gesture);
      if (!action || !gesture) {
        setFeedback({ kind: "missed" });
        setAnnouncement("Gesture not recognised. Try again, or use the buttons below.");
        return;
      }
      const isPinch = gesture === "pinch-in" || gesture === "pinch-out";
      const bounds = gesture === "circle" || isPinch ? boundsOf(strokes.flat()) : null;
      capture(
        { gesture, action, bounds, strokes, scale: isPinch ? scaleRef.current : undefined, source: "pointer" },
        false,
      );
    };

    const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
      void finish(e);
    };

    const onPointerCancel = () => {
      pointers.current.clear();
      active.current.clear();
      captured.current = false;
      setOffsetX(0);
      setLivePath(null);
    };

    // ---- keyboard ----------------------------------------------------------
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget && !disabled) {
        if (feedback?.kind === "pending" && e.key === "Enter") {
          e.preventDefault();
          confirmPending();
        } else if (feedback && e.key === "Escape") {
          e.preventDefault();
          dismiss();
        } else {
          const action = actions.find((a) => keyMatches(keyFor(a), e));
          if (action) {
            e.preventDefault();
            runAction(action, "keyboard");
          }
        }
      }
    };

    const pending = feedback && feedback.kind !== "missed" ? feedback.event : null;
    const keyHint = actions
      .map((a) => {
        const k = keyFor(a);
        return k ? `${KEY_GLYPHS[k] ?? k} ${a.label}` : null;
      })
      .filter(Boolean)
      .join(", ");

    const swipeTarget =
      variant === "swipe-action" && offsetX !== 0
        ? actions.find((a) => a.gesture === (offsetX < 0 ? "swipe-left" : "swipe-right"))
        : undefined;

    return (
      <div ref={ref} className={cn("flex flex-col gap-2 text-md-on-surface", className)} data-variant={variant} {...props}>
        <div
          ref={targetRef}
          role="group"
          aria-roledescription="gesture area"
          aria-label={label ?? DEFAULT_LABELS[variant]}
          aria-describedby={hintId}
          aria-disabled={disabled || undefined}
          tabIndex={disabled ? -1 : 0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onKeyDown={handleKeyDown}
          data-state={feedback?.kind ?? "idle"}
          className={cn(
            "relative select-none overflow-hidden rounded-md-lg outline-none",
            "focus-visible:ring-2 focus-visible:ring-md-primary focus-visible:ring-offset-2 focus-visible:ring-offset-md-surface",
            variant === "swipe-action" ? "touch-pan-y" : "touch-none",
            pending && variant === "swipe-action" && "ring-2 ring-md-primary",
            disabled && "opacity-[0.38]",
          )}
        >
          {swipeTarget && (
            <span
              aria-hidden="true"
              className={cn(
                "absolute inset-y-0 flex items-center bg-md-primary-container px-4 text-sm font-medium text-md-on-primary-container",
                offsetX < 0 ? "right-0" : "left-0",
              )}
            >
              {swipeTarget.label}
            </span>
          )}
          <div
            className={cn(
              "relative",
              // Spring back on the M3 emphasized curve.
              offsetX === 0 &&
                "transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none",
              contentClassName,
            )}
            style={{
              transform:
                variant === "swipe-action"
                  ? offsetX
                    ? `translateX(${offsetX}px)`
                    : undefined
                  : variant === "pinch-context" && scale !== 1
                    ? `scale(${scale})`
                    : undefined,
              transformOrigin: origin ? `${origin.x}px ${origin.y}px` : undefined,
            }}
          >
            {children}
          </div>

          {/* The mark, one-to-one, in the primary colour while drawing */}
          {livePath && livePath.length > 1 && (
            <svg aria-hidden="true" className="pointer-events-none absolute inset-0 size-full">
              <polyline
                points={livePath.map((p) => `${p.x},${p.y}`).join(" ")}
                className="fill-none stroke-md-primary"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}

          {/* The boundary settles onto what was captured */}
          {pending?.bounds && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute rounded-md-sm border-2 border-md-primary bg-md-primary/10 animate-nx-fade-in motion-reduce:animate-none"
              style={{
                left: pending.bounds.x,
                top: pending.bounds.y,
                width: pending.bounds.width,
                height: pending.bounds.height,
              }}
            />
          )}
          {pending && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-2 top-2 max-w-[calc(100%-1rem)] truncate rounded-md-sm bg-md-primary px-2.5 py-1 text-xs font-medium tracking-[0.1px] text-md-on-primary shadow-md-1"
            >
              {describe(pending)}
            </span>
          )}
        </div>

        <p id={hintId} className="text-xs text-md-on-surface-variant">
          {hint ?? DEFAULT_HINTS[variant]}
          {keyHint && <span className="sr-only">. Keyboard: {keyHint}.</span>}
        </p>

        {feedback && (
          <div
            className="flex flex-wrap items-center gap-2 rounded-md-lg border border-md-outline-variant bg-md-surface-container-low py-2 pl-4 pr-2 text-sm animate-nx-fade-in motion-reduce:animate-none"
            data-slot="gesture-feedback"
          >
            <span className="flex-1 text-md-on-surface">
              {feedback.kind === "missed"
                ? "Gesture not recognised — try again, or use a button below."
                : describe(feedback.event)}
            </span>
            {feedback.kind === "pending" && (
              <Md3Button ref={confirmRef} variant="filled" icon={<Check aria-hidden="true" />} onClick={confirmPending}>
                {feedback.event.action.label}
              </Md3Button>
            )}
            {feedback.kind === "done" && onUndo && (
              <Md3Button variant="tonal" icon={<Undo2 aria-hidden="true" />} onClick={undo}>
                Undo
              </Md3Button>
            )}
            <Md3IconButton aria-label={feedback.kind === "done" ? "Close" : "Dismiss"} onClick={dismiss}>
              <X aria-hidden="true" />
            </Md3IconButton>
          </div>
        )}

        {showActions && actions.length > 0 && (
          <div role="group" aria-label="Gesture actions" className="flex flex-wrap items-center gap-2">
            {actions.map((action) => {
              const k = keyFor(action);
              return (
                <Md3Chip
                  key={action.gesture}
                  variant="assist"
                  disabled={disabled}
                  aria-keyshortcuts={k && /^[A-Za-z0-9]|^Arrow|^Enter$/.test(k) ? k : undefined}
                  onClick={() => runAction(action, "keyboard", true)}
                >
                  {action.label}
                  {k && <KeyHint>{KEY_GLYPHS[k] ?? k}</KeyHint>}
                </Md3Chip>
              );
            })}
            {variant === "pinch-context" && scale !== 1 && (
              <Md3Button variant="text" onClick={() => setScale(1)}>
                Reset zoom
              </Md3Button>
            )}
          </div>
        )}

        <p role="status" aria-live="polite" className="sr-only">
          {announcement}
        </p>
      </div>
    );
  },
);
Md3GestureInput.displayName = "Md3GestureInput";

import * as React from "react";
import { cn } from "@nucleux/utils";
import { Button } from "@nucleux/button";
import { Kbd } from "@nucleux/kbd";
import { Check, Undo2, X } from "lucide-react";

export type GestureInputVariant = "circle-to-select" | "swipe-action" | "pinch-context";

/** Built-in gesture names. A custom recogniser may return any string that an action maps. */
export type GestureInputBuiltInGesture =
  | "swipe-left"
  | "swipe-right"
  | "swipe-up"
  | "swipe-down"
  | "circle"
  | "pinch-in"
  | "pinch-out";

export type GestureInputGesture = GestureInputBuiltInGesture | (string & {});

export type GestureInputSource = "pointer" | "keyboard";

export interface GestureInputPoint {
  /** CSS pixels from the target's left edge. */
  x: number;
  /** CSS pixels from the target's top edge. */
  y: number;
  /** Event timestamp in ms. */
  t: number;
}

export interface GestureInputBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GestureInputAction {
  /** The gesture that fires this action — one gesture, one action. */
  gesture: GestureInputGesture;
  /** What the action does, e.g. `"Summarise"`. */
  label: string;
  /** Keyboard equivalent (a `KeyboardEvent.key`). Defaults per built-in gesture; required for custom gestures. */
  key?: string;
}

export interface GestureInputEvent {
  gesture: GestureInputGesture;
  action: GestureInputAction;
  /** The area the gesture covered (circle / pinch), or `null`. */
  bounds: GestureInputBounds | null;
  /** Raw pointer paths, one per pointer (empty for keyboard). */
  strokes: GestureInputPoint[][];
  /** Zoom level after a pinch. */
  scale?: number;
  source: GestureInputSource;
}

export interface GestureInputRecognizeRequest {
  /** One path per pointer that took part. */
  strokes: GestureInputPoint[][];
  width: number;
  height: number;
}

/** A recogniser: returns the gesture name, or `null` when nothing was recognised. */
export type GestureInputRecognizer = (
  request: GestureInputRecognizeRequest,
) => GestureInputGesture | null | Promise<GestureInputGesture | null>;

export interface GestureInputProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `"swipe-action"` (default), `"circle-to-select"` or `"pinch-context"` — sets the live feedback and touch behaviour. */
  variant?: GestureInputVariant;
  /** The gestures this target understands, each with its action and keyboard equivalent. */
  actions: GestureInputAction[];
  /** The app's recogniser. Defaults to {@link recognizeSimpleGesture} (direction, closed loop, two-finger pinch). */
  recognize?: GestureInputRecognizer;
  /** Called when a gesture's action is confirmed (or immediately when `confirm` is false). */
  onGesture?: (event: GestureInputEvent) => void;
  /** Wait for the person to confirm a captured gesture. Defaults to `true`; when `false` the feedback offers Undo. */
  confirm?: boolean;
  /** Called when the person undoes an auto-fired gesture (`confirm={false}`). */
  onUndo?: (event: GestureInputEvent) => void;
  /** Called when a captured gesture is dismissed. */
  onDismiss?: (event: GestureInputEvent) => void;
  /** Accessible name of the gesture target. */
  label?: string;
  /** Hint shown under the target (and read as its description). */
  hint?: React.ReactNode;
  /** Minimum travel in px before a movement counts. Defaults to 40. */
  threshold?: number;
  /** Show the action buttons — the visible keyboard/switch equivalent. Defaults to `true`. */
  showActions?: boolean;
  /** Classes for the inner content wrapper that moves/zooms with the gesture. */
  contentClassName?: string;
  disabled?: boolean;
  /** The content the gesture acts on. */
  children?: React.ReactNode;
}

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

/**
 * The built-in, geometry-only recogniser: a two-pointer spread/pinch, a closed
 * loop (circle), or the dominant direction of a single stroke. No model, no
 * network — swap in your own with `recognize`.
 */
export function recognizeSimpleGesture(
  { strokes }: GestureInputRecognizeRequest,
  threshold = 40,
): GestureInputBuiltInGesture | null {
  const paths = strokes.filter((s) => s.length > 0);
  if (paths.length >= 2) {
    const [a, b] = paths;
    const start = dist(a[0], b[0]);
    const end = dist(a[a.length - 1], b[b.length - 1]);
    if (start <= 0 || Math.abs(end - start) < threshold / 2) return null;
    return end > start ? "pinch-out" : "pinch-in";
  }
  const pts = paths[0];
  if (!pts || pts.length < 2) return null;
  const first = pts[0];
  const last = pts[pts.length - 1];
  const box = boundsOf(pts);
  const span = Math.max(box.width, box.height);
  let length = 0;
  for (let i = 1; i < pts.length; i++) length += dist(pts[i - 1], pts[i]);
  const closed = dist(first, last) < Math.max(threshold, span * 0.35);
  if (closed && box.width >= threshold && box.height >= threshold && length > span * 2.2) return "circle";
  const dx = last.x - first.x;
  const dy = last.y - first.y;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) return null;
  if (Math.abs(dx) >= Math.abs(dy)) return dx < 0 ? "swipe-left" : "swipe-right";
  return dy < 0 ? "swipe-up" : "swipe-down";
}

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

type Feedback =
  | { kind: "pending"; event: GestureInputEvent }
  | { kind: "done"; event: GestureInputEvent }
  | { kind: "missed" }
  | null;

/**
 * Gesture input: turns swipes, circles and pinches on a target region into AI
 * actions using pointer events. Each gesture maps to one action; recognition is
 * the app's `recognize` callback or a small built-in geometric recogniser. What
 * was captured is shown as an overlay and announced, then waits for Confirm or
 * Dismiss (or fires and offers Undo with `confirm={false}`). Every gesture has a
 * keyboard equivalent on the focused target and a visible button, so nothing is
 * pointer-only. Variants: circle-to-select, swipe-action, pinch-context.
 */
export const GestureInput = React.forwardRef<HTMLDivElement, GestureInputProps>(
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
      <div ref={ref} className={cn("flex flex-col gap-2", className)} data-variant={variant} {...props}>
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
            "relative select-none overflow-hidden rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            variant === "swipe-action" ? "touch-pan-y" : "touch-none",
            pending && variant === "swipe-action" && "ring-2 ring-brand",
            disabled && "opacity-50",
          )}
        >
          {swipeTarget && (
            <span
              aria-hidden="true"
              className={cn(
                "absolute inset-y-0 flex items-center px-3 text-xs font-semibold text-brand",
                offsetX < 0 ? "right-0" : "left-0",
              )}
            >
              {swipeTarget.label}
            </span>
          )}
          <div
            className={cn(
              "relative",
              offsetX === 0 && "transition-transform duration-200 ease-out motion-reduce:transition-none",
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

          {/* Live path while drawing */}
          {livePath && livePath.length > 1 && (
            <svg aria-hidden="true" className="pointer-events-none absolute inset-0 size-full">
              <polyline
                points={livePath.map((p) => `${p.x},${p.y}`).join(" ")}
                className="fill-none stroke-brand"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}

          {/* What was captured */}
          {pending?.bounds && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute rounded-[50%] border-2 border-dashed border-brand bg-brand/10 animate-nx-fade-in motion-reduce:animate-none"
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
              className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-background px-2 py-0.5 text-xs font-semibold text-foreground shadow-sm"
            >
              {describe(pending)}
            </span>
          )}
        </div>

        <p id={hintId} className="text-xs text-muted-foreground">
          {hint ?? DEFAULT_HINTS[variant]}
          {keyHint && <span className="sr-only">. Keyboard: {keyHint}.</span>}
        </p>

        {feedback && (
          <div
            className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm"
            data-slot="gesture-feedback"
          >
            <span className="flex-1 text-foreground">
              {feedback.kind === "missed"
                ? "Gesture not recognised — try again, or use a button below."
                : describe(feedback.event)}
            </span>
            {feedback.kind === "pending" && (
              <Button
                ref={confirmRef}
                variant="cta"
                size="sm"
                leftIcon={<Check className="size-4" aria-hidden="true" />}
                onClick={confirmPending}
              >
                {feedback.event.action.label}
              </Button>
            )}
            {feedback.kind === "done" && onUndo && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Undo2 className="size-4" aria-hidden="true" />}
                onClick={undo}
              >
                Undo
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={feedback.kind === "done" ? "Close" : "Dismiss"}
              onClick={dismiss}
            >
              <X className="size-4" aria-hidden="true" />
            </Button>
          </div>
        )}

        {showActions && actions.length > 0 && (
          <div role="group" aria-label="Gesture actions" className="flex flex-wrap items-center gap-2">
            {actions.map((action) => {
              const k = keyFor(action);
              return (
                <Button
                  key={action.gesture}
                  variant="secondary"
                  size="sm"
                  disabled={disabled}
                  aria-keyshortcuts={k && /^[A-Za-z0-9]|^Arrow|^Enter$/.test(k) ? k : undefined}
                  onClick={() => runAction(action, "keyboard", true)}
                >
                  {action.label}
                  {k && <Kbd aria-hidden="true">{KEY_GLYPHS[k] ?? k}</Kbd>}
                </Button>
              );
            })}
            {variant === "pinch-context" && scale !== 1 && (
              <Button variant="ghost" size="sm" onClick={() => setScale(1)}>
                Reset zoom
              </Button>
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
GestureInput.displayName = "GestureInput";

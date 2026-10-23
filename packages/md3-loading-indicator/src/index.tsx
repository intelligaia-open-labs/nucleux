import * as React from "react";
import { cn } from "@nucleux/utils";

export type Md3LoadingIndicatorVariant = "default" | "contained";

export interface Md3LoadingIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** "default" draws the shape alone; "contained" adds a round primary-container backdrop. */
  variant?: Md3LoadingIndicatorVariant;
  /** Overall size in px (default 48). The morphing shape takes 38/48 of it, as in the spec. */
  size?: number;
  /** Accessible name announced for the progressbar (default "Loading"). */
  "aria-label"?: string;
}

// ---------------------------------------------------------------------------
// Shapes. Each one is a polar radius function sampled at the same number of
// points and joined with the same cubic-Bézier commands, so SVG <animate> can
// interpolate the path data from one shape to the next (the M3 Expressive morph:
// soft burst → 9-sided cookie → pentagon → pill → sunny → 4-sided cookie → oval).
// ---------------------------------------------------------------------------

const POINTS = 48;
const CENTER = 50;
const EXTENT = 48; // outer radius in the 100×100 viewBox

type RadiusFn = (theta: number) => number;

const lobed =
  (lobes: number, depth: number, turn = 0): RadiusFn =>
  (t) =>
    (EXTENT / (1 + depth)) * (1 + depth * Math.cos(lobes * (t + turn)));

const superellipse =
  (a: number, b: number, exponent: number, turn = 0): RadiusFn =>
  (t) => {
    const c = Math.abs(Math.cos(t + turn)) / a;
    const s = Math.abs(Math.sin(t + turn)) / b;
    return Math.pow(Math.pow(c, exponent) + Math.pow(s, exponent), -1 / exponent);
  };

const SHAPES: RadiusFn[] = [
  lobed(10, 0.09), // soft burst
  lobed(9, 0.07), // 9-sided cookie
  lobed(5, 0.07, Math.PI / 10), // pentagon
  superellipse(EXTENT, 30, 4, Math.PI / 4), // pill
  lobed(8, 0.06), // sunny
  lobed(4, 0.1, Math.PI / 4), // 4-sided cookie
  superellipse(EXTENT, 36, 2, -Math.PI / 4), // oval
];

const round = (n: number) => Math.round(n * 100) / 100;

/** Closed Catmull-Rom spline through the sampled points, written as cubic Béziers. */
function toPath(radius: RadiusFn): string {
  const pts = Array.from({ length: POINTS }, (_, i) => {
    const t = (i / POINTS) * Math.PI * 2;
    const r = radius(t);
    return [CENTER + r * Math.cos(t), CENTER + r * Math.sin(t)] as const;
  });
  const at = (i: number) => pts[(i + POINTS) % POINTS]!;
  let d = `M${round(pts[0]![0])} ${round(pts[0]![1])}`;
  for (let i = 0; i < POINTS; i++) {
    const [x0, y0] = at(i - 1);
    const [x1, y1] = at(i);
    const [x2, y2] = at(i + 1);
    const [x3, y3] = at(i + 2);
    const c1x = x1 + (x2 - x0) / 6;
    const c1y = y1 + (y2 - y0) / 6;
    const c2x = x2 - (x3 - x1) / 6;
    const c2y = y2 - (y3 - y1) / 6;
    d += `C${round(c1x)} ${round(c1y)} ${round(c2x)} ${round(c2y)} ${round(x2)} ${round(y2)}`;
  }
  return `${d}Z`;
}

const PATHS = SHAPES.map(toPath);
const MORPH_MS = 650;
const DURATION = `${(MORPH_MS * SHAPES.length) / 1000}s`;
const KEY_TIMES = Array.from({ length: SHAPES.length + 1 }, (_, i) => round(i / SHAPES.length)).join(";");
// Expressive "fast spatial" easing on every step: a quick move that settles into each shape.
const KEY_SPLINES = Array.from({ length: SHAPES.length }, () => "0.42 0 0.1 1").join(";");
const MORPH_VALUES = [...PATHS, PATHS[0]].join(";");
// Each morph also turns the shape; seven steps add up to two full turns so the loop is seamless.
const STEP_ROTATION = Array.from(
  { length: SHAPES.length + 1 },
  (_, i) => `${round((i * 720) / SHAPES.length)} ${CENTER} ${CENTER}`,
).join(";");

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);
  return reduced;
}

/**
 * A Material Design 3 Expressive loading indicator: an indeterminate
 * `role="progressbar"` whose shape continuously morphs and turns through the seven
 * M3 Expressive shapes, for waits under about five seconds. The default variant
 * draws the shape in primary; the contained variant puts it in on-primary-container
 * over a round primary-container backdrop. Under `prefers-reduced-motion: reduce`
 * the shape stays still and only fades gently. Give it an `aria-label` that says
 * what is loading. Use Md3LinearProgress or Md3CircularProgress when progress is
 * known.
 */
export const Md3LoadingIndicator = React.forwardRef<HTMLDivElement, Md3LoadingIndicatorProps>(
  ({ variant = "default", size = 48, className, style, "aria-label": ariaLabel = "Loading", ...props }, ref) => {
    const reduced = usePrefersReducedMotion();
    const indicator = round((size * 38) / 48);
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-label={ariaLabel}
        className={cn(
          "font-md",
          "inline-flex shrink-0 items-center justify-center",
          variant === "contained"
            ? "rounded-full bg-md-primary-container text-md-on-primary-container"
            : "text-md-primary",
          className,
        )}
        style={{ width: size, height: size, ...style }}
        {...props}
      >
        <svg
          aria-hidden="true"
          focusable="false"
          width={indicator}
          height={indicator}
          viewBox="0 0 100 100"
          className={cn("overflow-visible fill-current", reduced && "animate-pulse")}
        >
          {reduced ? (
            <path d={PATHS[0]} />
          ) : (
            <g>
              <animateTransform
                attributeName="transform"
                type="rotate"
                from={`0 ${CENTER} ${CENTER}`}
                to={`360 ${CENTER} ${CENTER}`}
                dur={DURATION}
                repeatCount="indefinite"
              />
              <path d={PATHS[0]}>
                <animate
                  attributeName="d"
                  values={MORPH_VALUES}
                  keyTimes={KEY_TIMES}
                  keySplines={KEY_SPLINES}
                  calcMode="spline"
                  dur={DURATION}
                  repeatCount="indefinite"
                />
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values={STEP_ROTATION}
                  keyTimes={KEY_TIMES}
                  keySplines={KEY_SPLINES}
                  calcMode="spline"
                  dur={DURATION}
                  repeatCount="indefinite"
                />
              </path>
            </g>
          )}
        </svg>
      </div>
    );
  },
);
Md3LoadingIndicator.displayName = "Md3LoadingIndicator";

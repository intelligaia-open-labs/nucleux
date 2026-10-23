import { HandwritingInput, type HandwritingStroke } from "./index";

/** A pen stroke along a chain of cubic Béziers ([x1, y1, x2, y2, x, y] each), sampled into points. */
function curve(start: [number, number], segments: number[][], at = { x: 22, y: 45.5 }): HandwritingStroke {
  const points = [{ x: start[0] + at.x, y: start[1] + at.y, pressure: 0.5, t: 0 }];
  let [x0, y0] = start;
  for (const [x1, y1, x2, y2, x, y] of segments) {
    for (let i = 1; i <= 12; i++) {
      const t = i / 12, u = 1 - t;
      const px = u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x;
      const py = u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y;
      points.push({ x: px + at.x, y: py + at.y, pressure: 0.5, t: points.length });
    }
    [x0, y0] = [x, y];
  }
  return { pointerType: "mouse", points };
}

// "Q2 revenue trend", as the site's ink.
const INK = [
  curve([10, 42], [
    [20, 20, 38, 15, 52, 35], [60, 45, 68, 38, 80, 28], [95, 15, 110, 18, 118, 30], [128, 44, 138, 30, 150, 28],
    [162, 26, 172, 32, 182, 24], [194, 15, 210, 12, 218, 28], [226, 42, 234, 30, 248, 22], [262, 14, 278, 18, 286, 30],
    [294, 42, 304, 35, 315, 28],
  ]),
  curve([322, 28], [[332, 20, 345, 24, 355, 32], [362, 38, 368, 28, 378, 24]]),
];
const READING = { text: "Q2 revenue trend" };

/** HandwritingInput as nucleux.in's live preview shows it: a line written on the pad, its reading ready to use. */
export function SitePreview() {
  return (
    <HandwritingInput
      compact
      padLabel="Draw or write"
      defaultStrokes={INK}
      defaultRecognition={READING}
      acceptLabel="Use text"
      strokeWidth={2}
      onRecognize={() => READING}
      onAccept={() => {}}
      className="w-[446px] max-w-full"
    />
  );
}

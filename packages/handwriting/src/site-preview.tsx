import { HandwritingInput, type HandwritingStroke } from "./index";

/** A pen stroke along a wavy line, standing in for the written words. */
function wave(fromX: number, toX: number, y: number): HandwritingStroke {
  const points = [];
  for (let x = fromX; x <= toX; x += 4) {
    points.push({ x, y: y + Math.sin(x / 15) * 12 + Math.sin(x / 41) * 4, pressure: 0.5, t: x });
  }
  return { pointerType: "pen", points };
}

const INK = [wave(32, 336, 74), wave(344, 400, 72)];
const READING = { text: "Q2 revenue trend" };

/** HandwritingInput as nucleux.in's live preview shows it: a line written on the pad, its reading ready to use. */
export function SitePreview() {
  return (
    <div className="w-full max-w-[30rem] rounded-xl border border-border bg-background p-4 shadow-sm">
      <HandwritingInput
        compact
        padLabel="Draw or write"
        defaultStrokes={INK}
        defaultRecognition={READING}
        acceptLabel="Use text"
        onRecognize={() => READING}
        onAccept={() => {}}
      />
    </div>
  );
}

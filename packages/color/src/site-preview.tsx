import { AiColor } from "./index";

/** The AI colour as nucleux.in's live preview shows it: a streaming reply on the accent edge, with its words. */
export function SitePreview() {
  return (
    <div className="w-[26rem] max-w-full overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      <AiColor variant="accent-border" working label="Streaming" className="rounded-none">
        Analysing your Q2 numbers
      </AiColor>
    </div>
  );
}

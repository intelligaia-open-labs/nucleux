import { AiColor } from "./index";

/** The AI colour as nucleux.in's live preview shows it: a streaming reply on the accent edge, with its words. */
export function SitePreview() {
  return (
    <AiColor variant="accent-border" working label="Streaming" className="w-[421px] max-w-full bg-muted/50">
      Analysing your Q2 numbers
    </AiColor>
  );
}

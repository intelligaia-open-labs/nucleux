import { ExampleGallery, type ExampleGalleryExample } from "./index";

const EXAMPLES: ExampleGalleryExample[] = [
  { id: "a", title: "A", prompt: "Summarise this week's renewal risks." },
  { id: "b", title: "B", prompt: "Draft a follow-up to the at-risk accounts." },
  { id: "c", title: "C", prompt: "List the decisions and owners from yesterday's standup." },
  { id: "d", title: "D", prompt: "Find anomalies in this week's signup numbers." },
];

/** The example gallery as nucleux.in's live preview shows it: "Try one" above four tinted tiles. */
export function SitePreview() {
  // Place the chosen prompt in your composer; never send it.
  const placeInComposer = (_prompt: string) => {};
  return (
    <div className="w-full max-w-[397.3px] rounded-[8px] border border-border bg-background p-4 shadow-[0_1px_2px_rgba(12,12,10,0.04),0_1px_3px_rgba(12,12,10,0.06)]">
      <ExampleGallery variant="tiles" label="Try one" examples={EXAMPLES} onSelect={placeInComposer} />
    </div>
  );
}

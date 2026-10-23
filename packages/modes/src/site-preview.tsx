import { Modes, type ModeOption } from "./index";

const MODES: ModeOption[] = [
  { id: "fast", name: "Fast", icon: "⚡", meta: "~3 seconds", description: "everyday asks and quick lookups" },
  { id: "balanced", name: "Balanced", icon: "⚖️", shortIcon: null, meta: "~15 seconds", description: "most tasks" },
  { id: "deep", name: "Deep research", shortName: "Deep", icon: "🧠", meta: "~1 minute", description: "multi-source, high-stakes" },
];

/** Modes as nucleux.in's live preview shows it: Fast active, every mode with its speed, the Fast chip in the composer. */
export function SitePreview() {
  return (
    <div className="w-full max-w-[446px]">
      <Modes
        modes={MODES}
        defaultValue="fast"
        clearable={false}
        placeholder="Ask Aria…"
        onSubmit={() => {}}
        onAdd={() => {}}
        onVoice={() => {}}
      />
    </div>
  );
}

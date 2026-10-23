import { useState, type ReactNode } from "react";
import { AgentAvatar } from "@nucleux/agent-avatar";
import { OpenInput, OpenInputModelChip } from "@nucleux/open-input";
import { SuggestedPrompts, type SuggestedPromptItem } from "./index";

// The site's own 12px glyphs: a filled star, code brackets, a document, a paper plane.
const glyph = (d: ReactNode, filled = false) => (
  <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke={filled ? "none" : "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

const PROMPTS: SuggestedPromptItem[] = [
  { title: "Brainstorm 5 creative marketing ideas for a SaaS launch", tag: "Ideation", tone: "warning", icon: glyph(<path d="M12 2l1.5 4.5H18l-3.75 2.75L15.75 14 12 11.25 8.25 14l1.5-4.75L6 6.5h4.5z" />, true) },
  { title: "Analyze this React component for performance bottlenecks", tag: "Code", tone: "info", icon: glyph(<path strokeWidth="2" d="M16 18l6-6-6-6M8 6l-6 6 6 6" />) },
  { title: "Draft a concise summary email from bullet points", tag: "Writing", tone: "success", icon: glyph(<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8" />) },
  { title: "Outline a product roadmap for Q3", tag: "Strategy", tone: "destructive", icon: glyph(<path d="M3 11l19-9-9 19-2-8z" />) },
];

/** SuggestedPrompts as nucleux.in's live preview shows it: an assistant card whose preset actions fill the composer. */
export function SitePreview() {
  const [value, setValue] = useState("");
  const chosen = PROMPTS.find((p) => p.title === value)?.title ?? null;

  return (
    <section aria-label="Aria" className="w-[32.5rem] max-w-full overflow-hidden rounded-2xl border border-border bg-background text-[11px] leading-[1.55] shadow-[0_1px_4px_rgb(0_0_0/0.08)]">
      <header className="flex items-center gap-2.5 border-b border-border px-[18px] py-3.5">
        <AgentAvatar name="Aria" glyph="i" decorative />
        <div className="flex flex-col gap-px">
          <span className="text-[13px] font-semibold leading-none text-foreground">Aria</span>
          <span className="text-[10px] text-faint">AI assistant · ready</span>
        </div>
        <span className="ml-auto flex items-center gap-[5px] text-[10px] text-faint">
          <span aria-hidden="true" className="size-[7px] rounded-full bg-[hsl(142_71%_45%)]" />
          Online
        </span>
      </header>
      <SuggestedPrompts
        variant="card-grid"
        label="Suggested actions"
        aside={
          <span className="rounded-full border border-border bg-[hsl(var(--nx-ink-25))] px-2 py-0.5 text-[10px] font-medium text-faint">
            Preset action
          </span>
        }
        items={PROMPTS}
        afterSelect="mark"
        selectedId={chosen}
        onSelect={setValue}
        className="px-[18px] pb-2.5 pt-3.5"
      />
      <div className="mx-[18px] border-t border-border" />
      <div className="px-[18px] pb-[18px] pt-2.5">
        <OpenInput
          aria-label="Message Aria"
          placeholder="Click a suggestion or type anything…"
          value={value}
          onValueChange={setValue}
          onSubmit={() => setValue("")}
          onAdd={() => {}}
          model={<OpenInputModelChip name="5.5" detail="Instant" aria-haspopup="menu" />}
          onVoice={() => {}}
        />
      </div>
    </section>
  );
}

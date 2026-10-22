import { useState } from "react";
import { Code, FileText, Send, Star } from "lucide-react";
import { AgentAvatar } from "@nucleux/agent-avatar";
import { Badge } from "@nucleux/badge";
import { OpenInput, OpenInputModelChip } from "@nucleux/open-input";
import { SuggestedPrompts, type SuggestedPromptItem } from "./index";

const PROMPTS: SuggestedPromptItem[] = [
  { title: "Brainstorm 5 creative marketing ideas for a SaaS launch", tag: "Ideation", tone: "warning", icon: <Star /> },
  { title: "Analyze this React component for performance bottlenecks", tag: "Code", tone: "info", icon: <Code /> },
  { title: "Draft a concise summary email from bullet points", tag: "Writing", tone: "success", icon: <FileText /> },
  { title: "Outline a product roadmap for Q3", tag: "Strategy", tone: "destructive", icon: <Send /> },
];

/** SuggestedPrompts as nucleux.in's live preview shows it: an assistant card whose preset actions fill the composer. */
export function SitePreview() {
  const [value, setValue] = useState("");
  const chosen = PROMPTS.find((p) => p.title === value)?.title ?? null;

  return (
    <section aria-label="Aria" className="w-[32.5rem] max-w-full overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
      <header className="flex items-center gap-2.5 border-b border-border px-4 py-3.5">
        <AgentAvatar name="Aria" glyph="i" decorative />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">Aria</span>
          <span className="text-xs text-muted-foreground">AI assistant · ready</span>
        </div>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          <span aria-hidden="true" className="size-2 rounded-full bg-success" />
          Online
        </span>
      </header>
      <SuggestedPrompts
        variant="card-grid"
        label="Suggested actions"
        aside={<Badge variant="outline" className="rounded-full font-normal text-muted-foreground">Preset action</Badge>}
        items={PROMPTS}
        afterSelect="mark"
        selectedId={chosen}
        onSelect={setValue}
        className="border-b border-border px-4 pb-4 pt-3.5"
      />
      <div className="p-4">
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

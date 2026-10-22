import { useState } from "react";
import { CircleHelp, Pencil, Shield } from "lucide-react";
import { Md3OpenInput, Md3OpenInputModelChip } from "@nucleux/md3-open-input";
import { Md3SuggestedPrompts, type SuggestedPromptItem } from "./index";

const PROMPTS: SuggestedPromptItem[] = [
  { title: "Summarize release risks", icon: <Shield /> },
  { title: "Find unresolved decisions", icon: <CircleHelp /> },
  { title: "Draft a stakeholder update", icon: <Pencil /> },
];

/** Md3SuggestedPrompts as nucleux.in's live preview shows it: suggestion chips under an empty composer. */
export function SitePreview() {
  const [value, setValue] = useState("");

  return (
    <div className="flex w-[38rem] max-w-full flex-col gap-12">
      <Md3OpenInput
        aria-label="Message Aria"
        placeholder="Ask about this release..."
        value={value}
        onValueChange={setValue}
        onSubmit={() => setValue("")}
        onAdd={() => {}}
        model={<Md3OpenInputModelChip name="Balanced" detail="High" />}
        onVoice={() => {}}
      />
      <Md3SuggestedPrompts items={PROMPTS} onSelect={setValue} className="max-w-lg" />
    </div>
  );
}

import { useState } from "react";
import { OpenInputModelChip } from "@nucleux/open-input";
import { InitialCta } from "./index";

const SUGGESTIONS = [
  { title: "Draft a reply", icon: <span aria-hidden="true">✏️</span> },
  { title: "Summarise notes", icon: <span aria-hidden="true">📊</span> },
  { title: "Find patterns", icon: <span aria-hidden="true">🔍</span> },
];

/** Initial CTA as nucleux.in's live preview shows it: an empty state with one composer and three ways in. */
export function SitePreview() {
  const [value, setValue] = useState("");

  return (
    <div className="w-full rounded-lg border border-border bg-background px-5 py-6 shadow-[0_1px_2px_rgba(12,12,10,0.04),0_1px_3px_rgba(12,12,10,0.06)]">
      <InitialCta
        headline="What can I help with?"
        placeholder="Ask Aria anything…"
        aria-label="Message Aria"
        value={value}
        onValueChange={setValue}
        onSubmit={() => setValue("")}
        onAdd={() => {}}
        model={<OpenInputModelChip name="5.5" detail="Instant" aria-haspopup="menu" />}
        onVoice={() => {}}
        suggestions={SUGGESTIONS}
      />
    </div>
  );
}

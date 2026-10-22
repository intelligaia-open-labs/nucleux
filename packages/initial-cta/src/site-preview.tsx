import { useState } from "react";
import { BarChart3, PenLine, Search } from "lucide-react";
import { OpenInputModelChip } from "@nucleux/open-input";
import { InitialCta } from "./index";

const SUGGESTIONS = [
  { title: "Draft a reply", icon: <PenLine aria-hidden="true" /> },
  { title: "Summarise notes", icon: <BarChart3 aria-hidden="true" /> },
  { title: "Find patterns", icon: <Search aria-hidden="true" /> },
];

/** Initial CTA as nucleux.in's live preview shows it: an empty state with one composer and three ways in. */
export function SitePreview() {
  const [value, setValue] = useState("");

  return (
    <div className="mx-auto w-full max-w-lg rounded-xl border border-border bg-background px-5 py-6 shadow-sm">
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

import { useState } from "react";
import { Input } from "@nucleux/input";
import { Suggestions, type SuggestionItem } from "./index";

const ANSWER = "Three accounts are flagged for renewal risk this quarter. Acme Corp carries the highest ARR at $240k.";

const FOLLOW_UPS: SuggestionItem[] = [
  { id: "why", label: "Why Acme?" },
  { id: "outreach", label: "Draft outreach" },
  { id: "at-risk", label: "See all at-risk" },
];

const QUICK_EDITS: SuggestionItem[] = [
  { id: "shorter", label: "Make it shorter" },
  { id: "formal", label: "Make it formal" },
  { id: "examples", label: "Add examples" },
];

/** Suggestions as nucleux.in's live preview shows them: follow-ups (↳) under an answer, quick edits above the draft. */
export function SitePreview() {
  const [draft, setDraft] = useState("");
  const [asking, setAsking] = useState<string>();

  return (
    <div className="flex w-full max-w-[30rem] flex-col gap-2.5 rounded-[8px] border border-border bg-background p-4 shadow-[0_1px_2px_rgba(12,12,10,0.04),0_1px_3px_rgba(12,12,10,0.06)]">
      <div className="rounded-xl border border-border bg-background p-3.5">
        <p className="border-b border-border pb-3 text-[13px] leading-5 text-foreground">{ANSWER}</p>
        <Suggestions
          variant="follow-up"
          aria-label="Suggested follow-ups"
          suggestions={FOLLOW_UPS}
          pendingId={asking}
          onSelect={(item) => setAsking(item.id)}
          className="mt-2.5"
        />
      </div>
      <Suggestions
        aria-label="Quick edits"
        suggestions={QUICK_EDITS}
        onSelect={(item) => setDraft((d) => (d ? `${d.trim()} ${item.label}.` : `${item.label}.`))}
        className="mb-0.5"
      />
      <Input
        aria-label="Edit your draft"
        placeholder="Edit your draft…"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && setDraft("")}
        className="h-auto rounded-xl border-border px-4 py-[9px] text-[12.5px] leading-[1.55] shadow-none placeholder:text-faint"
      />
    </div>
  );
}

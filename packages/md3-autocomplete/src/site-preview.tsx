import { useRef, useState } from "react";
import { Md3OpenInput, Md3OpenInputModelChip } from "@nucleux/md3-open-input";
import { Md3AutocompleteOverlay } from "./index";

// Requests people here often send; the app would ask its model instead.
const COMPLETIONS = [
  "Summarize the release risks and group them by owner",
  "Compare onboarding feedback with the previous quarter and highlight new issues",
  "Draft a stakeholder update for the September release",
  "Find unresolved decisions blocking the September release",
];

const completionFor = (text: string) =>
  text.trim().length < 10
    ? null
    : COMPLETIONS.find((c) => c.toLowerCase().startsWith(text.toLowerCase()) && c.length > text.length)?.slice(text.length) ?? null;

/** Md3Autocomplete as nucleux.in's live preview shows it: the composer, ready to finish a request people often send. */
export function SitePreview() {
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState("");

  return (
    <div className="relative w-full max-w-[40rem]">
      <Md3OpenInput
        ref={fieldRef}
        aria-label="Message Aria"
        placeholder="Ask Aria about the release"
        value={value}
        onValueChange={setValue}
        onSubmit={() => setValue("")}
        onAdd={() => {}}
        model={<Md3OpenInputModelChip name="Balanced" detail="High" />}
        onVoice={() => {}}
      />
      <Md3AutocompleteOverlay fieldRef={fieldRef} value={value} onValueChange={setValue} suggestion={completionFor(value)} />
    </div>
  );
}

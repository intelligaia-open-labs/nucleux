import { useState } from "react";
import { OpenInput, OpenInputModelChip } from "@nucleux/open-input";
import { Caveat } from "./index";

/** Caveat as nucleux.in's live preview shows it: a quiet caption under the composer. */
export function SitePreview() {
  const [value, setValue] = useState("");

  return (
    <div className="flex w-[30.1rem] max-w-full flex-col gap-2 rounded-[8px] border border-border bg-background p-4 shadow-[0_1px_2px_rgba(12,12,10,0.04),0_1px_3px_rgba(12,12,10,0.06)]">
      <OpenInput
        aria-label="Message the assistant"
        placeholder="Ask me Anything"
        value={value}
        onValueChange={setValue}
        onSubmit={() => setValue("")}
        onAdd={() => {}}
        model={<OpenInputModelChip name="5.5" detail="Instant" aria-haspopup="menu" />}
        onVoice={() => {}}
      />
      <Caveat>The assistant may make mistakes. Verify important info.</Caveat>
    </div>
  );
}

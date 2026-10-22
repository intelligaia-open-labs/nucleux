import { useState } from "react";
import { OpenInput, OpenInputModelChip } from "./index";

const DRAFT =
  "Summarise yesterday's standup notes for the leadership review tomorrow — keep it under three bullet points.";

/** Open Input as nucleux.in's live preview shows it: a written request in the site composer. */
export function SitePreview() {
  const [value, setValue] = useState(DRAFT);

  return (
    <OpenInput
      aria-label="Message Aria"
      placeholder="Ask Aria anything…"
      value={value}
      onValueChange={setValue}
      onSubmit={() => setValue("")}
      onAdd={() => {}}
      model={<OpenInputModelChip name="5.5" detail="Instant" aria-haspopup="menu" />}
      onVoice={() => {}}
      containerClassName="w-full max-w-md"
    />
  );
}

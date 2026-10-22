import { useState } from "react";
import { Autocomplete } from "./index";

const DRAFT = "Hi Sam, following up on our conversation about the renewal";
const COMPLETION = `${DRAFT} — happy to jump on a quick call this week to walk you through the updated proposal.`;
const LIMIT = 4000;

/** Autocomplete as nucleux.in's live preview shows it: a compose box offering the rest of the sentence. */
export function SitePreview() {
  const [value, setValue] = useState(DRAFT);

  return (
    <Autocomplete
      variant="sentence-completion"
      heading="Compose message"
      badge="AI autocomplete"
      value={value}
      onValueChange={setValue}
      suggestion={COMPLETION.startsWith(value) ? COMPLETION : null}
      maxLength={LIMIT}
      footerEnd={`${value.length} / ${LIMIT}`}
      rows={3}
      className="w-[26.25rem] max-w-full"
    />
  );
}

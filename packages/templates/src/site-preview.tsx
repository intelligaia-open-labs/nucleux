import { useState } from "react";
import { Templates, type PromptSegment } from "./index";

const SEGMENTS: PromptSegment[] = [
  "Summarise ",
  { slot: "meeting", placeholder: "[meeting]", label: "Meeting" },
  " in ",
  { slot: "length", placeholder: "[3 bullets]", label: "Length" },
  " for ",
  { slot: "audience", placeholder: "[execs]", label: "Audience" },
  ".",
];

/** The fill-in-the-blank template as nucleux.in's live preview shows it: one sentence with three blanks. */
export function SitePreview() {
  const [values, setValues] = useState<Record<string, string>>({});
  return (
    <Templates
      aria-label="Prompt template"
      segments={SEGMENTS}
      values={values}
      onValuesChange={setValues}
      showSubmit={false}
      className="w-full max-w-[28rem]"
    />
  );
}

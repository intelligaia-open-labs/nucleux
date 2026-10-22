import { useState } from "react";
import { PenLine } from "lucide-react";
import { Md3IconButton } from "@nucleux/md3-icon-button";
import { Md3OpenInput, Md3OpenInputModelChip } from "@nucleux/md3-open-input";
import { Md3HandwritingInput } from "./index";

/** Md3HandwritingInput as nucleux.in's live preview shows it: the pen open above the composer, ready to write. */
export function SitePreview() {
  const [value, setValue] = useState("Next sprint:");
  const [pen, setPen] = useState(true);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      {pen && (
        <Md3HandwritingInput
          compact
          padLabel="Write with a stylus or your finger"
          placeholder="Write here"
          onRecognize={() => ({ text: "ship the export fix" })}
          onAccept={(text) => setValue((v) => `${v} ${text}`)}
          onClose={() => setPen(false)}
          className="rounded-md-xl border border-md-outline-variant bg-md-surface-container-lowest p-4"
        />
      )}
      <Md3OpenInput
        aria-label="Message Aria"
        placeholder="Ask Aria about the redesign…"
        value={value}
        onValueChange={setValue}
        onSubmit={() => setValue("")}
        onAdd={() => {}}
        model={<Md3OpenInputModelChip name="Balanced" detail="High" />}
        actions={
          <Md3IconButton
            aria-label="Write by hand"
            aria-pressed={pen}
            onClick={() => setPen(!pen)}
            className="text-md-primary [&_svg]:size-5"
          >
            <PenLine aria-hidden="true" />
          </Md3IconButton>
        }
        onVoice={() => {}}
      />
    </div>
  );
}

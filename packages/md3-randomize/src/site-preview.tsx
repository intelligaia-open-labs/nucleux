import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Md3OpenInput, Md3OpenInputModelChip } from "@nucleux/md3-open-input";
import { Md3Randomize } from "./index";

const DIRECTIONS = [
  "Launch through customer stories",
  "Turn onboarding failures into a challenge campaign",
  "The 15-minute workspace",
  "Before and after the release",
  "Ask the skeptics",
];

/** Md3Randomize as nucleux.in's live preview shows it: "Try a direction" beside the campaign composer. */
export function SitePreview() {
  const [value, setValue] = useState("");

  return (
    <div className="flex w-[40rem] max-w-full flex-col gap-4">
      <p className="text-center text-sm font-medium tracking-[0.1px] text-md-on-surface-variant">
        Campaign · Planboard 3.0 launch · directions
      </p>
      <Md3Randomize
        label="Try a direction"
        icon={<Sparkles aria-hidden="true" />}
        supportingText="A random starting point for the launch — edit it before you use it."
        prompts={DIRECTIONS}
        draft={value}
        onSelect={(prompt, { mode }) => setValue(mode === "append" ? `${value}\n${prompt}` : prompt)}
      />
      <Md3OpenInput
        aria-label="Message Aria"
        placeholder="Describe the campaign direction"
        value={value}
        onValueChange={setValue}
        onSubmit={() => setValue("")}
        onAdd={() => {}}
        model={<Md3OpenInputModelChip name="Balanced" detail="High" />}
        onVoice={() => {}}
      />
    </div>
  );
}

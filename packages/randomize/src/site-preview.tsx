import { useState } from "react";
import { Randomize } from "./index";

const PROMPTS = [
  "Draft a one-paragraph product brief for an idea you haven't shipped yet.",
  "Write a cold email subject line for a SaaS tool that saves 2 hours a day.",
  "Summarise the jobs-to-be-done framework in five sentences or fewer.",
  "Propose three names for a productivity app aimed at remote teams.",
  "List five underrated features that separate great onboarding from average.",
];

/** Randomize as nucleux.in's live preview shows it: a surprise prompt card with Pick another and Use this. */
export function SitePreview() {
  const [draft, setDraft] = useState("");

  return (
    <div className="w-[421px] max-w-full rounded-lg border border-border bg-background p-5 shadow-sm">
      <Randomize
        variant="random-card"
        // In order, as on the site; an app can pass a shuffled `prompts` pool instead.
        generate={(shown) => PROMPTS[shown.length % PROMPTS.length]}
        draft={draft}
        onSelect={(prompt, { mode }) => setDraft(mode === "append" ? `${draft}\n${prompt}` : prompt)}
      />
    </div>
  );
}

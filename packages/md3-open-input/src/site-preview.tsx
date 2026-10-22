import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Md3OpenInput, Md3OpenInputModelChip } from "./index";

const TURNS = [
  { who: "You", text: "Summarize the biggest risks for the September release." },
  {
    who: "Aria",
    text: "Three risks stand out: the payments migration is two weeks behind, the Android build fails on older devices with no owner, and Legal has not signed off the launch checklist.",
  },
];

/** Md3OpenInput as nucleux.in's live preview shows it: a conversation under way, the working composer docked below. */
export function SitePreview() {
  const [value, setValue] = useState("");

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <ol className="flex flex-col gap-5 px-2" aria-label="Conversation">
        {TURNS.map((turn) => (
          <li key={turn.who} className="flex gap-3">
            <span
              aria-hidden="true"
              className={
                turn.who === "Aria"
                  ? "grid size-7 shrink-0 place-items-center rounded-full bg-md-primary-container text-md-on-primary-container"
                  : "grid size-7 shrink-0 place-items-center rounded-full bg-md-surface-variant text-xs text-md-on-surface-variant"
              }
            >
              {turn.who === "Aria" ? <Sparkles className="size-4" /> : "P"}
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-md-on-surface">{turn.who}</span>
              <p className="text-[0.9375rem] leading-6 text-md-on-surface-variant">{turn.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <Md3OpenInput
        aria-label="Message Aria"
        placeholder="Ask about this project…"
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

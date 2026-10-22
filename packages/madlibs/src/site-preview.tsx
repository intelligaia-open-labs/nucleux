import { Madlibs, type MadlibsBlank } from "./index";

const TEMPLATE = "Write a {tone} reply to {recipient} about {topic}.";

const BLANKS: MadlibsBlank[] = [
  { id: "tone", label: "Tone", options: ["concise", "friendly", "formal"] },
  { id: "recipient", label: "Recipient", options: ["Sam", "Priya", "the team"] },
  { id: "topic", label: "Topic", options: ["the proposal", "their renewal", "a product update"] },
];

const VALUES = { tone: "friendly", recipient: "Sam", topic: "the proposal" };

/** Madlibs as nucleux.in's live preview shows it: a sentence with inline blanks, its preview, then Generate. */
export function SitePreview() {
  return (
    <Madlibs
      template={TEMPLATE}
      blanks={BLANKS}
      defaultValues={VALUES}
      heading="Build your prompt"
      submitLabel="Generate"
      note={null}
      onUse={() => {}}
      className="w-full max-w-[30rem]"
    />
  );
}

import type { Meta, StoryObj } from "@storybook/react";
import { Md3Autocomplete } from "./index";
import { SitePreview as SitePreviewDemo } from "./site-preview";

// A stand-in for the app's model: completes a few familiar requests. Real apps
// pass their own (async) `getSuggestion`.
const phrases = [
  "Hi Sam, following up on our conversation last Tuesday about the renewal",
  "Summarize the renewal risk for Acme Corp and group it by owner",
  "Draft a reply that confirms the Friday deadline",
];
const fromPhrases = async (text: string) => {
  await new Promise((r) => setTimeout(r, 120));
  const hit = phrases.find((p) => p.toLowerCase().startsWith(text.toLowerCase()) && p.length > text.length);
  return hit ? hit.slice(text.length) : null;
};

const meta = {
  title: "Material 3 Agent/Md3Autocomplete",
  component: Md3Autocomplete,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story, { name }) => (name === "Site Preview" ? <Story /> : <div className="w-[32rem] bg-md-surface p-4"><Story /></div>),
  ],
  args: { label: "Prompt", placeholder: "Start typing…", getSuggestion: fromPhrases, onAccept: () => {}, onDismiss: () => {} },
} satisfies Meta<typeof Md3Autocomplete>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As nucleux.in's live preview shows it. */
export const SitePreview: Story = { render: () => <SitePreviewDemo /> };

/** Chat composer: faded text after the caret. Tab accepts, keep typing to ignore, Esc dismisses. */
export const GhostSuffix: Story = {
  args: { variant: "ghost-suffix", defaultValue: "Hi Sam, following up on" },
};

/** Reply box: the agent finishes the whole sentence, with the keys spelled out underneath. */
export const SentenceCompletion: Story = {
  args: {
    variant: "sentence-completion",
    label: "Reply",
    defaultValue: "Thanks for the quick turnaround on the deck.",
    suggestion: " I've shared it with the team and we'll come back with feedback by Friday.",
  },
};

/** Code: a multi-line suggestion in a monospace field. */
export const BlockCompletion: Story = {
  args: {
    variant: "block-completion",
    label: "summarise.ts",
    defaultValue: "async function summarise(text) {",
    suggestion:
      "\n  const summary = await ai.summarise(text);\n  return summary.replace(/\\s+/g, ' ').trim();\n}",
  },
};

/** → accepts instead of Tab, for hosts where Tab must keep moving focus. */
export const RightArrowToAccept: Story = {
  args: { variant: "ghost-suffix", acceptKey: "right", defaultValue: "Summarize the renewal" },
};

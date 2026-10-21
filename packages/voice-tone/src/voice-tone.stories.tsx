import type { Meta, StoryObj } from "@storybook/react";
import { VoiceTone } from "./index";

const meta = {
  title: "Agent/VoiceTone",
  component: VoiceTone,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof VoiceTone>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The three presets of the site's live preview. */
const presets = [
  { id: "professional", name: "Professional", description: "Formal, clear", sample: "Please find the updated proposal attached for your review." },
  { id: "friendly", name: "Friendly", description: "Warm, easy", sample: "Hey! Attached is the updated proposal — let me know what you think!" },
  { id: "direct", name: "Direct", description: "Brief, blunt", sample: "Proposal attached. Review by Friday." },
];

/** Tones for a product update, with Aria's recommendation marked (never applied). */
const updateTones = [
  { id: "professional", name: "Professional", description: "Clear and measured.", sample: "This month we shipped faster onboarding; next, we’re improving imports.", recommended: true },
  { id: "friendly", name: "Friendly", description: "Warm and approachable.", sample: "Here’s what changed this month and what we’re working on next." },
  { id: "conversational", name: "Conversational", description: "Like talking to a colleague.", sample: "So, onboarding got a lot quicker this month — imports are next." },
  { id: "formal", name: "Formal", description: "Precise and impersonal.", sample: "The following summarizes this month’s changes and upcoming priorities." },
  { id: "concise", name: "Concise", description: "As few words as possible.", sample: "Shipped: faster onboarding. Next: imports." },
];

const rules = [
  { id: "no-emojis", label: "No emojis" },
  { id: "uk-english", label: "UK English spelling" },
  { id: "no-passive", label: "Avoid passive voice" },
];

const draft = "Draft a product update for stakeholders.";

const Composer = (args: Story["args"]) => (
  <div className="w-[40rem] max-w-[calc(100vw-2rem)]">
    <VoiceTone {...args} onSubmit={() => {}} />
  </div>
);
const WithPicker = (args: Story["args"]) => (
  <div className="w-[40rem] max-w-[calc(100vw-2rem)] pt-[30rem]">
    <VoiceTone {...args} onSubmit={() => {}} />
  </div>
);

/** The site's live preview: a preferences panel — Professional chosen from three named presets, two rules on, and a sample sentence that recalibrates when the tone changes. */
export const LivePreview: Story = {
  args: { tones: presets, rules, defaultValue: "professional", defaultRuleValues: ["no-emojis", "uk-english"], defaultDraft: draft },
  render: (args) => (
    <div className="w-[40rem] max-w-[calc(100vw-2rem)]">
      <VoiceTone {...args} variant="settings" className="mx-auto" onSubmit={() => {}} />
    </div>
  ),
};

/** Tone presets: a row of named tone profiles in a preferences panel; the chosen one is outlined. */
export const TonePresets: Story = {
  args: { variant: "settings", tones: presets, defaultValue: "professional" },
};

/** Rules list: a custom checklist the agent never breaks — “No emojis”, “UK English spelling”. */
export const RulesList: Story = {
  args: { variant: "settings", tones: [], rules, defaultRuleValues: ["no-emojis", "uk-english"] },
};

/** Tone slider: a linear scale from one end to the other, with the sample sentence for the point chosen. */
export const ToneSlider: Story = {
  args: {
    variant: "settings",
    layout: "slider",
    defaultValue: "friendly",
    tones: [
      { id: "formal", name: "Formal", sample: "Thank you for your message. I will send the document tomorrow." },
      { id: "professional", name: "Professional", sample: "Thanks — I’ll send the document over tomorrow." },
      { id: "friendly", name: "Friendly", sample: "Sounds good — I’ll get that to you tomorrow." },
      { id: "casual", name: "Casual", sample: "Yep, tomorrow it is!" },
    ],
  },
};

/** Default: no tone chosen. A Tone control sits in the composer; Aria uses its default voice. */
export const ComposerDefault: Story = {
  args: { variant: "composer", tones: updateTones, defaultDraft: draft },
  render: Composer,
};

/** Tone picker open: tone cards with one line each, a sample for the one in focus, the recommendation marked — not selected — and a field to describe one. */
export const PickerOpen: Story = {
  args: { variant: "composer", tones: updateTones, defaultDraft: draft, defaultOpen: true },
  render: WithPicker,
};

/** Tone selected: the chip reads “Tone Professional”, with a way to change or remove it. Their text is untouched. */
export const ToneSelected: Story = {
  args: { variant: "composer", tones: updateTones, defaultDraft: draft, defaultValue: "professional" },
  render: Composer,
};

/** Custom tone: their words become the chip, with a note that Aria matches it as closely as it can. */
export const CustomTone: Story = {
  args: {
    variant: "composer",
    tones: updateTones,
    defaultDraft: draft,
    defaultValue: "custom",
    defaultCustomTone: "Calm, plain English for non-experts",
    defaultNotice: "custom",
  },
  render: Composer,
};

/** Tone changed: the chip updates in place; one line says the facts stay the same. */
export const ToneChanged: Story = {
  args: { variant: "composer", tones: updateTones, defaultDraft: draft, defaultValue: "conversational", defaultNotice: "changed" },
  render: Composer,
};

/** Tone removed: the chip goes, Aria uses its default voice, and Undo is offered. */
export const ToneRemoved: Story = {
  args: { variant: "composer", tones: updateTones, defaultDraft: draft, defaultValue: null, defaultNotice: "removed" },
  render: Composer,
};

/** The picker as a list: each tone with its description and sample line. */
export const PickerList: Story = {
  args: { variant: "composer", layout: "list", tones: updateTones, defaultDraft: draft, defaultValue: "professional", defaultOpen: true },
  render: WithPicker,
};

/** The picker as a segmented control: names only, up to four tones, no preview line. */
export const PickerSegmented: Story = {
  args: { variant: "composer", layout: "segmented", tones: updateTones.slice(0, 4), defaultDraft: draft, defaultValue: "friendly", defaultOpen: true },
  render: (args) => (
    <div className="w-[40rem] max-w-[calc(100vw-2rem)] pt-[14rem]">
      <VoiceTone {...args} onSubmit={() => {}} />
    </div>
  ),
};

/** The Tone chip and picker alone, for your own composer's toolbar. */
export const ChipOnly: Story = {
  args: { variant: "chip", tones: updateTones, defaultValue: "professional" },
};

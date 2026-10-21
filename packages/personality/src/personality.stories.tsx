import type { Meta, StoryObj } from "@storybook/react";
import { Personality, PersonalitySampleDialog, PersonalityVoiceCard } from "./index";

const meta = {
  title: "Agent/Personality",
  component: Personality,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-80"><Story /></div>],
  args: { defaultValue: "professional", onValueChange: () => {} },
} satisfies Meta<typeof Personality>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Nudge the agent more formal or more casual for a session. */
export const ToneMatrix: Story = {
  args: {
    defaultValue: "neutral",
    options: [
      { value: "formal", label: "Formal", description: "Full sentences, no contractions." },
      { value: "neutral", label: "Neutral", description: "Calm and precise. Recommended." },
      { value: "casual", label: "Casual", description: "Shorter, warmer, contractions." },
    ],
  },
};

/** One sample utterance plus voice tags — the tone at a glance. */
export const VoiceCard: Story = {
  render: () => (
    <PersonalityVoiceCard
      quote="Here's what I found. Two of these look unusual — I flagged them at the top. Want me to dig in?"
      tags={["calm", "proactive", "never breathless"]}
    />
  ),
};

/** A short exchange in the voice; the fixed line reads the same in every personality. */
export const SampleDialog: Story = {
  render: () => (
    <PersonalitySampleDialog
      agentName="Aria"
      turns={[
        { from: "user", text: "Summarise this thread in three bullets." },
        { from: "agent", text: "Done. Two action items, one open question. Want me to draft a reply?" },
        { from: "agent", text: "Aria will post the recap in #launch, where 24 people can see it.", fixed: true },
      ]}
    />
  ),
};

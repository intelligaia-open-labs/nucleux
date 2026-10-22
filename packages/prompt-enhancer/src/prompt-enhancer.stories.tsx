import type { Meta, StoryObj } from "@storybook/react";
import { CardContainer } from "@nucleux/card";
import { PromptEnhancer, buildEnhancedPrompt, type PromptEnhancerSuggestion } from "./index";

const ORIGINAL = "summarise yesterday's standup";
const SUGGESTION: PromptEnhancerSuggestion = {
  changes: [
    { id: "format", text: " in 3 bullets", reason: "A fixed format keeps the summary short and scannable." },
    {
      id: "audience",
      text: " for the leadership review",
      reason: "Naming the audience sets the level of detail.",
      assumption: "Assumes this is for the leadership review.",
    },
  ],
};
const ENHANCED = buildEnhancedPrompt(ORIGINAL, SUGGESTION.changes ?? []);

// The app supplies the suggestion; no model is called by the component.
const fakeEnhance = () => new Promise<PromptEnhancerSuggestion>((r) => setTimeout(() => r(SUGGESTION), 900));

const meta = {
  title: "Agent/PromptEnhancer",
  component: PromptEnhancer,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { defaultValue: ORIGINAL, hint: "Aria will expand this prompt" },
  render: (args) => (
    <CardContainer className="w-[30rem] max-w-full p-4">
      <PromptEnhancer {...args} onEnhance={fakeEnhance} />
    </CardContainer>
  ),
} satisfies Meta<typeof PromptEnhancer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The site's live preview: the original beside the enhanced prompt, each addition marked and removable. */
export const Enhanced: Story = {
  args: { defaultState: "enhanced", defaultSuggestion: SUGGESTION },
};

/** A short prompt in the composer with the Enhance action beside it. */
export const Original: Story = {};

/** Enhancing: the action becomes a cancel, the original stays untouched. */
export const Enhancing: Story = {
  args: { defaultState: "enhancing" },
};

/** One change removed: it is struck from the suggestion and unticked in the list. */
export const ReviewingChanges: Story = {
  args: { defaultState: "enhanced", defaultSuggestion: SUGGESTION, defaultRemoved: ["format"] },
};

/** Edit: the suggestion in a text field, then Use this or Cancel. */
export const Edited: Story = {
  args: { defaultState: "editing", defaultSuggestion: SUGGESTION },
};

/** Use enhanced: the composer holds the new prompt, unsent, with Undo. */
export const Accepted: Story = {
  args: { defaultState: "accepted", defaultValue: ENHANCED, defaultOriginal: ORIGINAL },
};

/** Undo pressed: the original is back exactly as written. */
export const Reverted: Story = {
  args: { defaultState: "reverted" },
};

/** Enhancement failed: one line says so; the original is unchanged. */
export const Failed: Story = {
  args: { defaultState: "failed" },
};

/** Inline additions instead of before/after columns. */
export const InlineDiff: Story = {
  args: { defaultState: "enhanced", defaultSuggestion: SUGGESTION, diffStyle: "inline" },
};

/** Wand button: the enhancement is applied in place, with Undo. */
export const WandButton: Story = {
  args: { variant: "wand-button" },
};

/** Auto-enhance toggle: when on, short prompts are expanded before they're sent. */
export const AutoEnhanceToggle: Story = {
  args: { variant: "auto-enhance-toggle", defaultAutoEnhance: true },
  render: (args) => (
    <CardContainer className="w-[30rem] max-w-full p-4">
      <PromptEnhancer {...args} onEnhance={fakeEnhance} onSubmit={() => {}} />
    </CardContainer>
  ),
};

/** Request settings: no Enhance tool up front — “Improve prompt” sits in the tune control's menu beside the app's other settings (Mode Plan is on, so the control shows a dot); choosing it starts enhancing and shows the review. */
export const RequestSettings: Story = {
  args: {
    trigger: "settings",
    settingsItems: [
      { id: "mode", label: "Mode", value: "Plan", set: true },
      { id: "tone", label: "Tone", value: "Default" },
      { id: "style", label: "Style", value: "Normal" },
    ],
  },
};

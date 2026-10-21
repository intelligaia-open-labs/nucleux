import type { Meta, StoryObj } from "@storybook/react";
import { buildEnhancedPrompt, type PromptEnhancerSuggestion } from "@nucleux/prompt-enhancer";
import { Md3PromptEnhancer } from "./index";

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
  title: "Material 3 Agent/Md3PromptEnhancer",
  component: Md3PromptEnhancer,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { defaultValue: ORIGINAL, hint: "Aria will expand this prompt" },
  render: (args) => (
    <div className="w-[36rem] max-w-full">
      <Md3PromptEnhancer {...args} onEnhance={fakeEnhance} />
    </div>
  ),
} satisfies Meta<typeof Md3PromptEnhancer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The site's live preview: the review card above the composer, each addition highlighted, explained and removable. */
export const Enhanced: Story = {
  args: { defaultState: "enhanced", defaultSuggestion: SUGGESTION },
};

/** A short prompt in the composer with the Enhance tool beside it. */
export const Original: Story = {};

/** Enhancing: the tool becomes a tonal cancel, the original stays untouched. */
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
    <div className="w-[36rem] max-w-full">
      <Md3PromptEnhancer {...args} onEnhance={fakeEnhance} onSubmit={() => {}} />
    </div>
  ),
};

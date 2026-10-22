import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Md3Randomize } from "./index";
import { SitePreview as SitePreviewDemo } from "./site-preview";

const prompts = [
  "Draft a one-paragraph product brief for an idea you haven't shipped.",
  "Write three subject lines for the spring launch email.",
  "Plan a 30-minute team retro with one surprising question.",
  "Explain our pricing to a ten-year-old.",
  "Turn last week's support tickets into a FAQ.",
];

const meta = {
  title: "Material 3 Agent/Md3Randomize",
  component: Md3Randomize,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story, { name }) => (name === "Site Preview" ? <Story /> : <div className="w-[30rem]"><Story /></div>),
  ],
  args: { prompts, onSelect: () => {} },
} satisfies Meta<typeof Md3Randomize>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As nucleux.in's live preview shows it. */
export const SitePreview: Story = { render: () => <SitePreviewDemo /> };

function WithComposer(props: Partial<React.ComponentProps<typeof Md3Randomize>>) {
  const [draft, setDraft] = useState("");
  return (
    <div className="flex flex-col gap-3">
      <Md3Randomize
        prompts={prompts}
        draft={draft}
        onSelect={(p, { mode }) => setDraft((d) => (mode === "append" ? `${d}\n\n${p}` : p))}
        {...props}
      />
      <textarea
        aria-label="Message Aria"
        className="min-h-20 rounded-md-md border border-md-outline-variant bg-md-surface-container-high p-3 text-sm text-md-on-surface placeholder:text-md-on-surface-variant"
        placeholder="Ask Aria anything…"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
    </div>
  );
}

/** A dice beside the composer — one tap fills it with an editable starter. Type first to see it ask. */
export const DiceButton: Story = {
  args: { variant: "dice-button" },
  render: (args) => <WithComposer variant={args.variant} />,
};

/** A bar with a label: shuffle, preview, then Use this. */
export const ShuffleBar: Story = {
  args: { variant: "shuffle-bar" },
  render: (args) => <WithComposer variant={args.variant} />,
};

/** A card that picks a random starter, with Pick another and a way back. */
export const RandomCard: Story = {
  args: { variant: "random-card" },
  render: (args) => <WithComposer variant={args.variant} />,
};

/** Directions from a model: a working state, then the result. */
export const Generated: Story = {
  args: { variant: "random-card", cardLabel: "Try a direction" },
  render: (args) => (
    <WithComposer
      variant={args.variant}
      cardLabel={args.cardLabel}
      generate={(previous) =>
        new Promise((r) =>
          setTimeout(() => r(`Launch through customer stories (direction ${previous.length + 1})`), 900),
        )
      }
    />
  ),
};

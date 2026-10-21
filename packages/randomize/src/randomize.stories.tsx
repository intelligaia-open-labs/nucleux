import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Randomize } from "./index";

const prompts = [
  "Draft a one-paragraph product brief for an idea you haven't shipped.",
  "Write three subject lines for the spring launch email.",
  "Plan a 30-minute team retro with one surprising question.",
  "Explain our pricing to a ten-year-old.",
  "Turn last week's support tickets into a FAQ.",
];

const meta = {
  title: "Agent/Randomize",
  component: Randomize,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-[30rem]"><Story /></div>],
  args: { prompts, onSelect: () => {} },
} satisfies Meta<typeof Randomize>;

export default meta;
type Story = StoryObj<typeof meta>;

function WithComposer(props: Partial<React.ComponentProps<typeof Randomize>>) {
  const [draft, setDraft] = useState("");
  return (
    <div className="flex flex-col gap-3">
      <Randomize
        prompts={prompts}
        draft={draft}
        onSelect={(p, { mode }) => setDraft((d) => (mode === "append" ? `${d}\n\n${p}` : p))}
        {...props}
      />
      <textarea
        aria-label="Message Aria"
        className="min-h-20 rounded-lg border border-input bg-background p-2 text-sm"
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

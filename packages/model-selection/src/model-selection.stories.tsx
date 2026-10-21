import type { Meta, StoryObj } from "@storybook/react";
import { ModelSelection } from "./index";

const meta = {
  title: "Agent/ModelSelection",
  component: ModelSelection,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="flex min-h-[22rem] w-[24rem] items-start"><Story /></div>],
  args: {
    onValueChange: () => {},
    defaultValue: "5.5-instant",
    models: [
      { value: "5.5-instant", label: "Nebula 5.5 Instant", description: "Fastest — everyday tasks" },
      { value: "5.3", label: "Nebula 5.3", description: "Balanced speed and depth" },
      { value: "5.1-pro", label: "Nebula 5.1 Pro", description: "Deepest reasoning" },
    ],
  },
} satisfies Meta<typeof ModelSelection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Chat: beside the send button — a short list with the recommended model marked, and one that has run out. */
export const ModelDropdown: Story = {
  args: {
    variant: "dropdown",
    defaultValue: "opus",
    models: [
      { value: "opus", label: "Opus 4.6", description: "Hard problems and long documents", recommended: true },
      { value: "sonnet", label: "Sonnet 4.6", description: "Everyday writing and analysis" },
      { value: "haiku", label: "Haiku 4.5", description: "Quick answers", speed: "Fastest" },
      {
        value: "opus-max",
        label: "Opus 4.6 · extended thinking",
        description: "Multi-step reasoning",
        disabled: true,
        unavailableReason: "Limit reached until 3 pm — Opus answers instead",
      },
    ],
  },
};

/** Creative / code: speed, quality and cost in human terms so non-experts can choose well. */
export const ModelTradeoff: Story = {
  args: {
    variant: "tradeoff",
    defaultValue: "sonnet",
    models: [
      { value: "opus", label: "Opus", quality: "Best quality", speed: "Slower", cost: "$$$" },
      { value: "sonnet", label: "Sonnet", quality: "Balanced", speed: "Medium", cost: "$$", recommended: true },
      { value: "haiku", label: "Haiku", quality: "Good enough", speed: "Fastest", cost: "$" },
    ],
  },
};

/** Right rail: on by default — Aria picks per task; switching it off reveals the picker. */
export const AutoRoute: Story = {
  args: {
    variant: "auto-route",
    agentName: "Aria",
    routedModel: "Sonnet",
    defaultValue: "sonnet",
    models: [
      { value: "opus", label: "Opus", description: "Best quality · Slower" },
      { value: "sonnet", label: "Sonnet", description: "Balanced", recommended: true },
      { value: "haiku", label: "Haiku", description: "Fastest" },
    ],
  },
};

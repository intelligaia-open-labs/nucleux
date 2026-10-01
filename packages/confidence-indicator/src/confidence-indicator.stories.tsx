import type { Meta, StoryObj } from "@storybook/react";
import { ConfidenceIndicator } from "./index";

const meta = {
  title: "Agent/ConfidenceIndicator",
  component: ConfidenceIndicator,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-80"><Story /></div>],
  args: { value: 68, label: "Overall confidence" },
} satisfies Meta<typeof ConfidenceIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BelowThreshold: Story = {
  args: {
    value: 68,
    note: "Below the autonomous-action threshold. Human review recommended.",
  },
};

export const HighConfidence: Story = {
  args: { value: 94, note: "Safe to proceed automatically." },
};

export const LowConfidence: Story = {
  args: { value: 32, note: "Not enough evidence — do not act without review." },
};

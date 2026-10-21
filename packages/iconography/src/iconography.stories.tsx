import type { Meta, StoryObj } from "@storybook/react";
import { Iconography } from "./index";

const meta = {
  title: "Agent/Iconography",
  component: Iconography,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { label: "Generate", agentName: "Aria" },
} satisfies Meta<typeof Iconography>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The minimum signal: a single sparkle on a button means "this triggers AI". */
export const SparkleOnly: Story = {
  args: { intent: "generate", label: "Generate", iconOnly: true },
};

/** On primary CTAs the AI action carries its verb. */
export const SparkleLabel: Story = {
  args: { intent: "generate", label: "Generate with Aria" },
};

/** A second mark for actions that change what the user already has. */
export const WandTransform: Story = {
  args: { intent: "transform", label: "Rewrite", variant: "secondary" },
  render: (args) => (
    <div className="flex gap-2">
      <Iconography {...args} />
      <Iconography {...args} label="Enhance" />
      <Iconography {...args} intent="regenerate" label="Regenerate" />
    </div>
  ),
};

/** While the call runs the mark swaps to the working mark and the words say what is happening. */
export const Working: Story = {
  args: { intent: "transform", label: "Rewrite", variant: "secondary", working: true, workingLabel: "Rewriting…" },
};

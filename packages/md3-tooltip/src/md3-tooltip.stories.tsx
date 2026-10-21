import type { Meta, StoryObj } from "@storybook/react";
import { Md3Tooltip } from "./index";
import { Md3Button } from "@nucleux/md3-button";

const meta = {
  title: "Material 3/Tooltip",
  component: Md3Tooltip,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { content: "", children: null },
} satisfies Meta<typeof Md3Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Plain: Story = {
  args: { content: "", children: null },
  render: () => (
    <div className="pt-16">
      <Md3Tooltip content="Add to favorites">
        <Md3Button variant="tonal">Hover me</Md3Button>
      </Md3Tooltip>
    </div>
  ),
};

export const Rich: Story = {
  args: { content: "", children: null },
  render: () => (
    <div className="pt-16">
      <Md3Tooltip
        variant="rich"
        title="Rich tooltip"
        content="Rich tooltips bring attention to a feature with a subhead and supporting text."
        actions={<Md3Button variant="text">Learn more</Md3Button>}
      >
        <Md3Button variant="tonal">Hover me</Md3Button>
      </Md3Tooltip>
    </div>
  ),
};

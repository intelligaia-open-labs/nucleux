import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip } from "./index";
import { Button } from "@nucleux/button";

const meta = {
  title: "Primitives/Tooltip",
  component: Tooltip,
  parameters: { layout: "centered" },
  // `children` is the ReactNode trigger — kept out of `args` (Storybook
  // serializes args and would strip the element) and supplied via each story's
  // `render`; hide the docgen-inferred control.
  argTypes: { children: { control: false } },
  // `children` (the trigger) is required; `null` is a serializable placeholder —
  // each story's `render` supplies the real trigger node.
  args: { content: "Ask Nebula", children: null },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tooltip content="Ask Nebula">
      <Button variant="secondary">Hover me</Button>
    </Tooltip>
  ),
};

export const Sides: Story = {
  render: () => (
    <div className="flex gap-10">
      {(["top", "bottom", "left", "right"] as const).map((side) => (
        <Tooltip key={side} content={`Side: ${side}`} side={side}>
          <Button variant="secondary" size="sm">
            {side}
          </Button>
        </Tooltip>
      ))}
    </div>
  ),
};

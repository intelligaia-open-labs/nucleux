import type { Meta, StoryObj } from "@storybook/react";
import { Progress } from "./index";

const meta = {
  title: "Primitives/Progress",
  component: Progress,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { value: 60 },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Success: Story = { args: { value: 100, indicatorClassName: "bg-success" } };
export const Indeterminate: Story = { args: { value: undefined } };

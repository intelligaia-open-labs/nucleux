import type { Meta, StoryObj } from "@storybook/react";
import { Md3Divider } from "./index";

const meta = {
  title: "Material 3/Divider",
  component: Md3Divider,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Md3Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-64 space-y-3 bg-md-surface p-6 text-sm text-md-on-surface">
      <p>Above</p>
      <Md3Divider />
      <p>Below</p>
    </div>
  ),
};

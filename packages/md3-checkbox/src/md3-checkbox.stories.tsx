import type { Meta, StoryObj } from "@storybook/react";
import { Md3Checkbox } from "./index";

const meta = {
  title: "Material 3/Checkbox",
  component: Md3Checkbox,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Md3Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const States: Story = {
  render: () => (
    <div className="flex items-center gap-2 bg-md-surface p-6">
      <Md3Checkbox defaultChecked aria-label="Checked" />
      <Md3Checkbox aria-label="Unchecked" />
      <Md3Checkbox indeterminate aria-label="Indeterminate" />
      <Md3Checkbox defaultChecked disabled aria-label="Disabled" />
    </div>
  ),
};

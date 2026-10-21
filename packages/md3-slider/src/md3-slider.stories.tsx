import type { Meta, StoryObj } from "@storybook/react";
import { Md3Slider } from "./index";

const meta = {
  title: "Material 3/Slider",
  component: Md3Slider,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Md3Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-72 bg-md-surface p-6">
      <Md3Slider defaultValue={60} aria-label="Volume" />
    </div>
  ),
};

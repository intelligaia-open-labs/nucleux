import type { Meta, StoryObj } from "@storybook/react";
import { Md3TimePicker } from "./index";

const meta = {
  title: "Material 3/TimePicker",
  component: Md3TimePicker,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Md3TimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="bg-md-surface p-6">
      <Md3TimePicker defaultValue={{ hour: 10, minute: 30, period: "AM" }} />
    </div>
  ),
};

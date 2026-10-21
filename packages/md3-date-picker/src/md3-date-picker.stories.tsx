import type { Meta, StoryObj } from "@storybook/react";
import { Md3DatePicker } from "./index";

const meta = {
  title: "Material 3/DatePicker",
  component: Md3DatePicker,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Md3DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="bg-md-surface p-6 pb-96">
      <Md3DatePicker label="Departure" />
    </div>
  ),
};

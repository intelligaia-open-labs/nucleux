import type { Meta, StoryObj } from "@storybook/react";
import { Md3Switch } from "./index";

const meta = {
  title: "Material 3/Switch",
  component: Md3Switch,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Md3Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const States: Story = {
  render: () => (
    <div className="flex items-center gap-4 bg-md-surface p-6">
      <Md3Switch defaultChecked aria-label="Wi-Fi" />
      <Md3Switch aria-label="Bluetooth" />
      <Md3Switch defaultChecked disabled aria-label="Disabled on" />
    </div>
  ),
};

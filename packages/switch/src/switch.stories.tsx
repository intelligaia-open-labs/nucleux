import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Switch } from "./index";

const meta = {
  title: "Primitives/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [on, setOn] = useState(true);
    return <Switch checked={on} onCheckedChange={setOn} aria-label="Notifications" />;
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Switch size="sm" defaultChecked aria-label="Small" />
      <Switch size="md" defaultChecked aria-label="Medium" />
    </div>
  ),
};

export const Disabled: Story = { args: { disabled: true, defaultChecked: true, "aria-label": "Disabled" } };

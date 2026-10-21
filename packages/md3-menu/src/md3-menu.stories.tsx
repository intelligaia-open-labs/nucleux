import type { Meta, StoryObj } from "@storybook/react";
import { Md3Menu, Md3MenuDivider, Md3MenuItem } from "./index";

const meta = {
  title: "Material 3/Menu",
  component: Md3Menu,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Md3Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="bg-md-surface p-6">
      <Md3Menu>
        <Md3MenuItem trailing="⌘N">New</Md3MenuItem>
        <Md3MenuItem trailing="⌘O">Open</Md3MenuItem>
        <Md3MenuDivider />
        <Md3MenuItem>Settings</Md3MenuItem>
      </Md3Menu>
    </div>
  ),
};

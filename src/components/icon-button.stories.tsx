import type { Meta, StoryObj } from "@storybook/react";
import { Bell, Home, Plus } from "lucide-react";
import { IconButton } from "./icon-button";

const meta = {
  title: "Primitives/IconButton",
  component: IconButton,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { "aria-label": "Home", variant: "ghost", size: "md", children: <Home /> },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ghost: Story = {};
export const Active: Story = { args: { variant: "active" } };
export const Solid: Story = { args: { variant: "solid", "aria-label": "New", children: <Plus /> } };

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <IconButton aria-label="Home" variant="ghost">
        <Home />
      </IconButton>
      <IconButton aria-label="Home active" variant="active">
        <Home />
      </IconButton>
      <IconButton aria-label="New" variant="solid">
        <Plus />
      </IconButton>
      <IconButton aria-label="Notifications" variant="ghost" size="lg">
        <Bell />
      </IconButton>
    </div>
  ),
};

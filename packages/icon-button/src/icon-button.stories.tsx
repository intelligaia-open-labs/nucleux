import type { Meta, StoryObj } from "@storybook/react";
import { Bell, Home, Plus } from "lucide-react";
import { IconButton } from "./index";

const meta = {
  title: "Primitives/IconButton",
  component: IconButton,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  // `children` is the icon ReactNode — kept out of `args` (Storybook serializes
  // args and would strip the element) and injected via `render`; hide control.
  argTypes: { children: { control: false } },
  args: { "aria-label": "Home", variant: "ghost", size: "md" },
  render: (args) => <IconButton {...args}><Home /></IconButton>,
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ghost: Story = {};
export const Active: Story = { args: { variant: "active" } };
export const Solid: Story = {
  args: { variant: "solid", "aria-label": "New" },
  render: (args) => <IconButton {...args}><Plus /></IconButton>,
};

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

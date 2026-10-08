import type { Meta, StoryObj } from "@storybook/react";
import { Menu, MoreVertical } from "lucide-react";
import { Md3TopAppBar } from "./index";
import { Md3IconButton } from "@nucleux/md3-icon-button";

const meta = {
  title: "Material 3/TopAppBar",
  component: Md3TopAppBar,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: { headline: "Title" },
} satisfies Meta<typeof Md3TopAppBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = {
  args: { headline: "Title" },
  render: () => (
    <Md3TopAppBar
      headline="Inbox"
      leading={
        <Md3IconButton aria-label="Menu">
          <Menu />
        </Md3IconButton>
      }
      trailing={
        <Md3IconButton aria-label="More">
          <MoreVertical />
        </Md3IconButton>
      }
    />
  ),
};

export const Large: Story = {
  args: { headline: "Title" },
  render: () => <Md3TopAppBar variant="large" headline="Good morning" />,
};

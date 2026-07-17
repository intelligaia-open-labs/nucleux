import type { Meta, StoryObj } from "@storybook/react";
import { ChevronRight, FoldVertical, RotateCw, Trash2, UnfoldVertical } from "lucide-react";
import { Menu, MenuItem, MenuLabel, MenuSeparator } from "./index";

const meta = {
  title: "Navigation/Menu",
  component: Menu,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ContextMenu: Story = {
  render: () => (
    <Menu>
      <MenuLabel>Response</MenuLabel>
      <MenuItem icon={<RotateCw />}>Try again</MenuItem>
      <MenuItem icon={<UnfoldVertical />}>Expand response</MenuItem>
      <MenuItem icon={<FoldVertical />}>Concise response</MenuItem>
      <MenuSeparator />
      <MenuItem trailing={<ChevronRight />}>Transform</MenuItem>
      <MenuItem icon={<Trash2 />} destructive>
        Delete
      </MenuItem>
    </Menu>
  ),
};

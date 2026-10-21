import type { Meta, StoryObj } from "@storybook/react";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "./index";

const meta = {
  title: "Primitives/Menubar",
  component: Menubar,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Menubar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu value="file">
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem trailing="⌘N">New chat</MenubarItem>
          <MenubarItem trailing="⌘O">Open…</MenubarItem>
          <MenubarSeparator />
          <MenubarItem destructive>Delete</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="edit">
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem trailing="⌘Z">Undo</MenubarItem>
          <MenubarItem trailing="⇧⌘Z">Redo</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="view">
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Toggle sidebar</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

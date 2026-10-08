import type { Meta, StoryObj } from "@storybook/react";
import { ContextMenu, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator } from "./index";

const meta = {
  title: "Primitives/ContextMenu",
  component: ContextMenu,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { content: null, children: null },
} satisfies Meta<typeof ContextMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { content: null, children: null },
  render: () => (
    <ContextMenu
      content={
        <>
          <ContextMenuLabel>Actions</ContextMenuLabel>
          <ContextMenuItem>Back</ContextMenuItem>
          <ContextMenuItem trailing="⌘R">Reload</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem destructive>Delete</ContextMenuItem>
        </>
      }
    >
      <div className="grid h-40 w-72 place-items-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
        Right-click here
      </div>
    </ContextMenu>
  ),
};

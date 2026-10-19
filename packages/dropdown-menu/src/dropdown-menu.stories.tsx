import type { Meta, StoryObj } from "@storybook/react";
import { Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./index";

const meta = {
  title: "Primitives/DropdownMenu",
  component: DropdownMenu,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: null },
  render: () => (
    <div className="h-64">
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Actions"
          className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-background hover:bg-accent"
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          <DropdownMenuLabel>Task</DropdownMenuLabel>
          <DropdownMenuItem>
            <Pencil /> Edit <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Copy /> Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            <Trash2 /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
};

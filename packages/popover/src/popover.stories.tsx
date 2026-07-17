import type { Meta, StoryObj } from "@storybook/react";
import { Popover, PopoverContent, PopoverTrigger } from "./index";

const meta = {
  title: "Overlays/Popover",
  component: Popover,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: null },
  render: () => (
    <Popover>
      <PopoverTrigger className="inline-flex h-9 items-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        Open popover
      </PopoverTrigger>
      <PopoverContent>
        <p className="text-sm font-medium text-foreground">Share settings</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage who can view this summary.
        </p>
      </PopoverContent>
    </Popover>
  ),
};

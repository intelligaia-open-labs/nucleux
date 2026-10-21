import type { Meta, StoryObj } from "@storybook/react";
import { ScrollArea } from "./index";

const meta = {
  title: "Primitives/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
  render: () => (
    <ScrollArea className="h-48 w-64 rounded-md border border-border p-4">
      <div className="space-y-2 text-sm text-foreground">
        {Array.from({ length: 20 }, (_, i) => (
          <p key={i}>Message line {i + 1}</p>
        ))}
      </div>
    </ScrollArea>
  ),
};

import type { Meta, StoryObj } from "@storybook/react";
import { HoverCard } from "./index";

const meta = {
  title: "Primitives/HoverCard",
  component: HoverCard,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof HoverCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { trigger: null, content: null },
  render: () => (
    <div className="pt-24">
      <HoverCard
        trigger={
          <button className="rounded-md border border-input px-3 py-1.5 text-sm text-foreground">
            @nucleux
          </button>
        }
        content={
          <div className="space-y-1">
            <p className="font-medium">Nucleux</p>
            <p className="text-muted-foreground">Agentic UI components for React.</p>
          </div>
        }
      />
    </div>
  ),
};

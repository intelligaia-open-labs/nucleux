import type { Meta, StoryObj } from "@storybook/react";
import { MemorySummary } from "./index";

const meta = {
  title: "Agent/MemorySummary",
  component: MemorySummary,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-[28rem]"><Story /></div>],
  args: { groups: [] },
} satisfies Meta<typeof MemorySummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    updatedAt: "Updated 1 minute ago",
    onRefresh: () => {},
    onAdd: () => {},
    groups: [
      { title: "About you", items: ["Works in UX research & design", "Prefers concise answers"] },
      { title: "Projects", items: ["Building an agentic design system", "Ships components as npm packages"] },
    ],
  },
};

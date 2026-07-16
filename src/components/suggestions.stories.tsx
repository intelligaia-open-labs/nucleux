import type { Meta, StoryObj } from "@storybook/react";
import { Suggestions } from "./suggestions";

const meta = {
  title: "Agent/Suggestions",
  component: Suggestions,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[32rem]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Suggestions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      "Show me the highlights",
      "List action items",
      "Draft a follow-up email",
      "Summarize decisions",
    ],
  },
};

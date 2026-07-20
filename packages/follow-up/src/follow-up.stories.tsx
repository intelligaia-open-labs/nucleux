import type { Meta, StoryObj } from "@storybook/react";
import { FollowUp } from "./index";

const meta = {
  title: "Agent/FollowUp",
  component: FollowUp,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[28rem]">
        <Story />
      </div>
    ),
  ],
  args: {
    answer: "Three deals are at risk this quarter.",
    assumption: { label: "Assumed:", value: "Q3", hint: "tap to change" },
  },
} satisfies Meta<typeof FollowUp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

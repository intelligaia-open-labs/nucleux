import type { Meta, StoryObj } from "@storybook/react";
import { SessionRecap } from "./index";

const meta = {
  title: "Agent/SessionRecap",
  component: SessionRecap,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-[28rem]"><Story /></div>],
} satisfies Meta<typeof SessionRecap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Aria sent 3 emails, created 1 Linear issue, and read from 12 documents.",
    action: (
      <button
        type="button"
        className="rounded-md px-2.5 py-1.5 text-sm font-medium text-brand transition-colors hover:bg-brand/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        View full log
      </button>
    ),
  },
};

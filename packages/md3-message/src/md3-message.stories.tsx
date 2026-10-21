import type { Meta, StoryObj } from "@storybook/react";
import { Md3Message } from "./index";

const meta = {
  title: "Material 3/Message",
  component: Md3Message,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof Md3Message>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Conversation: Story = {
  args: { role: "assistant" },
  render: () => (
    <div className="mx-auto flex max-w-lg flex-col gap-4 bg-md-surface p-6">
      <Md3Message role="user" content="Summarize the Q3 renewals at risk." />
      <Md3Message
        role="assistant"
        content="Three enterprise accounts are trending toward churn based on usage decline."
      />
    </div>
  ),
};

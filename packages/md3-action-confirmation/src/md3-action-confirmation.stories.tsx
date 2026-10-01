import type { Meta, StoryObj } from "@storybook/react";
import { Md3ActionConfirmation } from "./index";

const meta = {
  title: "Material 3/ActionConfirmation",
  component: Md3ActionConfirmation,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { title: "" },
} satisfies Meta<typeof Md3ActionConfirmation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Destructive: Story = {
  args: { title: "" },
  render: () => (
    <div className="w-96 bg-md-surface p-6">
      <Md3ActionConfirmation
        title="Send 18 emails?"
        description="This will send outreach to all at-risk accounts. You can't undo this."
        confirmLabel="Send"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    </div>
  ),
};

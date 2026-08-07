import type { Meta, StoryObj } from "@storybook/react";
import { ActionConfirmation } from "./index";

const meta = {
  title: "Agent/ActionConfirmation",
  component: ActionConfirmation,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-[28rem]"><Story /></div>],
} satisfies Meta<typeof ActionConfirmation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HighRisk: Story = {
  args: {
    title: "Send 18 emails?",
    description: "This will send personalized emails to all 18 renewal contacts. You can't undo this.",
    confirmLabel: "Send all",
    cancelLabel: "Cancel",
    onConfirm: () => {},
    onCancel: () => {},
  },
};

export const Standard: Story = {
  args: {
    variant: "default",
    title: "Create a calendar event?",
    description: "I'll add \"Q3 renewal sync\" to your calendar for Thursday 2pm.",
    confirmLabel: "Create event",
    onConfirm: () => {},
    onCancel: () => {},
  },
};

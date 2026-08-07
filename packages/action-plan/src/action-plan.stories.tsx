import type { Meta, StoryObj } from "@storybook/react";
import { ActionPlan, ActionPlanStep } from "./index";

const meta = {
  title: "Agent/ActionPlan",
  component: ActionPlan,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-[30rem]"><Story /></div>],
} satisfies Meta<typeof ActionPlan>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    heading: "Proposed plan",
    description: "Here's how I'll handle the Q3 renewal outreach.",
    onAccept: () => {},
    onEdit: () => {},
    onReject: () => {},
    children: (
      <>
        <ActionPlanStep title="Pull the 12 accounts renewing in Q3" description="From the CRM 'Renewals' view" />
        <ActionPlanStep title="Draft a personalized email per account" description="Using the renewal playbook" />
        <ActionPlanStep title="Queue for your review" description="Nothing sends without approval" />
      </>
    ),
  },
};

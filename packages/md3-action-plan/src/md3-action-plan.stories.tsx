import type { Meta, StoryObj } from "@storybook/react";
import { Md3ActionPlan, Md3ActionPlanStep } from "./index";

const meta = {
  title: "Material 3/ActionPlan",
  component: Md3ActionPlan,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Md3ActionPlan>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-96 bg-md-surface p-6">
      <Md3ActionPlan onAccept={() => {}} onEdit={() => {}} onReject={() => {}}>
        <Md3ActionPlanStep title="Pull renewing accounts" description="From the CRM, next 90 days" />
        <Md3ActionPlanStep title="Draft outreach emails" description="Personalized per account" />
        <Md3ActionPlanStep title="Queue for approval" />
      </Md3ActionPlan>
    </div>
  ),
};

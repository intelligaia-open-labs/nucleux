import type { Meta, StoryObj } from "@storybook/react";
import { Md3Thread } from "./index";
import { Md3Message } from "@nucleux/md3-message";

const meta = {
  title: "Material 3/Thread",
  component: Md3Thread,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Md3Thread>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex h-80 w-96 flex-col rounded-md-lg bg-md-surface">
      <Md3Thread>
        <Md3Message role="user" content="What's at risk this quarter?" />
        <Md3Message role="assistant" content="Three enterprise accounts are trending toward churn." />
        <Md3Message role="user" content="Draft outreach for each." />
      </Md3Thread>
    </div>
  ),
};

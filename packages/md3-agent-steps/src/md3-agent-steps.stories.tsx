import type { Meta, StoryObj } from "@storybook/react";
import { Md3AgentStep, Md3AgentSteps } from "./index";

const meta = {
  title: "Material 3/AgentSteps",
  component: Md3AgentSteps,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Md3AgentSteps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-80 bg-md-surface p-6">
      <Md3AgentSteps>
        <Md3AgentStep status="done" title="Read skill doc" />
        <Md3AgentStep status="active" title="Executing command" progress={60} />
        <Md3AgentStep status="pending" title="Create file" />
      </Md3AgentSteps>
    </div>
  ),
};

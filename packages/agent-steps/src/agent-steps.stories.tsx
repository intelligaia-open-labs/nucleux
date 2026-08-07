import type { Meta, StoryObj } from "@storybook/react";
import { BookOpen, Terminal, Search, Globe, FilePlus } from "lucide-react";
import { AgentSteps, AgentStep } from "./index";

const meta = {
  title: "Agent/AgentSteps",
  component: AgentSteps,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-96"><Story /></div>],
} satisfies Meta<typeof AgentSteps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Working: Story = {
  render: () => (
    <AgentSteps>
      <AgentStep status="done" icon={<BookOpen />} title="Reading skill doc" description="Loaded 4 references" />
      <AgentStep status="done" icon={<Search />} title="Searching the codebase" description="12 matches" />
      <AgentStep
        status="active"
        icon={<Terminal />}
        title="Executing command"
        description="pnpm build"
        progress={60}
      />
      <AgentStep status="pending" icon={<Globe />} title="Browsing documentation" />
      <AgentStep status="pending" icon={<FilePlus />} title="Creating file" />
    </AgentSteps>
  ),
};

export const WithError: Story = {
  render: () => (
    <AgentSteps>
      <AgentStep status="done" title="Fetched data" />
      <AgentStep status="error" title="Write failed" description="Permission denied" />
      <AgentStep status="pending" title="Verify output" />
    </AgentSteps>
  ),
};

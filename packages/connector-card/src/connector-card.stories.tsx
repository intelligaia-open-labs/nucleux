import type { Meta, StoryObj } from "@storybook/react";
import { Github } from "lucide-react";
import { ConnectorCard } from "./index";

const meta = {
  title: "Agent/ConnectorCard",
  component: ConnectorCard,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-[26rem]"><Story /></div>],
} satisfies Meta<typeof ConnectorCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Disconnected: Story = {
  args: {
    name: "GitHub",
    description: "Let the agent read issues, PRs, and code",
    icon: <Github />,
    onConnect: () => {},
  },
};

export const Connected: Story = {
  args: {
    name: "GitHub",
    description: "Reading issues, PRs, and code",
    icon: <Github />,
    connected: true,
    onDisconnect: () => {},
  },
};

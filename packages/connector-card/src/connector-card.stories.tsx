import type { Meta, StoryObj } from "@storybook/react";
import { Github } from "lucide-react";
import { ConnectorCard } from "./index";

const meta = {
  title: "Agent/ConnectorCard",
  component: ConnectorCard,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  // `icon` is a ReactNode — kept out of `args` (Storybook serializes args and
  // would strip the element) and injected via `render`; hide its control.
  argTypes: { icon: { control: false } },
  render: (args) => <ConnectorCard {...args} icon={<Github />} />,
  decorators: [(Story) => <div className="w-[26rem]"><Story /></div>],
} satisfies Meta<typeof ConnectorCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Disconnected: Story = {
  args: {
    name: "GitHub",
    description: "Let the agent read issues, PRs, and code",
    onConnect: () => {},
  },
};

export const Connected: Story = {
  args: {
    name: "GitHub",
    description: "Reading issues, PRs, and code",
    connected: true,
    onDisconnect: () => {},
  },
};

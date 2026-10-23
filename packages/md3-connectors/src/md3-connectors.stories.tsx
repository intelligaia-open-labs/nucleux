import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { BookOpen, Github, HardDrive, MessageSquare } from "lucide-react";
import { Md3Connector, Md3ConnectorList, Md3ConnectorLivePill, Md3ConnectorScopePicker } from "./index";
import { SitePreview as SitePreviewDemo } from "./site-preview";

const meta = {
  title: "Material 3 Agent/Md3Connector",
  component: Md3Connector,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  // `icon` is a ReactNode — kept out of `args` (Storybook serializes args and
  // would strip the element) and injected via `render`; hide its control.
  argTypes: { icon: { control: false } },
  render: (args) => <Md3Connector {...args} icon={<Github />} />,
  decorators: [(Story, { id }) => <div className={id.endsWith("--site-preview") ? "w-[460px]" : "w-[28rem] bg-md-surface p-4"}><Story /></div>],
} satisfies Meta<typeof Md3Connector>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As nucleux.in's live preview shows it. */
export const SitePreview: Story = { args: { name: "Connectors" }, render: () => <SitePreviewDemo /> };

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

/** Before the handoff: the scope list in plain verbs, so nothing is over-granted. */
export const WithScopes: Story = {
  args: {
    name: "Google Drive",
    description: "So Aria can answer from your team's shared docs",
    scopes: ["Read files in folders you choose", "Search file names and contents"],
    onConnect: () => {},
  },
};

/** The state people meet most: connected once, sign-in expired, one press to reconnect. */
export const Expired: Story = {
  args: {
    name: "Slack",
    description: "#sales-pipeline, #renewals",
    status: "expired",
    account: "sam@acme.com",
    onReconnect: () => {},
  },
};

/** Right rail: what's plugged in, what's not — one tap to connect. */
export const ConnectorListStory: Story = {
  name: "Connector list",
  args: { name: "Connectors" },
  render: () => (
    <Md3ConnectorList>
      <Md3Connector name="Google Drive" description="Shared docs" icon={<HardDrive />} connected account="sam@acme.com" onDisconnect={() => {}} />
      <Md3Connector name="Slack" description="Channels you choose" icon={<MessageSquare />} onConnect={() => {}} />
      <Md3Connector name="Notion" description="Team wiki" icon={<BookOpen />} onConnect={() => {}} />
    </Md3ConnectorList>
  ),
};

/** Creative / code: exactly what Aria can read — least privilege, with write asked separately. */
export const ScopePicker: Story = {
  args: { name: "Slack" },
  render: () => <ScopePickerDemo />,
};

function ScopePickerDemo() {
  const [write, setWrite] = React.useState(false);
  return (
    <Md3ConnectorScopePicker
      agentName="Aria"
      defaultValue={["pipeline", "renewals"]}
      scopes={[
        { id: "pipeline", label: "#sales-pipeline" },
        { id: "renewals", label: "#renewals" },
        { id: "general", label: "#general", description: "1,240 members" },
      ]}
      allowWrite={write}
      onAllowWriteChange={setWrite}
    />
  );
}

/** Chat / email: shows the agent is reading from a connector right now. */
export const LiveSourcePill: Story = {
  args: { name: "Drive" },
  render: () => <Md3ConnectorLivePill source="Drive" count={12} />,
};

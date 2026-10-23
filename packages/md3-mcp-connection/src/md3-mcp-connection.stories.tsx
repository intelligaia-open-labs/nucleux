import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Md3McpConnection,
  Md3McpConnectionActionPreview,
  Md3McpConnectionPermission,
  Md3McpConnectionTools,
  type McpConnectionToolInfo,
} from "./index";
import { SitePreview as SitePreviewDemo } from "./site-preview";

const linearTools: McpConnectionToolInfo[] = [
  {
    id: "read_issue",
    title: "Read issue",
    description: "Fetch issue details",
    risk: "read",
    schema: { type: "object", properties: { id: { type: "string", description: "Issue key, e.g. APO-412" } }, required: ["id"] },
  },
  { id: "search_issues", title: "Search issues", description: "Find issues by text, team or label", risk: "read" },
  {
    id: "create_issue",
    title: "Create issue",
    description: "File a new bug",
    risk: "write",
    schema: { type: "object", properties: { title: { type: "string" }, team: { type: "string" } }, required: ["title", "team"] },
  },
  { id: "comment", title: "Comment", description: "Post a comment", risk: "write", error: "400 — body is required" },
  { id: "delete_issue", title: "Delete issue", description: "Permanently remove an issue", risk: "destructive", enabled: false },
];

const meta = {
  title: "Material 3 Agent/Md3McpConnection",
  component: Md3McpConnection,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  // SitePreview fills the canvas like the site's stage; the rest sit in a 30rem column.
  decorators: [(Story, ctx) => (ctx.name === "Site Preview" ? <Story /> : <div className="w-[30rem]"><Story /></div>)],
  args: {
    name: "Linear MCP",
    address: "https://mcp.linear.app/sse",
    status: "connected",
    meta: "5 tools · 2 resources",
    account: "OAuth · sam@acme.com",
    scopes: ["Read issues", "Create and edit issues"],
    onConnect: () => {},
    onDisconnect: () => {},
    onRetry: () => {},
    onAuthenticate: () => {},
  },
} satisfies Meta<typeof Md3McpConnection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As nucleux.in's live preview shows it. */
export const SitePreview: Story = { parameters: { layout: "padded" }, render: () => <SitePreviewDemo /> };

/** Right rail: what the server exposes, grouped by risk; each row inspectable and switchable. */
export const ToolList: Story = {
  render: (args) => <ToolListDemo {...args} />,
};

function ToolListDemo(args: React.ComponentProps<typeof Md3McpConnection>) {
  const [tools, setTools] = React.useState(linearTools);
  return (
    <Md3McpConnection {...args}>
      <Md3McpConnectionTools
        tools={tools}
        onToolEnabledChange={(id, enabled) => setTools((all) => all.map((t) => (t.id === id ? { ...t, enabled } : t)))}
      />
    </Md3McpConnection>
  );
}

/** Chat: before the agent invokes a tool, the call is previewed with Approve, Edit and Never allow. */
export const ActionPreview: Story = {
  render: () => <ActionPreviewDemo />,
};

function ActionPreviewDemo() {
  const [status, setStatus] = React.useState<"pending" | "running" | "done">("pending");
  return (
    <Md3McpConnectionActionPreview
      tool="linear.create_issue"
      args={{ title: "Renewal flow broken", team: "Apollo" }}
      effect="Files a new bug in the Apollo team, assigned to nobody."
      status={status}
      result="Created APO-418 · Renewal flow broken"
      onApprove={() => {
        setStatus("running");
        window.setTimeout(() => setStatus("done"), 1200);
      }}
      onEdit={() => {}}
      onDeny={() => {}}
    />
  );
}

/** A destructive call: the destructive treatment, and the tool's own error kept apart from the server's state. */
export const DestructiveActionError: Story = {
  render: () => (
    <Md3McpConnectionActionPreview
      tool="linear.delete_issue"
      args={{ id: "APO-301" }}
      effect="Permanently deletes APO-301 and its 14 comments. This can't be undone."
      risk="destructive"
      status="error"
      error="403 — you don't have delete rights in Apollo"
      onApprove={() => {}}
      onEdit={() => {}}
      onDeny={() => {}}
    />
  ),
};

/** Code: explicit permission when the AI proposes to use a tool — the trust budget made explicit. */
export const PermissionToggle: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Md3McpConnectionPermission subject="Linear" agentName="Aria" defaultValue="always" />
      <Md3McpConnectionPermission subject="git push --force" agentName="Aria" risk="destructive" />
    </div>
  ),
};

/** Establishing: named steps resolve one at a time — never a percentage. */
export const Connecting: Story = {
  args: { name: "Jira MCP", address: "https://jira.acme.dev/mcp", status: "connecting", stage: "discover", meta: undefined },
};

/** A failed step is named, and the recovery matches it (sign in again, not "retry"). */
export const SignInFailed: Story = {
  args: {
    name: "Jira MCP",
    address: "https://jira.acme.dev/mcp",
    status: "error",
    stage: "authenticate",
    error: "The sign-in expired. Sign in again to rediscover the tools.",
    meta: undefined,
  },
};

/** Not connected yet. */
export const Disconnected: Story = {
  args: { name: "GitHub MCP", address: "https://api.githubcopilot.com/mcp", status: "disconnected", meta: undefined },
};
